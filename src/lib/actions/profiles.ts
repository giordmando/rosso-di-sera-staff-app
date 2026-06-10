'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createProfile(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();
  const role = String(formData.get('role') || 'operator');

  if (!email) return;

  await supabase.from('profiles').insert({
    email,
    full_name: fullName || null,
    role: role === 'admin' ? 'admin' : 'operator',
    is_active: true,
  });

  revalidatePath('/utenti');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
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
