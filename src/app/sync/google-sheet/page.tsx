import { AppHeader } from '@/components/AppHeader';
import { GoogleSheetSyncPreview } from './preview';

export default function GoogleSheetSyncPage() {
  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <p style={{ color: 'var(--wine)', fontWeight: 800 }}>SYNC</p>
        <h1>Import da Google Sheet</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Analizza il foglio Espositori prima di aggiornare il database. Le modifiche non vengono applicate automaticamente.
        </p>
        <GoogleSheetSyncPreview />
      </div>
    </main>
  );
}
