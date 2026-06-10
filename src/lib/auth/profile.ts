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

  const email = user.email.toLowerCase();
  const { data: access } = await supabase
    .from('staff_access')
    .select('email, full_name, role, is_active')
    .eq('email', email)
    .single();

  if (!access || !access.is_active) return null;

  await supabase.from('profiles').upsert({
    id: user.id,
    email,
    full_name: access.full_name || user.user_metadata?.full_name || email,
    role: access.role,
    is_active: access.is_active,
  });

  return {
    id: user.id,
    email,
    full_name: access.full_name || user.user_metadata?.full_name || email,
    role: access.role,
    is_active: access.is_active,
  } as StaffProfile;
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
