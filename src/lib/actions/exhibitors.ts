'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff, requireAdmin } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';
import { normalizeProvince, normalizeRegion } from '@/lib/geo/normalize';
import type { ExhibitorStatus } from '@/types/database';

function idsFromForm(formData: FormData) {
  return formData.getAll('ids').map((id) => String(id)).filter(Boolean);
}

export async function updateExhibitor(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || 'candidatura_ricevuta') as ExhibitorStatus;
  const brandName = String(formData.get('brand_name') || '');
  if (!id) return;
  const { error } = await supabase.from('exhibitors').update({
    brand_name: brandName,
    company_name: String(formData.get('company_name') || '') || null,
    contact_name: String(formData.get('contact_name') || '') || null,
    email: String(formData.get('email') || '') || null,
    phone: String(formData.get('phone') || '') || null,
    city: String(formData.get('city') || '') || null,
    province: normalizeProvince(String(formData.get('province') || '')),
    region: normalizeRegion(String(formData.get('region') || '')),
    products: String(formData.get('products') || '') || null,
    company_story: String(formData.get('company_story') || '') || null,
    internal_notes: String(formData.get('internal_notes') || '') || null,
    status,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (!error) await writeAuditLog({ action: 'exhibitor.update', entityType: 'exhibitor', entityId: id, message: `Aggiornato espositore ${brandName}`, metadata: { status } });
  revalidatePath(`/espositori/${id}`);
  revalidatePath('/espositori');
  revalidatePath('/dashboard');
  redirect(`/espositori/${id}?saved=${error ? 'error' : 'ok'}`);
}

export async function bulkUpdateExhibitorStatus(formData: FormData) {
  await requireActiveStaff();
  const ids = idsFromForm(formData);
  const status = String(formData.get('status') || '') as ExhibitorStatus;
  if (!ids.length) return { ok: false, message: 'Nessun espositore selezionato.' };
  if (!status) return { ok: false, message: 'Stato mancante.' };
  const supabase = await createClient();
  const { error } = await supabase.from('exhibitors').update({ status, updated_at: new Date().toISOString() }).in('id', ids);
  if (error) return { ok: false, message: `Errore aggiornamento: ${error.message}` };
  await writeAuditLog({ action: 'exhibitor.bulk_status_update', entityType: 'exhibitor', message: `Aggiornati ${ids.length} espositori`, metadata: { ids, status, count: ids.length } });
  revalidatePath('/espositori');
  revalidatePath('/dashboard');
  return { ok: true, message: `Aggiornati ${ids.length} espositori.` };
}

export async function bulkDeleteExhibitors(formData: FormData) {
  await requireAdmin();
  const ids = idsFromForm(formData);
  if (!ids.length) return { ok: false, message: 'Nessun espositore selezionato.' };
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('exhibitors').delete().in('id', ids);
  if (error) return { ok: false, message: `Errore eliminazione: ${error.message}` };
  await writeAuditLog({ action: 'exhibitor.bulk_delete', entityType: 'exhibitor', message: `Eliminati ${ids.length} espositori`, metadata: { ids, count: ids.length } });
  revalidatePath('/espositori');
  revalidatePath('/dashboard');
  return { ok: true, message: `Eliminati ${ids.length} espositori.` };
}
