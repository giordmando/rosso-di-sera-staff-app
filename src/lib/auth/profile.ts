import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type StaffProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'operator';
  is_active: boolean;
};

export async function getStaffProfile(): Promise<StaffProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('email', user.email.toLowerCase())
    .single();

  return data as StaffProfile | null;
}

export async function requireActiveStaff() {
  const profile = await getStaffProfile();
  if (!profile || !profile.is_active) redirect('/login?error=not-authorized');
  return profile;
}

export async function requireAdmin() {
  const profile = await requireActiveStaff();
  if (profile.role !== 'admin') redirect('/dashboard');
  return profile;
}
