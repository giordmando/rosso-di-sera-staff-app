'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server non configurato');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function createProfile(formData: FormData) {
  await requireAdmin();
  const supabase = adminClient();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();
  const role = String(formData.get('role') || 'operator') === 'admin' ? 'admin' : 'operator';
  if (!email) redirect('/utenti?user=create-error');
  const { error } = await supabase.from('staff_access').upsert({ email, full_name: fullName || null, role, is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'email' });
  if (!error) await writeAuditLog({ action: 'staff_access.upsert', entityType: 'staff_access', entityId: email, message: `Autorizzato accesso staff ${email}`, metadata: { role } });
  revalidatePath('/utenti');
  redirect(`/utenti?user=${error ? 'create-error' : 'created'}`);
}

export async function updateProfile(formData: FormData) {
  const current = await requireAdmin();
  const supabase = adminClient();
  const id = String(formData.get('id') || '');
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const role = String(formData.get('role') || 'operator');
  const nextActive = formData.get('is_active') === 'on';
  if (!id) redirect('/utenti?user=update-error');
  if (email === current.email && !nextActive) redirect('/utenti?user=self-disable-error');
  const { error } = await supabase.from('staff_access').update({ full_name: String(formData.get('full_name') || '') || null, role: role === 'admin' ? 'admin' : 'operator', is_active: nextActive, updated_at: new Date().toISOString() }).eq('id', id);
  if (!error) await writeAuditLog({ action: 'staff_access.update', entityType: 'staff_access', entityId: id, message: `Aggiornato accesso staff ${email}`, metadata: { role, isActive: nextActive } });
  revalidatePath('/utenti');
  redirect(`/utenti?user=${error ? 'update-error' : 'updated'}`);
}
