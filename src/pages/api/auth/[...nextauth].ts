import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const pass = credentials?.password;
        const stored = await getStoredToken();
        const envToken = process.env.ADMIN_TOKEN;
        if (pass && (pass === stored || (!stored && envToken && pass === envToken))) {
          return { id: 'admin', name: 'Admin', role: 'admin' };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.role = (user as any).role || token.role;
      return token;
    },
    async session({ session, token }: any) {
      (session.user as any).role = token.role;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  jwt: {},
  pages: { signIn: '/admin' },
};

export default NextAuth(authOptions as any);
