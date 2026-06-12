import { NextResponse } from 'next/server';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getActiveEditionSheetConfig } from '@/lib/google/edition-sheet';

export async function GET() {
  try {
    await requireActiveStaff();
    const { edition, spreadsheetId, exhibitorsSheet, paymentsSheet } = await getActiveEditionSheetConfig();
    return NextResponse.json({ edition, spreadsheetId, exhibitorsSheet, paymentsSheet });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore configurazione Google Sheet' }, { status: 500 });
  }
}
