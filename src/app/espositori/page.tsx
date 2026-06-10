import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import type { Exhibitor } from '@/types/database';

type ExhibitorRow = Pick<Exhibitor, 'id' | 'brand_name' | 'company_name' | 'city' | 'province' | 'region' | 'status' | 'email'>;

export default async function ExhibitorsPage() {
  const supabase = await createClient();
  const { data: exhibitors, error } = await supabase
    .from('exhibitors')
    .select('id, brand_name, company_name, city, province, region, status, email')
    .order('created_at', { ascending: false });

  const rows = (exhibitors ?? []) as ExhibitorRow[];

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

        {error ? <div className="card" style={{ color: 'var(--wine)' }}>Errore caricamento: {error.message}</div> : null}

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
              {rows.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>
                    <strong>{item.brand_name}</strong><br />
                    <span style={{ color: 'var(--muted)' }}>{item.company_name ?? '-'}</span>
                  </td>
                  <td style={{ padding: 12 }}>{item.city ?? '-'} {item.province ? `(${item.province})` : ''}</td>
                  <td style={{ padding: 12 }}>{item.email ?? '-'}</td>
                  <td style={{ padding: 12 }}><StatusBadge status={item.status} /></td>
                  <td style={{ padding: 12, textAlign: 'right' }}><Link href={`/espositori/${item.id}`}>Apri</Link></td>
                </tr>
              ))}
              {rows.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, color: 'var(--muted)' }}>Nessun espositore presente.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
