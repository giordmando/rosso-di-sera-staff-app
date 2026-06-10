import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { GoogleSheetExportButton } from '@/components/GoogleSheetExportButton';
import { StatusBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import type { Exhibitor } from '@/types/database';

type ExhibitorRow = Pick<Exhibitor, 'id' | 'brand_name' | 'company_name' | 'city' | 'province' | 'region' | 'status' | 'email'>;

function unique(values: Array<string | null>) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'it'));
}

export default async function ExhibitorsPage({ searchParams }: { searchParams?: { province?: string; region?: string } }) {
  const supabase = await createClient();
  const selectedProvince = searchParams?.province ?? '';
  const selectedRegion = searchParams?.region ?? '';
  const { data: allExhibitors } = await supabase.from('exhibitors').select('province, region');
  let query = supabase.from('exhibitors').select('id, brand_name, company_name, city, province, region, status, email').order('created_at', { ascending: false });
  if (selectedProvince) query = query.eq('province', selectedProvince);
  if (selectedRegion) query = query.eq('region', selectedRegion);
  const { data: exhibitors, error } = await query;
  const rows = (exhibitors ?? []) as ExhibitorRow[];
  const provinces = unique((allExhibitors ?? []).map((item) => item.province));
  const regions = unique((allExhibitors ?? []).map((item) => item.region));

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div><p style={{ color: 'var(--wine)', fontWeight: 800 }}>GESTIONE</p><h1 style={{ margin: 0 }}>Espositori</h1></div>
          <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><GoogleSheetExportButton /><a href="/api/export/exhibitors" className="btn btn-secondary">Esporta CSV</a><Link href="/candidatura" className="btn btn-primary">Nuovo espositore</Link></nav>
        </header>
        <form className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: 6 }}><span>Regione</span><select name="region" defaultValue={selectedRegion}><option value="">Tutte</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label style={{ display: 'grid', gap: 6 }}><span>Provincia</span><select name="province" defaultValue={selectedProvince}><option value="">Tutte</option>{provinces.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button className="btn btn-primary" type="submit">Filtra</button>
          <Link className="btn btn-secondary" href="/espositori">Reset</Link>
          <span style={{ color: 'var(--muted)' }}>{rows.length} risultati</span>
        </form>
        {error ? <div className="card" style={{ color: 'var(--wine)' }}>Errore caricamento: {error.message}</div> : null}
        <section className="card" style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th style={{ padding: 12 }}>Azienda</th><th style={{ padding: 12 }}>Località</th><th style={{ padding: 12 }}>Regione</th><th style={{ padding: 12 }}>Email</th><th style={{ padding: 12 }}>Stato</th><th style={{ padding: 12 }}></th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: 12 }}><strong>{item.brand_name}</strong><br /><span style={{ color: 'var(--muted)' }}>{item.company_name ?? '-'}</span></td><td style={{ padding: 12 }}>{item.city ?? '-'} {item.province ? `(${item.province})` : ''}</td><td style={{ padding: 12 }}>{item.region ?? '-'}</td><td style={{ padding: 12 }}>{item.email ?? '-'}</td><td style={{ padding: 12 }}><StatusBadge status={item.status} /></td><td style={{ padding: 12, textAlign: 'right' }}><Link href={`/espositori/${item.id}`}>Apri</Link></td></tr>)}{rows.length === 0 ? <tr><td colSpan={6} style={{ padding: 24, color: 'var(--muted)' }}>Nessun espositore presente.</td></tr> : null}</tbody></table></section>
      </div>
    </main>
  );
}
