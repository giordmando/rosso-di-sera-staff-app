import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { GoogleSheetExportButton } from '@/components/GoogleSheetExportButton';
import { StatusBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import type { Exhibitor } from '@/types/database';

type ExhibitorRow = Pick<Exhibitor, 'id' | 'brand_name' | 'company_name' | 'city' | 'province' | 'region' | 'status' | 'email'>;
function unique(values: Array<string | null>) { return Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'it')); }

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

  return <main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Gestione</p><h1 className="page-title">Espositori</h1><p className="muted">Valuta candidature, filtra per area geografica e aggiorna lo stato degli espositori.</p></div><nav className="toolbar"><GoogleSheetExportButton /><a href="/api/export/exhibitors" className="btn btn-secondary">Esporta CSV</a><Link href="/candidatura" className="btn btn-primary">Nuovo espositore</Link></nav></header>
    <form className="card form-row" style={{ marginBottom: 20 }}><label style={{ display: 'grid', gap: 6, minWidth: 180 }}><span>Regione</span><select name="region" defaultValue={selectedRegion}><option value="">Tutte</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label style={{ display: 'grid', gap: 6, minWidth: 160 }}><span>Provincia</span><select name="province" defaultValue={selectedProvince}><option value="">Tutte</option>{provinces.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button className="btn btn-primary" type="submit">Filtra</button><Link className="btn btn-secondary" href="/espositori">Reset</Link><span className="muted">{rows.length} risultati</span></form>
    {error ? <div className="card" style={{ color: 'var(--wine)' }}>Errore caricamento: {error.message}</div> : null}
    <section className="card table-wrap"><table className="table"><thead><tr><th>Azienda</th><th>Località</th><th>Regione</th><th>Email</th><th>Stato</th><th></th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.brand_name}</strong><br /><span className="muted">{item.company_name ?? '-'}</span></td><td>{item.city ?? '-'} {item.province ? `(${item.province})` : ''}</td><td>{item.region ?? '-'}</td><td>{item.email ?? '-'}</td><td><StatusBadge status={item.status} /></td><td style={{ textAlign: 'right' }}><Link className="btn btn-soft" href={`/espositori/${item.id}`}>Apri</Link></td></tr>)}{rows.length === 0 ? <tr><td colSpan={6} className="muted">Nessun espositore presente.</td></tr> : null}</tbody></table></section>
  </div></main>;
}
