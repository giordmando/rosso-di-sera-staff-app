'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';

function value(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim(); }

export async function createEdition(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const isActive = formData.get('is_active') === 'on';
  if (isActive) await supabase.from('editions').update({ is_active: false }).neq('year', -1);
  const payload = {
    year: Number(value(formData, 'year')),
    name: value(formData, 'name') || `Rosso di Sera ${value(formData, 'year')}`,
    location: value(formData, 'location') || 'Villa Bonaparte, Porto San Giorgio',
    max_exhibitors: Number(value(formData, 'max_exhibitors') || 45),
    exhibitor_fee: Number(value(formData, 'exhibitor_fee') || 183),
    google_spreadsheet_id: value(formData, 'google_spreadsheet_id') || null,
    is_active: isActive,
  };
  const { data, error } = await supabase.from('editions').insert(payload).select('id').single();
  if (!error) await writeAuditLog({ action: 'edition.create', entityType: 'edition', entityId: data?.id, message: `Creata edizione ${payload.year}`, metadata: payload });
  revalidatePath('/edizioni');
  revalidatePath('/dashboard');
  redirect(`/edizioni?edition=${error ? 'create-error' : 'created'}`);
}

export async function updateEdition(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const id = value(formData, 'id');
  const isActive = formData.get('is_active') === 'on';
  if (isActive) await supabase.from('editions').update({ is_active: false }).neq('id', id);
  const payload = {
    name: value(formData, 'name'),
    location: value(formData, 'location'),
    max_exhibitors: Number(value(formData, 'max_exhibitors') || 45),
    exhibitor_fee: Number(value(formData, 'exhibitor_fee') || 183),
    google_spreadsheet_id: value(formData, 'google_spreadsheet_id') || null,
    is_active: isActive,
  };
  const { error } = await supabase.from('editions').update(payload).eq('id', id);
  if (!error) await writeAuditLog({ action: 'edition.update', entityType: 'edition', entityId: id, message: `Aggiornata edizione ${payload.name}`, metadata: payload });
  revalidatePath('/edizioni');
  revalidatePath('/dashboard');
  redirect(`/edizioni?edition=${error ? 'update-error' : 'updated'}`);
}
