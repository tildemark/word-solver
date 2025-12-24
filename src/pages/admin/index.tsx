import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session } = useSession();
  const [fallbackToken, setFallbackToken] = useState<string | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [newPass, setNewPass] = useState('');

  useEffect(() => { fetchPending(); }, [session]);
  useEffect(() => { try { setFallbackToken(sessionStorage.getItem('adminPassword')); } catch (e) { setFallbackToken(null); } }, [session]);

  async function fetchPending() {
    setLoading(true);
    try {
      const res = await fetch('/api/pending', { credentials: 'include' });
      const data = await res.json();
      setPending(data.pending || []);
    } catch (e) {
      setMessage('Failed to load pending');
    } finally { setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const pass = loginPass;
    const res = await signIn('credentials', { password: pass, redirect: false });
    if (res && (res as any).ok) {
      try { sessionStorage.setItem('adminPassword', pass); setFallbackToken(pass); console.log('stored fallback admin token'); } catch (e) {}
      setLoginPass('');
      setMessage('Logged in');
      fetchPending();
    } else {
      setMessage('Invalid password');
    }
  }

  function logout() { try { sessionStorage.removeItem('adminPassword'); } catch (e) {} signOut({ redirect: false }); setMessage('Logged out'); }

  async function approve(idOrWord: string) {
    setMessage(null);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      try { const tok = sessionStorage.getItem('adminPassword'); if (tok) headers['x-admin-token'] = tok; } catch (e) {}
      const res = await fetch('/api/approve', { method: 'POST', headers, credentials: 'include', body: JSON.stringify({ id: idOrWord }) });
      if (res.ok) { setMessage('Approved'); fetchPending(); }
      else { const d = await res.json(); setMessage(JSON.stringify(d)); }
    } catch (e) { setMessage('Network error'); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setMessage(null);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      try { const tok = sessionStorage.getItem('adminPassword'); if (tok) headers['x-admin-token'] = tok; } catch (e) {}
      const res = await fetch('/api/admin/change', { method: 'POST', headers, credentials: 'include', body: JSON.stringify({ newPassword: newPass }) });
      if (res.ok) { setNewPass(''); setMessage('Password changed'); }
      else { const d = await res.json(); setMessage(JSON.stringify(d)); }
    } catch (e) { setMessage('Network error'); }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Admin — Approvals</h1>
        {!session ? (
          <form onSubmit={handleLogin} className="space-y-2">
            <label className="block text-sm">Enter admin password (default: changeme)</label>
            <input value={loginPass} onChange={e=>setLoginPass(e.target.value)} className="p-2 rounded bg-slate-800" />
            <div>
              <button className="px-3 py-1 bg-emerald-600 rounded">Login</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>Authenticated as {(session.user as any)?.name || 'admin'}</div>
              <div className="space-x-2">
                <button onClick={logout} className="px-3 py-1 bg-red-600 rounded">Logout</button>
              </div>
            </div>

            <form onSubmit={changePassword} className="space-y-2">
              <label className="text-sm">Change password</label>
              <div className="flex gap-2">
                <input value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="new password" className="flex-1 p-2 rounded bg-slate-800" />
                <button className="px-3 py-1 bg-amber-600 rounded">Change</button>
              </div>
            </form>

            <div className="text-xs text-slate-400">Fallback token: {fallbackToken || 'none'}</div>

            <div>
              <h2 className="font-semibold">Pending submissions ({pending.length})</h2>
              {loading ? <p>Loading...</p> : (
                <div className="space-y-2 mt-2">
                  {pending.map(p => (
                    <div key={p.id} className="p-2 bg-slate-800 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{p.word}</div>
                        <div className="text-xs text-slate-400">{p.submittedAt}</div>
                      </div>
                      <div className="space-x-2">
                        <button onClick={()=>approve(p.id)} className="px-3 py-1 bg-emerald-600 rounded">Approve</button>
                        <button onClick={()=>approve(p.word)} className="px-3 py-1 bg-slate-700 rounded">Approve by word</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {message && <div className="text-sm text-slate-300">{message}</div>}
      </div>
    </main>
  );
}
