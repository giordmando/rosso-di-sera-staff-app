import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { StatusBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import { EXHIBITOR_STATUSES } from '@/lib/constants';
import { updateExhibitor } from '@/lib/actions/exhibitors';
import { COMUNI_BY_PROVINCE, PROVINCES, REGION_OPTIONS } from '@/lib/geo/marche';
import { PaymentForm } from './PaymentForm';
import { PaymentHistory } from './PaymentHistory';
import { StaffActivities } from './StaffActivities';

export default async function ExhibitorDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ saved?: string; activity?: string }> }) {
  const { id } = await params;
  const feedback = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const { data: item } = await supabase.from('exhibitors').select('*').eq('id', id).single();
  if (!item) notFound();
  const { data: payments } = await supabase.from('payments').select('*').eq('exhibitor_id', id).order('created_at', { ascending: false });
  const { data: activities } = await supabase.from('staff_activities').select('id, activity_type, outcome, notes, follow_up_at, completed, created_at, profiles(full_name,email)').eq('exhibitor_id', id).order('created_at', { ascending: false });
  const paymentRows = payments ?? [];
  const paidTotal = paymentRows.reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0);
  const expectedAmount = 183;
  const province = item.province ?? '';
  const cityOptions = province && COMUNI_BY_PROVINCE[province] ? COMUNI_BY_PROVINCE[province] : [];
  const savedMessage = feedback.saved === 'ok' ? 'Espositore aggiornato correttamente.' : feedback.saved === 'error' ? 'Errore durante il salvataggio dell’espositore.' : '';
  const activityMessage = feedback.activity === 'created' ? 'Attività registrata correttamente.' : feedback.activity === 'completed' ? 'Follow-up completato.' : feedback.activity === 'error' ? 'Errore durante il salvataggio dell’attività.' : '';

  return <><main><AppHeader /><div className="container page"><div className="page-header"><div><Link href="/espositori" className="btn btn-secondary">Torna agli espositori</Link><p className="eyebrow" style={{ marginTop: 24 }}>Scheda espositore</p><h1 className="page-title">{item.brand_name}</h1><p className="muted"><StatusBadge status={item.status} /></p></div></div>{savedMessage ? <div className="card" style={{ marginBottom: 20, borderColor: feedback.saved === 'ok' ? 'rgba(31,120,68,.35)' : 'var(--wine)' }}><strong>{feedback.saved === 'ok' ? '✓' : '⚠'} {savedMessage}</strong></div> : null}{activityMessage ? <div className="card" style={{ marginBottom: 20 }}><strong>✓ {activityMessage}</strong></div> : null}<div className="grid grid-2"><section className="card"><h2>Dati espositore</h2><p className="muted">Aggiorna informazioni, località, stato e note interne.</p><form action={updateExhibitor} className="grid" style={{ marginTop: 24 }}><input type="hidden" name="id" value={item.id} /><label><span>Stato</span><select name="status" defaultValue={item.status}>{EXHIBITOR_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label><label><span>Nome azienda / cantina</span><input name="brand_name" defaultValue={item.brand_name ?? ''} required /></label><label><span>Ragione sociale</span><input name="company_name" defaultValue={item.company_name ?? ''} /></label><div className="form-grid"><label><span>Referente</span><input name="contact_name" defaultValue={item.contact_name ?? ''} /></label><label><span>Email</span><input name="email" defaultValue={item.email ?? ''} /></label></div><div className="form-grid"><label><span>Telefono</span><input name="phone" defaultValue={item.phone ?? ''} /></label><label><span>Regione</span><select name="region" defaultValue={item.region ?? 'Marche'}>{REGION_OPTIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select></label></div><div className="form-grid"><label><span>Provincia</span><select name="province" defaultValue={province}><option value="">Seleziona</option>{PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span>Comune</span><select name="city" defaultValue={item.city ?? ''}><option value="">Seleziona</option>{cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}{item.city && !cityOptions.includes(item.city) ? <option value={item.city}>{item.city}</option> : null}</select></label></div><label><span>Prodotti</span><textarea name="products" defaultValue={item.products ?? ''} rows={4} /></label><label><span>Racconto azienda</span><textarea name="company_story" defaultValue={item.company_story ?? ''} rows={4} /></label><label><span>Note interne</span><textarea name="internal_notes" defaultValue={item.internal_notes ?? ''} rows={4} /></label><button className="btn btn-primary" type="submit">Salva modifiche</button></form></section><section className="card"><p className="eyebrow">Pagamenti</p><h2>Situazione quota</h2><div className="grid grid-2" style={{ marginTop: 18, marginBottom: 24 }}><div className="card" style={{ boxShadow: 'none' }}><p className="muted">Quota prevista</p><strong className="stat-value">€ {expectedAmount.toFixed(2)}</strong></div><div className="card" style={{ boxShadow: 'none' }}><p className="muted">Totale pagato</p><strong className="stat-value">€ {paidTotal.toFixed(2)}</strong></div></div><PaymentForm exhibitorId={item.id} expectedAmount={expectedAmount} /><h3 style={{ marginTop: 28 }}>Storico pagamenti</h3><PaymentHistory payments={paymentRows} exhibitorId={item.id} expectedAmount={expectedAmount} /></section></div><StaffActivities exhibitorId={item.id} editionId={item.edition_id} activities={(activities ?? []) as any} /></div></main><AppFooter /></>;
}
