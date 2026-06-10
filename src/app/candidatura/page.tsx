import { CandidatureForm } from './CandidatureForm';

export default function CandidaturePage() {
  return (
    <main>
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="card" style={{ maxWidth: 920, margin: '0 auto' }}>
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ROSSO DI SERA 2026</p>
            <h1>Candidatura espositore</h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Compila il modulo per proporre la tua azienda. La candidatura sarà valutata dallo staff. I posti disponibili sono limitati.
            </p>
            <CandidatureForm />
          </div>
        </div>
      </section>
    </main>
  );
}
