import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const PENDING_PATH = path.join(process.cwd(), 'data', 'pending.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const raw = await fs.readFile(PENDING_PATH, 'utf8');
    const pending = JSON.parse(raw || '[]');
    return res.status(200).json({ pending });
  } catch (e) {
    return res.status(200).json({ pending: [] });
  }
}
