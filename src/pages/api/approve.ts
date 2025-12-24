import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const DATA_DICT = path.join(process.cwd(), 'data', 'dictionary.json');
const PENDING_PATH = path.join(process.cwd(), 'data', 'pending.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions as any);
  let authorized = false;
  if (session && ((session as any).role === 'admin' || (session.user as any)?.role === 'admin')) {
    authorized = true;
  } else if (session && ((session.user as any)?.id === 'admin' || (session.user as any)?.name === 'Admin')) {
    // fallback: some sessions may not include role; treat known admin user as admin
    authorized = true;
  } else {
    // fallback: allow header x-admin-token matching data/admin.json for convenience
    const provided = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
    try {
      const raw = await fs.readFile(path.join(process.cwd(), 'data', 'admin.json'), 'utf8');
      const obj = JSON.parse(raw || '{}');
      const adminToken = obj.token;
      if (adminToken && provided === adminToken) authorized = true;
    } catch (e) {
      // no admin.json -> nothing
    }
  }
  // Diagnostic logging
  const sessionPresent = !!session;
  const sessionRole = (session as any)?.role || (session?.user as any)?.role || null;
  const providedHeader = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
  let adminJsonPresent = false;
  try {
    const rawAdmin = await fs.readFile(path.join(process.cwd(), 'data', 'admin.json'), 'utf8');
    const adm = JSON.parse(rawAdmin || '{}');
    adminJsonPresent = !!adm.token;
  } catch (e) {
    adminJsonPresent = false;
  }
  console.debug('/api/approve: session=', sessionPresent, 'sessionRole=', sessionRole, 'providedHeader=', providedHeader, 'adminJsonPresent=', adminJsonPresent);
  if (!authorized) {
    if (process.env.NODE_ENV === 'development') {
      return res.status(401).json({ error: 'Unauthorized', debug: { sessionPresent, sessionRole, providedHeader: !!providedHeader, adminJsonPresent } });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, word } = req.body || {};
  if (!id && !word) return res.status(400).json({ error: 'Provide id or word to approve' });

  try {
    // Read pending
    let pendingRaw = '[]';
    try { pendingRaw = await fs.readFile(PENDING_PATH, 'utf8'); } catch (e) { pendingRaw = '[]'; }
    const pending = JSON.parse(pendingRaw || '[]');
    let entryIndex = -1;
    if (id) entryIndex = pending.findIndex((p: any) => p.id === id.toString());
    if (word && entryIndex === -1) {
      const target = String(word).trim().toLowerCase();
      entryIndex = pending.findIndex((p: any) => String(p.word || '').trim().toLowerCase() === target);
    }

    let approvedWord = word ? String(word).trim().toLowerCase() : undefined;
    if (entryIndex !== -1) {
      approvedWord = pending[entryIndex].word;
      pending.splice(entryIndex, 1);
      await fs.writeFile(PENDING_PATH, JSON.stringify(pending, null, 2), 'utf8');
    }

    if (!approvedWord) return res.status(404).json({ error: 'Pending entry not found' });

    // Validate approved word strictly
    if (typeof approvedWord !== 'string' || !/^[a-z]{1,50}$/.test(approvedWord)) {
      return res.status(400).json({ error: 'Invalid word format' });
    }

    // Append to data dictionary (avoid duplicates)
    let dictList: string[] = [];
    try { dictList = JSON.parse(await fs.readFile(DATA_DICT, 'utf8') || '[]'); } catch (e) { dictList = []; }
    if (dictList.includes(approvedWord)) return res.status(409).json({ error: 'Already in dictionary' });

    dictList.push(approvedWord);
    await fs.writeFile(DATA_DICT, JSON.stringify(dictList, null, 2), 'utf8');
    return res.status(200).json({ added: true, word: approvedWord });
  } catch (e) {
    console.error('approve error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
