import Link from 'next/link';
import { CandidatureForm } from './CandidatureForm';

export default function CandidaturePage() {
  return (
    <main>
      <section style={{ padding: '32px 0 56px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-secondary">Torna alla dashboard</Link>
            <Link href="/espositori" className="btn btn-secondary">Elenco espositori</Link>
          </div>
          <div className="card" style={{ maxWidth: 920, margin: '0 auto' }}>
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ROSSO DI SERA 2026</p>
            <h1>Candidatura espositore</h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Compila il modulo per proporre la tua azienda. La candidatura sara valutata dallo staff. I posti disponibili sono limitati.
            </p>
            <CandidatureForm />
          </div>
        </div>
      </section>
    </main>
  );
}
