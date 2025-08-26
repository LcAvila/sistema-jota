#!/usr/bin/env node
/*
  Seed products into the Neon database by parsing the front-end catalog (src/data/products.ts).
  - Requires: DATABASE_URL configured to Neon in Back-End/.env
  - Usage: node scripts/seedProducts.mjs
*/
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the front-end products source
const FRONT_PRODUCTS_PATH = path.resolve(__dirname, '../../Front-end/src/data/products.ts');

function slugify(str) {
  return String(str)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 24);
}

function genSku(name) {
  const s = slugify(name).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${s ? s : 'SKU'}-${rnd}`;
}

function genCode(name) {
  const base = slugify(name).toUpperCase();
  // Deterministic code to avoid duplicates on multiple runs
  return `${base || 'PROD'}`;
}

function parseFrontProducts(tsSource) {
  // Very lightweight parser to extract entries from `export const products = [ {...}, {...} ];`
  // It looks for object literals and extracts name, price, image, category fields.
  const out = [];
  // Grab the array body
  const arrayMatch = tsSource.match(/export\s+const\s+products\s*:\s*[^=]*=\s*\[(\s*[\s\S]*?)\]\s*;/);
  if (!arrayMatch) return out;
  const body = arrayMatch[1];

  // Split by top-level object boundaries (rudimentary; relies on formatting with leading `{`)
  const objects = body.split(/\n\s*\{/).map((chunk, i) => (i === 0 ? chunk : '{' + chunk));
  for (const obj of objects) {
    // Extract fields
    const name = obj.match(/\bname\s*:\s*"([^"]+)"/i)?.[1];
    const priceStr = obj.match(/\bprice\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1];
    const image = obj.match(/\bimage\s*:\s*"([^"]+)"/i)?.[1];
    const category = obj.match(/\bcategory\s*:\s*"([^"]+)"/i)?.[1];

    if (name && priceStr) {
      const price = Number(priceStr);
      out.push({ name, price, image: image || null, category: category || null });
    }
  }
  return out;
}

async function main() {
  console.log('Reading catalog from:', FRONT_PRODUCTS_PATH);
  if (!fs.existsSync(FRONT_PRODUCTS_PATH)) {
    console.error('Front-end products.ts not found. Abort.');
    process.exit(1);
  }
  const tsSource = fs.readFileSync(FRONT_PRODUCTS_PATH, 'utf8');
  const items = parseFrontProducts(tsSource);

  if (!items.length) {
    console.error('No products parsed from front-end catalog. Abort.');
    process.exit(1);
  }

  console.log(`Parsed ${items.length} products. Upserting categories...`);
  // Upsert categories first
  const catNames = Array.from(new Set(items.map(p => (p.category || '').trim()).filter(Boolean)));
  const catMap = new Map();
  for (const name of catNames) {
    const cat = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    catMap.set(name, cat.id);
  }

  console.log('Creating products...');
  let created = 0, skipped = 0, failed = 0;
  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    const code = genCode(p.name);
    try {
      await prisma.product.create({
        data: {
          name: p.name,
          price: Number(p.price),
          cost: Number((Number(p.price) * 0.7).toFixed(2)),
          stock: 0,
          sku: genSku(p.name),
          code,
          imageUrl: p.image,
          categoryId: p.category ? catMap.get(p.category) : undefined,
          active: true,
        },
      });
      created++;
    } catch (e) {
      // Handle unique conflicts gracefully (e.g., existing code or SKU)
      if (e?.code === 'P2002') { skipped++; }
      else { failed++; console.error('Create failed for', p.name, e?.message || e); }
    }
  }

  console.log(`Done. Created: ${created}, Skipped(dups): ${skipped}, Failed: ${failed}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
