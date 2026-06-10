import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="card" style={{ maxWidth: 760 }}>
            <p style={{ color: 'var(--wine)', fontWeight: 800, letterSpacing: 1 }}>ROSSO DI SERA STAFF</p>
            <h1 style={{ fontSize: 54, lineHeight: 1, margin: '16px 0' }}>Gestione espositori, pagamenti ed edizioni.</h1>
            <p style={{ fontSize: 20, color: 'var(--muted)', lineHeight: 1.6 }}>
              App interna per lo staff di Rosso di Sera. Gestisci candidature, cantine, tipologie, quote, pagamenti e sincronizzazione Google Sheet.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" href="/login">Accedi all'app</Link>
              <Link className="btn btn-secondary" href="/candidatura">Form candidatura</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
