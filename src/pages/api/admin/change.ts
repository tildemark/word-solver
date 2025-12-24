import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const ADMIN_PATH = path.join(process.cwd(), 'data', 'admin.json');

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
    const provided = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
    try {
      const raw = await fs.readFile(path.join(process.cwd(), 'data', 'admin.json'), 'utf8');
      const obj = JSON.parse(raw || '{}');
      const adminToken = obj.token;
      if (adminToken && provided === adminToken) authorized = true;
    } catch (e) {
      // ignore
    }
  }
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
  console.debug('/api/admin/change: session=', sessionPresent, 'sessionRole=', sessionRole, 'providedHeader=', providedHeader, 'adminJsonPresent=', adminJsonPresent);
  if (!authorized) {
    if (process.env.NODE_ENV === 'development') {
      return res.status(401).json({ error: 'Unauthorized', debug: { sessionPresent, sessionRole, providedHeader: !!providedHeader, adminJsonPresent } });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { newPassword } = req.body || {};
  if (!newPassword || typeof newPassword !== 'string' || !/^[\w!@#$%^&*()\-+=]{4,100}$/.test(newPassword)) {
    return res.status(400).json({ error: 'Invalid new password (4-100 chars)' });
  }

  await fs.mkdir(path.dirname(ADMIN_PATH), { recursive: true });
  await fs.writeFile(ADMIN_PATH, JSON.stringify({ token: newPassword }, null, 2), 'utf8');
  return res.status(200).json({ ok: true });
}
