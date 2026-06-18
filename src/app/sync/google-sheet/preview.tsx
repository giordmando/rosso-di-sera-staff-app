'use client';

import { useEffect, useState } from 'react';

type PreviewItem = { row: number; action: 'create' | 'update' | 'duplicate'; conflict?: boolean; duplicateOfRow?: number | null; existingId: string | null; record: Record<string, string> };
type SheetConfig = { edition?: { name?: string; year?: number }; spreadsheetId?: string; exhibitorsSheet?: string; paymentsSheet?: string };
type PhaseStatus = 'idle' | 'running' | 'success' | 'error';
type PhaseState = { status: PhaseStatus; message: string; details?: string };

export function GoogleSheetSyncPreview() {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [csvItems, setCsvItems] = useState<PreviewItem[]>([]);
  const [configState, setConfigState] = useState<PhaseState>({ status: 'idle', message: 'Configurazione non caricata.' });
  const [analysisState, setAnalysisState] = useState<PhaseState>({ status: 'idle', message: 'Premi Analizza Google Sheet per leggere il foglio.' });
  const [importState, setImportState] = useState<PhaseState>({ status: 'idle', message: 'Import non ancora avviato.' });
  const [csvMessage, setCsvMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvApplying, setCsvApplying] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(null);

  useEffect(() => { void loadConfig(); }, []);

  async function safeJson(response: Response) { try { return await response.json(); } catch { return {}; } }

  async function loadConfig() {
    setConfigState({ status: 'running', message: 'Caricamento configurazione Google Sheet...' });
    const response = await fetch('/api/sync/google-sheet/config');
    const data = await safeJson(response);
    if (response.ok) {
      setSheetConfig(data);
      setConfigState({ status: 'success', message: 'Configurazione caricata.', details: `Edizione: ${data.edition?.name ?? '-'} | Fogli: ${data.exhibitorsSheet ?? 'Espositori'} / ${data.paymentsSheet ?? 'Pagamenti'}` });
    } else {
      setConfigState({ status: 'error', message: data.message || 'Impossibile leggere configurazione Google Sheet' });
    }
  }

  async function analyze() {
    setLoading(true);
    setAnalysisState({ status: 'running', message: 'Lettura Google Sheet in corso...' });
    setImportState({ status: 'idle', message: 'Import non ancora avviato.' });
    const response = await fetch('/api/sync/google-sheet/preview');
    const data = await safeJson(response);
    setLoading(false);
    if (!response.ok) {
      setAnalysisState({ status: 'error', message: data.message || 'Errore analisi Google Sheet' });
    } else {
      const nextItems = data.items ?? [];
      setItems(nextItems);
      if (data.edition) setSheetConfig((prev) => ({ ...prev, edition: data.edition }));
      const creates = nextItems.filter((item: PreviewItem) => item.action === 'create').length;
      const updates = nextItems.filter((item: PreviewItem) => item.action === 'update').length;
      const duplicates = nextItems.filter((item: PreviewItem) => item.action === 'duplicate').length;
      const conflicts = nextItems.filter((item: PreviewItem) => item.conflict).length;
      setAnalysisState({ status: 'success', message: `Analisi completata: ${nextItems.length} righe lette.`, details: `Nuovi: ${creates} | Aggiornabili: ${updates} | Duplicati: ${duplicates} | Conflitti: ${conflicts}` });
    }
  }

  async function apply(overwriteConflicts: boolean) {
    setApplying(true);
    setImportState({ status: 'running', message: overwriteConflicts ? 'Import Google Sheet in corso con forzatura conflitti...' : 'Import Google Sheet in corso senza conflitti...' });
    const response = await fetch('/api/sync/google-sheet/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ overwriteConflicts }) });
    const data = await safeJson(response);
    setApplying(false);
    if (response.ok) {
      setImportState({ status: 'success', message: data.message || 'Import completato.', details: `Creati: ${data.created ?? 0} | Aggiornati: ${data.updated ?? 0} | Duplicati saltati: ${data.skippedDuplicates ?? 0} | Conflitti saltati: ${data.skippedConflicts ?? 0}` });
      await analyze();
    } else {
      setImportState({ status: 'error', message: data.message || 'Errore durante import Google Sheet' });
    }
  }

  async function csvPreview() { if (!csvFile) return; setCsvLoading(true); setCsvMessage(`Analisi file in corso: ${csvFile.name}`); const form = new FormData(); form.append('file', csvFile); const response = await fetch('/api/sync/csv/preview', { method: 'POST', body: form }); const data = await safeJson(response); setCsvLoading(false); const nextItems = data.items ?? []; if (!response.ok) setCsvMessage(`Errore anteprima import: ${data.message || 'errore sconosciuto'}`); else { setCsvItems(nextItems); const duplicates = nextItems.filter((item: PreviewItem) => item.action === 'duplicate').length; setCsvMessage(`Anteprima completata: ${nextItems.length} righe lette da ${csvFile.name}. Nuovi: ${nextItems.filter((item: PreviewItem) => item.action === 'create').length}, aggiornabili: ${nextItems.filter((item: PreviewItem) => item.action === 'update').length}, duplicati nel file: ${duplicates}.`); } }
  async function csvApply() { if (!csvFile) return; setCsvApplying(true); setCsvMessage(`Import in corso: ${csvFile.name}`); const form = new FormData(); form.append('file', csvFile); const response = await fetch('/api/sync/csv/apply', { method: 'POST', body: form }); const data = await safeJson(response); setCsvApplying(false); setCsvMessage(`${data.message || 'Operazione completata'} - creati: ${data.created ?? 0}, aggiornati: ${data.updated ?? 0}, duplicati saltati: ${data.skippedDuplicates ?? 0}`); if (response.ok) await csvPreview(); }

  const createCount = items.filter((item) => item.action === 'create').length;
  const updateCount = items.filter((item) => item.action === 'update').length;
  const duplicateCount = items.filter((item) => item.action === 'duplicate').length;
  const conflictCount = items.filter((item) => item.conflict).length;
  const csvCreateCount = csvItems.filter((item) => item.action === 'create').length;
  const csvUpdateCount = csvItems.filter((item) => item.action === 'update').length;
  const csvDuplicateCount = csvItems.filter((item) => item.action === 'duplicate').length;

  return <div className="grid" style={{ gap: 24 }}>
    <section className="card"><div className="page-header" style={{ marginBottom: 18 }}><div><p className="eyebrow">Google Sheet</p><h2 style={{ margin: 0 }}>Sincronizza espositori</h2><p className="muted">Analizza il foglio, controlla nuovi record e conflitti, poi scegli se importare.</p></div></div><div className="grid grid-3" style={{ marginBottom: 18 }}><PhaseBox title="Configurazione" state={configState} /><PhaseBox title="Analisi" state={analysisState} /><PhaseBox title="Import" state={importState} /></div>{sheetConfig ? <div className="card" style={{ boxShadow: 'none', marginBottom: 16 }}><p className="muted" style={{ margin: 0 }}>Edizione attiva: <strong>{sheetConfig.edition?.name ?? '-'}</strong></p><p className="muted" style={{ margin: '6px 0 0' }}>Spreadsheet ID: <strong>{sheetConfig.spreadsheetId ?? '-'}</strong></p><p className="muted" style={{ margin: '6px 0 0' }}>Fogli: {sheetConfig.exhibitorsSheet ?? 'Espositori'} / {sheetConfig.paymentsSheet ?? 'Pagamenti'}</p></div> : null}<div className="toolbar" style={{ justifyContent: 'flex-start' }}><button className="btn btn-primary" type="button" onClick={analyze} disabled={loading}>{loading ? 'Analisi...' : 'Analizza Google Sheet'}</button>{items.length > 0 ? <button className="btn btn-secondary" type="button" onClick={() => apply(false)} disabled={applying}>{applying ? 'Import...' : 'Importa senza conflitti'}</button> : null}{conflictCount > 0 ? <button className="btn btn-soft" type="button" onClick={() => apply(true)} disabled={applying}>Forza conflitti</button> : null}</div>{items.length > 0 ? <div style={{ marginTop: 24 }}><Summary createCount={createCount} updateCount={updateCount} duplicateCount={duplicateCount} conflictCount={conflictCount} /><PreviewTable items={items} /></div> : null}</section>
    <section className="card"><div className="page-header" style={{ marginBottom: 18 }}><div><p className="eyebrow">Excel / CSV</p><h2 style={{ margin: 0 }}>Import cantine</h2><p className="muted">Carica il file Excel storico o un CSV compatibile. L app usa il foglio Elenco 2026 se presente.</p></div></div><div className="card" style={{ boxShadow: 'none', marginBottom: 16 }}><p className="muted" style={{ marginTop: 0 }}>Tracciato supportato: Denominazione cantina, Produzione, Provincia, EMAIL, EMAIL 2, CONTATTI, TELEFONI, Pagamento, N. Partecipanti, Data invio mail, Data contatto telefonico, Note.</p><div className="toolbar" style={{ justifyContent: 'flex-start' }}><input type="file" accept=".xlsx,.xls,.csv,text/csv" onChange={(event) => { setCsvFile(event.target.files?.[0] ?? null); setCsvItems([]); setCsvMessage(event.target.files?.[0] ? `File selezionato: ${event.target.files[0].name}. Premi Anteprima file.` : ''); }} style={{ maxWidth: 420 }} /><button className="btn btn-primary" type="button" onClick={csvPreview} disabled={!csvFile || csvLoading}>{csvLoading ? 'Analisi...' : 'Anteprima file'}</button>{csvItems.length > 0 ? <button className="btn btn-secondary" type="button" onClick={csvApply} disabled={csvApplying}>{csvApplying ? 'Import...' : 'Importa file'}</button> : null}</div></div>{csvMessage ? <p className="badge" style={{ marginTop: 16 }}>{csvMessage}</p> : null}{csvItems.length > 0 ? <div style={{ marginTop: 24 }}><Summary createCount={csvCreateCount} updateCount={csvUpdateCount} duplicateCount={csvDuplicateCount} conflictCount={0} /><PreviewTable items={csvItems} /></div> : null}</section>
  </div>;
}

function PhaseBox({ title, state }: { title: string; state: PhaseState }) {
  const label = state.status === 'running' ? 'In corso' : state.status === 'success' ? 'Completato' : state.status === 'error' ? 'Errore' : 'In attesa';
  return <div className="card" style={{ boxShadow: 'none', borderColor: state.status === 'error' ? 'var(--wine)' : state.status === 'success' ? 'rgba(31,120,68,.35)' : undefined }}><p className="eyebrow">{title}</p><h3 style={{ margin: '4px 0 8px' }}>{label}</h3><p className="muted" style={{ margin: 0 }}>{state.message}</p>{state.details ? <p className="muted" style={{ margin: '8px 0 0' }}>{state.details}</p> : null}</div>;
}

function Summary({ createCount, updateCount, duplicateCount, conflictCount }: { createCount: number; updateCount: number; duplicateCount: number; conflictCount: number }) {
  return <div className="grid grid-4" style={{ marginBottom: 16 }}><div className="card"><p className="muted">Nuovi</p><strong className="stat-value">{createCount}</strong></div><div className="card"><p className="muted">Aggiornabili</p><strong className="stat-value">{updateCount}</strong></div><div className="card"><p className="muted">Duplicati</p><strong className="stat-value">{duplicateCount}</strong></div><div className="card"><p className="muted">Conflitti</p><strong className="stat-value">{conflictCount}</strong></div></div>;
}

function PreviewTable({ items }: { items: PreviewItem[] }) {
  return <div className="table-wrap"><table className="table"><thead><tr><th>Riga</th><th>Cantina</th><th>Email</th><th>Provincia</th><th>Azione</th><th>Stato</th></tr></thead><tbody>{items.map((item) => <tr key={item.row}><td>{item.row}</td><td><strong>{item.record.Cantina || item.record.brand_name || '-'}</strong>{item.action === 'duplicate' && item.duplicateOfRow ? <><br /><span className="muted">Duplicato della riga {item.duplicateOfRow}</span></> : null}</td><td>{item.record.Email || item.record.email || '-'}</td><td>{item.record.Provincia || item.record.province || '-'}</td><td><span className="badge">{item.action === 'create' ? 'Crea' : item.action === 'update' ? 'Aggiorna' : 'Duplicato'}</span></td><td>{item.record.Stato || item.record.status || '-'}</td></tr>)}</tbody></table></div>;
}
