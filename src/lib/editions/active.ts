import { createSupabaseAdmin } from '@/lib/auth/admin';

export async function getActiveEdition() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('editions')
    .select('id, year, name, location, max_exhibitors, exhibitor_fee, google_spreadsheet_id, is_active')
    .eq('is_active', true)
    .order('year', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) throw new Error('Nessuna edizione attiva configurata');
  return data;
}
