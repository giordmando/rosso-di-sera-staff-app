'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  async function signInWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    router.push('/mfa');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ACCESSO STAFF</p>
          <h1>Accedi a Rosso di Sera</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
            Usa Google oppure email e password. Per email/password la verifica MFA TOTP è obbligatoria.
          </p>

          <button className="btn btn-primary" onClick={signInWithGoogle} style={{ width: '100%', marginTop: 20 }}>
            Accedi con Google
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

          <form onSubmit={signInWithEmail} style={{ display: 'grid', gap: 14 }}>
            <label>Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required style={inputStyle} />
            </label>
            <label>Password
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required style={inputStyle} />
            </label>
            <button className="btn btn-secondary" disabled={loading} type="submit">
              {loading ? 'Accesso in corso...' : 'Accedi con email'}
            </button>
          </form>

          {message ? <p style={{ color: 'var(--wine)', fontWeight: 700 }}>{message}</p> : null}
          <p style={{ marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
            Dopo il login email/password verrai indirizzato alla verifica MFA.
          </p>
          <p style={{ marginTop: 16 }}><Link href="/" style={{ color: 'var(--wine)', fontWeight: 700 }}>Torna alla home</Link></p>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 8,
  padding: 12,
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'white',
};
