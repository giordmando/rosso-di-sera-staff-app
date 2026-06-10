'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function MfaPage() {
  const supabase = createClient();

  async function continueToDashboard() {
    window.location.href = '/dashboard';
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: 'var(--wine)', fontWeight: 800 }}>VERIFICA MFA</p>
          <h1>Verifica a due fattori</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
            Questa schermata prepara il flusso MFA TOTP. Nel prossimo step verranno aggiunti enrollment, QR code e verifica codice.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={continueToDashboard}>Continua alla dashboard</button>
            <button className="btn btn-secondary" onClick={signOut}>Esci</button>
          </div>
          <p style={{ marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
            Temporaneo: quando il flusso TOTP sarà completato, l'accesso email/password resterà bloccato fino alla verifica.
          </p>
          <p><Link href="/login" style={{ color: 'var(--wine)', fontWeight: 700 }}>Torna al login</Link></p>
        </div>
      </div>
    </main>
  );
}
