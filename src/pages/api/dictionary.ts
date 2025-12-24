import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'dictionary.json');
const PUBLIC_PATH = path.join(process.cwd(), 'public', 'dictionary.txt');

async function ensureDataDictionary() {
  try {
    await fs.access(DATA_PATH);
  } catch (e) {
    // bootstrap from public/dictionary.txt
    try {
      const txt = await fs.readFile(PUBLIC_PATH, 'utf8');
      const list = txt.split('\n').map(l => l.trim()).filter(Boolean);
      await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
      await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      await fs.writeFile(DATA_PATH, '[]', 'utf8');
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDataDictionary();
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const list = JSON.parse(raw || '[]');
    return res.status(200).json({ dictionary: list });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read dictionary' });
  }
}
