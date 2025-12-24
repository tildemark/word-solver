import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const ADMIN_PATH = path.join(process.cwd(), 'data', 'admin.json');

async function getStoredToken() {
  try {
    const raw = await fs.readFile(ADMIN_PATH, 'utf8');
    const obj = JSON.parse(raw || '{}');
    return obj.token as string | undefined;
  } catch (e) {
    return undefined;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password } = req.body || {};
  if (!password || typeof password !== 'string') return res.status(400).json({ error: 'Missing password' });

  const stored = await getStoredToken();
  const envToken = process.env.ADMIN_TOKEN;
  if (stored && password === stored) return res.status(200).json({ ok: true });
  if (!stored && envToken && password === envToken) return res.status(200).json({ ok: true });
  return res.status(401).json({ error: 'Invalid credentials' });
}
