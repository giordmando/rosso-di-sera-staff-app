'use client';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ACCESSO STAFF</p>
          <h1>Accedi a Rosso di Sera</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
            Usa Google oppure email/password con MFA TOTP obbligatoria.
          </p>
          <button className="btn btn-primary" onClick={signInWithGoogle} style={{ width: '100%', marginTop: 20 }}>
            Accedi con Google
          </button>
          <p style={{ marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
            Il login email/password sarà completato nella milestone Auth + MFA.
          </p>
        </div>
      </div>
    </main>
  );
}
