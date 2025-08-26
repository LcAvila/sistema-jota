#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'public', 'assets', 'logo', 'logo.png');
const OUT_DIR = path.join(ROOT, 'public', 'icons');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function generate() {
  // Verifica arquivo fonte
  try {
    await fs.stat(SRC);
  } catch {
    console.error(`Arquivo de origem não encontrado: ${SRC}`);
    process.exit(1);
  }

  await ensureDir(OUT_DIR);

  const tasks = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
  ];

  for (const t of tasks) {
    const out = path.join(OUT_DIR, t.name);
    await sharp(SRC)
      .resize(t.size, t.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(out);
    console.log(`Gerado: ${out}`);
  }

  console.log('Ícones gerados com sucesso. Atualize o manifest e o layout se necessário.');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
