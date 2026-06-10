'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server non configurato');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function createProfile(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();
  const role = String(formData.get('role') || 'operator') === 'admin' ? 'admin' : 'operator';

  if (!email) return;

  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(error.message);

  const user = data.users.find((item) => item.email?.toLowerCase() === email);
  if (!user) throw new Error('Utente non trovato in Supabase Auth. Prima deve fare almeno un accesso.');

  await supabase.from('profiles').upsert({
    id: user.id,
    email,
    full_name: fullName || user.user_metadata?.full_name || email,
    role,
    is_active: true,
  });

  revalidatePath('/utenti');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createServerClient();
  const id = String(formData.get('id') || '');
  const role = String(formData.get('role') || 'operator');

  if (!id) return;

  await supabase.from('profiles').update({
    full_name: String(formData.get('full_name') || '') || null,
    role: role === 'admin' ? 'admin' : 'operator',
    is_active: formData.get('is_active') === 'on',
  }).eq('id', id);

  revalidatePath('/utenti');
}
