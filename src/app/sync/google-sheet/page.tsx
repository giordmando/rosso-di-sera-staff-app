import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { GoogleSheetSyncPreview } from './preview';

export default function GoogleSheetSyncPage() {
  return <><main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Sync</p><h1 className="page-title">Import / Export</h1><p className="muted">Aggiorna Google Sheet, importa espositori da CSV e controlla i dati prima di modificare il database.</p></div></header><GoogleSheetSyncPreview /></div></main><AppFooter /></>;
}
