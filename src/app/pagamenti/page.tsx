import { AppHeader } from '@/components/AppHeader';

const payments = [
  { id: 'p1', exhibitor: 'Cantina Demo', expected: 183, paid: 0, status: 'Non pagato' },
  { id: 'p2', exhibitor: 'Olio Demo', expected: 183, paid: 183, status: 'Pagato' },
];

export default function PaymentsPage() {
  const expected = payments.reduce((sum, item) => sum + item.expected, 0);
  const paid = payments.reduce((sum, item) => sum + item.paid, 0);

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <p style={{ color: 'var(--wine)', fontWeight: 800 }}>GESTIONE</p>
        <h1>Pagamenti</h1>
        <section className="grid grid-2" style={{ marginBottom: 24 }}>
          <div className="card"><p>Incasso previsto</p><strong style={{ fontSize: 36 }}>€ {expected.toFixed(2)}</strong></div>
          <div className="card"><p>Incassato</p><strong style={{ fontSize: 36, color: 'var(--wine)' }}>€ {paid.toFixed(2)}</strong></div>
        </section>
        <section className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th style={{ padding: 12 }}>Espositore</th><th style={{ padding: 12 }}>Previsto</th><th style={{ padding: 12 }}>Pagato</th><th style={{ padding: 12 }}>Stato</th></tr></thead>
            <tbody>{payments.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: 12 }}>{item.exhibitor}</td><td style={{ padding: 12 }}>€ {item.expected.toFixed(2)}</td><td style={{ padding: 12 }}>€ {item.paid.toFixed(2)}</td><td style={{ padding: 12 }}>{item.status}</td></tr>)}</tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
