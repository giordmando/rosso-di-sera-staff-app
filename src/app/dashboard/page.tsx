import Link from 'next/link';

const stats = [
  { label: 'Espositori', value: '45' },
  { label: 'Confermati', value: '0' },
  { label: 'In attesa pagamento', value: '0' },
  { label: 'Incasso previsto', value: '€ 8.235' },
];

export default function DashboardPage() {
  return (
    <main>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', marginBottom: 32 }}>
          <div>
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ROSSO DI SERA 2026</p>
            <h1 style={{ margin: 0 }}>Dashboard staff</h1>
          </div>
          <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn-secondary" href="/espositori">Espositori</Link>
            <Link className="btn btn-secondary" href="/pagamenti">Pagamenti</Link>
            <Link className="btn btn-primary" href="/candidatura">Nuova candidatura</Link>
          </nav>
        </header>

        <section className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
          {stats.map((item) => (
            <div className="card" key={item.label}>
              <p style={{ color: 'var(--muted)' }}>{item.label}</p>
              <strong style={{ fontSize: 36, color: 'var(--wine)' }}>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="card" style={{ marginTop: 28 }}>
          <h2>Prossime attività</h2>
          <ul style={{ lineHeight: 2 }}>
            <li>Collegare Supabase e applicare schema/policy.</li>
            <li>Completare login email/password + MFA.</li>
            <li>Implementare tabella espositori dinamica.</li>
            <li>Preparare export/import Google Sheet.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
