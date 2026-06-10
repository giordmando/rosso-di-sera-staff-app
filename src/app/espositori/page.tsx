import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';
import type { Exhibitor } from '@/types/database';

const demoExhibitors: Pick<Exhibitor, 'id' | 'brand_name' | 'company_name' | 'city' | 'province' | 'region' | 'status' | 'email'>[] = [
  { id: 'demo-1', brand_name: 'Cantina Demo', company_name: 'Azienda Agricola Demo', city: 'Porto San Giorgio', province: 'FM', region: 'Marche', status: 'candidatura_ricevuta', email: 'demo@example.com' },
  { id: 'demo-2', brand_name: 'Olio Demo', company_name: 'Frantoio Demo', city: 'Fermo', province: 'FM', region: 'Marche', status: 'in_attesa_pagamento', email: 'olio@example.com' },
];

export default function ExhibitorsPage() {
  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div>
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>GESTIONE</p>
            <h1 style={{ margin: 0 }}>Espositori</h1>
          </div>
          <Link href="/candidatura" className="btn btn-primary">Nuovo espositore</Link>
        </header>

        <section className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: 12 }}>Azienda</th>
                <th style={{ padding: 12 }}>Località</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Stato</th>
                <th style={{ padding: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {demoExhibitors.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>
                    <strong>{item.brand_name}</strong><br />
                    <span style={{ color: 'var(--muted)' }}>{item.company_name}</span>
                  </td>
                  <td style={{ padding: 12 }}>{item.city} ({item.province})</td>
                  <td style={{ padding: 12 }}>{item.email}</td>
                  <td style={{ padding: 12 }}><StatusBadge status={item.status} /></td>
                  <td style={{ padding: 12, textAlign: 'right' }}><Link href={`/espositori/${item.id}`}>Apri</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
