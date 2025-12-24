import React from 'react';
import { SessionProvider } from 'next-auth/react';
import '../app/globals.css';

export default function App({ Component, pageProps }: any) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
