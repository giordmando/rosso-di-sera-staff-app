import { createSupabaseAdmin } from '@/lib/auth/admin';

export const EXHIBITORS_SHEET = 'Espositori';
export const PAYMENTS_SHEET = 'Pagamenti';

export async function getActiveEditionSheetConfig() {
  const supabase = createSupabaseAdmin();
  const { data: editions, error } = await supabase
    .from('editions')
    .select('id, year, name, google_spreadsheet_id, is_active')
    .eq('is_active', true)
    .order('year', { ascending: false });

  if (error) throw new Error(error.message);
  if (!editions || editions.length === 0) throw new Error('Nessuna edizione attiva configurata');
  if (editions.length > 1) {
    const names = editions.map((item) => `${item.year} (${item.google_spreadsheet_id || 'senza Google Sheet'})`).join(', ');
    throw new Error(`Sono presenti più edizioni attive: ${names}. Lascia attiva una sola edizione da /edizioni.`);
  }

  const edition = editions[0];
  if (!edition.google_spreadsheet_id) throw new Error(`Google Sheet non configurato per ${edition.name}`);

  return {
    edition,
    spreadsheetId: edition.google_spreadsheet_id as string,
    exhibitorsSheet: EXHIBITORS_SHEET,
    paymentsSheet: PAYMENTS_SHEET,
  };
}
