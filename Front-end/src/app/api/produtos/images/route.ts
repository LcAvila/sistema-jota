import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'assets', 'produtos');
    const exists = fs.existsSync(dir);
    if (!exists) {
      return NextResponse.json({ images: [] }, { status: 200 });
    }
    const files = fs.readdirSync(dir);
    const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    const images = files
      .filter(f => allowed.has(path.extname(f).toLowerCase()))
      .map(f => ({
        file: f,
        url: `/assets/produtos/${f}`,
        name: path.parse(f).name,
      }));
    return NextResponse.json({ images }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to read images' }, { status: 500 });
  }
}
