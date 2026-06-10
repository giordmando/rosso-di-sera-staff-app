'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth/profile';

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

  if (!email) return;

  const { error } = await supabase.from('staff_access').upsert({
    email,
    full_name: fullName || null,
    role,
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });

  if (error) throw new Error(error.message);
  revalidatePath('/utenti');
}

export async function updateProfile(formData: FormData) {
  const current = await requireAdmin();
  const supabase = adminClient();
  const id = String(formData.get('id') || '');
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const role = String(formData.get('role') || 'operator');
  const nextActive = formData.get('is_active') === 'on';

  if (!id) return;
  if (email === current.email && !nextActive) throw new Error('Non puoi disattivare il tuo accesso.');

  const { error } = await supabase.from('staff_access').update({
    full_name: String(formData.get('full_name') || '') || null,
    role: role === 'admin' ? 'admin' : 'operator',
    is_active: nextActive,
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/utenti');
}
