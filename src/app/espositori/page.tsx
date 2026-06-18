import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { GoogleSheetExportButton } from '@/components/GoogleSheetExportButton';
import { createClient } from '@/lib/supabase/server';
import { getStaffProfile } from '@/lib/auth/profile';
import { getActiveEdition } from '@/lib/editions/active';
import { BulkExhibitorsTable, type BulkExhibitorRow } from './BulkExhibitorsTable';
import type { Exhibitor } from '@/types/database';

type ExhibitorRow = Pick<Exhibitor, 'id' | 'brand_name' | 'company_name' | 'city' | 'province' | 'region' | 'status' | 'email'>;
type PageSearchParams = Promise<{ province?: string; region?: string }>;

function unique(values: Array<string | null>) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'it'));
}

function clean(value: string | undefined) {
  return String(value ?? '').trim();
}

export default async function ExhibitorsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const staff = await getStaffProfile();
  const activeEdition = await getActiveEdition();
  const selectedProvince = clean(params.province);
  const selectedRegion = clean(params.region);
  const { data: allExhibitors } = await supabase.from('exhibitors').select('province, region').eq('edition_id', activeEdition.id);
  let query = supabase.from('exhibitors').select('id, brand_name, company_name, city, province, region, status, email').eq('edition_id', activeEdition.id).order('created_at', { ascending: false });
  if (selectedProvince) query = query.ilike('province', selectedProvince);
  if (selectedRegion) query = query.ilike('region', selectedRegion);
  const { data: exhibitors, error } = await query;
  const rows = (exhibitors ?? []) as ExhibitorRow[];
  const provinces = unique((allExhibitors ?? []).map((item) => item.province));
  const regions = unique((allExhibitors ?? []).map((item) => item.region));

  return (
    <>
      <main>
        <AppHeader />
        <div className="container page">
          <header className="page-header">
            <div>
              <p className="eyebrow">Gestione</p>
              <h1 className="page-title">Espositori</h1>
              <p className="muted">Valuta candidature, filtra per area geografica e aggiorna lo stato degli espositori.</p>
            </div>
            <nav className="toolbar page-actions">
              <GoogleSheetExportButton />
              <a href="/api/export/exhibitors" className="btn btn-secondary">Esporta CSV</a>
              <Link href="/candidatura" className="btn btn-primary">Nuovo espositore</Link>
            </nav>
          </header>

          <form className="card form-row filter-card" action="/espositori">
            <label><span>Regione</span><select name="region" defaultValue={selectedRegion}><option value="">Tutte</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label><span>Provincia</span><select name="province" defaultValue={selectedProvince}><option value="">Tutte</option>{provinces.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button className="btn btn-primary" type="submit">Filtra</button>
            <Link className="btn btn-secondary" href="/espositori">Reset</Link>
            <span className="muted result-count">{rows.length} risultati</span>
          </form>

          {error ? <div className="card" style={{ color: 'var(--wine)' }}>Errore caricamento: {error.message}</div> : null}
          <BulkExhibitorsTable rows={rows as BulkExhibitorRow[]} isAdmin={staff?.role === 'admin'} />
        </div>
      </main>
      <AppFooter />
    </>
  );
}
