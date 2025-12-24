import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_DICT = path.join(DATA_DIR, 'dictionary.json');
const PENDING_PATH = path.join(DATA_DIR, 'pending.json');

// Simple in-memory rate limiter (per-IP)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // max submissions per IP per window
const buckets: Map<string, { ts: number; count: number }> = new Map();

async function ensureDataFiles() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch (e) {}
  try { await fs.access(DATA_DICT); } catch (e) {
    // bootstrap from public/dictionary.txt if present
    try {
      const pub = path.join(process.cwd(), 'public', 'dictionary.txt');
      const txt = await fs.readFile(pub, 'utf8');
      const list = txt.split('\n').map(l => l.trim()).filter(Boolean);
      await fs.writeFile(DATA_DICT, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      await fs.writeFile(DATA_DICT, '[]', 'utf8');
    }
  }
  try { await fs.access(PENDING_PATH); } catch (e) { await fs.writeFile(PENDING_PATH, '[]', 'utf8'); }
}

function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip) || { ts: now, count: 0 };
  if (now - b.ts > RATE_LIMIT_WINDOW) { b.ts = now; b.count = 0; }
  b.count += 1;
  buckets.set(ip, b);
  return b.count <= RATE_LIMIT_MAX;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDataFiles();

  // Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const { word } = req.body || {};
  if (!word || typeof word !== 'string') return res.status(400).json({ error: 'Missing word' });

  const clean = word.trim().toLowerCase();
  if (!/^[a-z]+$/.test(clean)) return res.status(400).json({ error: 'Word must contain only letters' });

  try {
    const dictRaw = await fs.readFile(DATA_DICT, 'utf8');
    const list = JSON.parse(dictRaw || '[]') as string[];
    if (list.includes(clean)) return res.status(409).json({ error: 'Word already exists' });

    // Try to verify via public dictionary API
    let verified = false;
    try {
      const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`);
      if (r.ok) verified = true;
    } catch (e) { verified = false; }

    if (verified) {
      list.push(clean);
      await fs.writeFile(DATA_DICT, JSON.stringify(list, null, 2), 'utf8');
      return res.status(200).json({ added: true, auto: true, word: clean });
    }

    // Not verified: add to pending list
    const pendingRaw = await fs.readFile(PENDING_PATH, 'utf8');
    const pending = JSON.parse(pendingRaw || '[]');
    const entry = { id: Date.now().toString(), word: clean, submittedAt: new Date().toISOString() };
    pending.push(entry);
    await fs.writeFile(PENDING_PATH, JSON.stringify(pending, null, 2), 'utf8');
    return res.status(202).json({ added: false, pending: true, id: entry.id });
  } catch (err) {
    console.error('submit-word error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
