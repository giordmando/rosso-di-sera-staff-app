import { createSupabaseAdmin } from '@/lib/auth/admin';

export const EXHIBITORS_SHEET = 'Espositori';
export const PAYMENTS_SHEET = 'Pagamenti';

export async function getActiveEditionSheetConfig() {
  const supabase = createSupabaseAdmin();
  const { data: edition, error } = await supabase
    .from('editions')
    .select('id, year, name, google_spreadsheet_id')
    .eq('is_active', true)
    .order('year', { ascending: false })
    .limit(1)
    .single();

  if (error || !edition) throw new Error('Nessuna edizione attiva configurata');
  if (!edition.google_spreadsheet_id) throw new Error(`Google Sheet non configurato per ${edition.name}`);

  return {
    edition,
    spreadsheetId: edition.google_spreadsheet_id as string,
    exhibitorsSheet: EXHIBITORS_SHEET,
    paymentsSheet: PAYMENTS_SHEET,
  };
}
