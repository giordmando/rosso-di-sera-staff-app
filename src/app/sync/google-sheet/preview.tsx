'use client';

import { useEffect, useState } from 'react';

type PreviewItem = { row: number; action: 'create' | 'update' | 'duplicate'; conflict?: boolean; duplicateOfRow?: number | null; existingId: string | null; record: Record<string, string> };
type SheetConfig = { edition?: { name?: string; year?: number }; spreadsheetId?: string; exhibitorsSheet?: string; paymentsSheet?: string };

export function GoogleSheetSyncPreview() {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [csvItems, setCsvItems] = useState<PreviewItem[]>([]);
  const [message, setMessage] = useState('');
  const [csvMessage, setCsvMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvApplying, setCsvApplying] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(null);

  useEffect(() => { void loadConfig(); }, []);

  async function safeJson(response: Response) { try { return await response.json(); } catch { return {}; } }
  async function loadConfig() { const response = await fetch('/api/sync/google-sheet/config'); const data = await safeJson(response); if (response.ok) setSheetConfig(data); else setMessage(data.message || 'Impossibile leggere configurazione Google Sheet'); }
  async function analyze() { setLoading(true); setMessage('Lettura Google Sheet in corso...'); const response = await fetch('/api/sync/google-sheet/preview'); const data = await safeJson(response); setLoading(false); if (!response.ok) setMessage(data.message || 'Errore analisi Google Sheet'); else { setItems(data.items ?? []); if (data.edition) setSheetConfig((prev) => ({ ...prev, edition: data.edition })); setMessage(`Analisi completata: ${(data.items ?? []).length} righe lette dal Google Sheet attivo.`); } }
  async function apply(overwriteConflicts: boolean) { setApplying(true); setMessage('Import Google Sheet in corso...'); const response = await fetch('/api/sync/google-sheet/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ overwriteConflicts }) }); const data = await safeJson(response); setApplying(false); setMessage(`${response.ok ? '✓' : '⚠'} ${data.message || 'Operazione completata'} - creati: ${data.created ?? 0}, aggiornati: ${data.updated ?? 0}, conflitti saltati: ${data.skippedConflicts ?? 0}`); if (response.ok) await analyze(); }
  async function csvPreview() { if (!csvFile) return; setCsvLoading(true); setCsvMessage(`Analisi file in corso: ${csvFile.name}`); const form = new FormData(); form.append('file', csvFile); const response = await fetch('/api/sync/csv/preview', { method: 'POST', body: form }); const data = await safeJson(response); setCsvLoading(false); const nextItems = data.items ?? []; if (!response.ok) setCsvMessage(`⚠ ${data.message || 'Errore anteprima import'}`); else { setCsvItems(nextItems); const duplicates = nextItems.filter((item: PreviewItem) => item.action === 'duplicate').length; setCsvMessage(`✓ Anteprima completata: ${nextItems.length} righe lette da ${csvFile.name}. Nuovi: ${nextItems.filter((item: PreviewItem) => item.action === 'create').length}, aggiornabili: ${nextItems.filter((item: PreviewItem) => item.action === 'update').length}, duplicati nel file: ${duplicates}.`); } }
  async function csvApply() { if (!csvFile) return; setCsvApplying(true); setCsvMessage(`Import in corso: ${csvFile.name}`); const form = new FormData(); form.append('file', csvFile); const response = await fetch('/api/sync/csv/apply', { method: 'POST', body: form }); const data = await safeJson(response); setCsvApplying(false); setCsvMessage(`${response.ok ? '✓' : '⚠'} ${data.message || 'Operazione completata'} - creati: ${data.created ?? 0}, aggiornati: ${data.updated ?? 0}, duplicati saltati: ${data.skippedDuplicates ?? 0}`); if (response.ok) await csvPreview(); }

  const createCount = items.filter((item) => item.action === 'create').length;
  const updateCount = items.filter((item) => item.action === 'update').length;
  const conflictCount = items.filter((item) => item.conflict).length;
  const csvCreateCount = csvItems.filter((item) => item.action === 'create').length;
  const csvUpdateCount = csvItems.filter((item) => item.action === 'update').length;
  const csvDuplicateCount = csvItems.filter((item) => item.action === 'duplicate').length;

  return <div className="grid" style={{ gap: 24 }}>
    <section className="card"><div className="page-header" style={{ marginBottom: 18 }}><div><p className="eyebrow">Google Sheet</p><h2 style={{ margin: 0 }}>Sincronizza espositori</h2><p className="muted">Analizza il foglio, controlla nuovi record e conflitti, poi scegli se importare.</p>{sheetConfig ? <div className="card" style={{ boxShadow: 'none', marginTop: 16 }}><p className="muted" style={{ margin: 0 }}>Edizione attiva: <strong>{sheetConfig.edition?.name ?? '-'}</strong></p><p className="muted" style={{ margin: '6px 0 0' }}>Spreadsheet ID: <strong>{sheetConfig.spreadsheetId ?? '-'}</strong></p><p className="muted" style={{ margin: '6px 0 0' }}>Fogli: {sheetConfig.exhibitorsSheet ?? 'Espositori'} / {sheetConfig.paymentsSheet ?? 'Pagamenti'}</p></div> : null}</div></div><div className="toolbar" style={{ justifyContent: 'flex-start' }}><button className="btn btn-primary" type="button" onClick={analyze} disabled={loading}>{loading ? 'Analisi...' : 'Analizza Google Sheet'}</button>{items.length > 0 ? <button className="btn btn-secondary" type="button" onClick={() => apply(false)} disabled={applying}>{applying ? 'Import...' : 'Importa senza conflitti'}</button> : null}{conflictCount > 0 ? <button className="btn btn-soft" type="button" onClick={() => apply(true)} disabled={applying}>Forza conflitti</button> : null}</div>{message ? <p className="badge" style={{ marginTop: 16 }}>{message}</p> : null}{items.length > 0 ? <div style={{ marginTop: 24 }}><Summary createCount={createCount} updateCount={updateCount} thirdLabel="Conflitti" thirdValue={conflictCount} /><PreviewTable items={items} /></div> : null}</section>
    <section className="card"><div className="page-header" style={{ marginBottom: 18 }}><div><p className="eyebrow">Excel / CSV</p><h2 style={{ margin: 0 }}>Import cantine</h2><p className="muted">Carica il file Excel storico “Cantine 2026 ROSSO DI SERA.xlsx” o un CSV compatibile. L'app usa il foglio “Elenco 2026” se presente.</p></div></div><div className="card" style={{ boxShadow: 'none', marginBottom: 16 }}><p className="muted" style={{ marginTop: 0 }}>Tracciato supportato: Denominazione cantina, Produzione, Provincia, EMAIL, EMAIL 2, CONTATTI, TELEFONI, Pagamento, N. Partecipanti, Data invio mail, Data contatto telefonico, Note.</p><div className="toolbar" style={{ justifyContent: 'flex-start' }}><input type="file" accept=".xlsx,.xls,.csv,text/csv" onChange={(event) => { setCsvFile(event.target.files?.[0] ?? null); setCsvItems([]); setCsvMessage(event.target.files?.[0] ? `File selezionato: ${event.target.files[0].name}. Premi Anteprima file.` : ''); }} style={{ maxWidth: 420 }} /><button className="btn btn-primary" type="button" onClick={csvPreview} disabled={!csvFile || csvLoading}>{csvLoading ? 'Analisi...' : 'Anteprima file'}</button>{csvItems.length > 0 ? <button className="btn btn-secondary" type="button" onClick={csvApply} disabled={csvApplying}>{csvApplying ? 'Import...' : 'Importa file'}</button> : null}</div></div>{csvMessage ? <p className="badge" style={{ marginTop: 16 }}>{csvMessage}</p> : null}{csvItems.length > 0 ? <div style={{ marginTop: 24 }}><Summary createCount={csvCreateCount} updateCount={csvUpdateCount} thirdLabel="Duplicati file" thirdValue={csvDuplicateCount} /><PreviewTable items={csvItems} /></div> : null}</section>
  </div>;
}

function Summary({ createCount, updateCount, thirdLabel, thirdValue }: { createCount: number; updateCount: number; thirdLabel: string; thirdValue: number }) {
  return <div className="grid grid-3" style={{ marginBottom: 16 }}><div className="card"><p className="muted">Nuovi</p><strong className="stat-value">{createCount}</strong></div><div className="card"><p className="muted">Aggiornabili</p><strong className="stat-value">{updateCount}</strong></div><div className="card"><p className="muted">{thirdLabel}</p><strong className="stat-value">{thirdValue}</strong></div></div>;
}

function PreviewTable({ items }: { items: PreviewItem[] }) {
  return <div className="table-wrap"><table className="table"><thead><tr><th>Riga</th><th>Cantina</th><th>Email</th><th>Provincia</th><th>Azione</th><th>Stato</th></tr></thead><tbody>{items.map((item) => <tr key={item.row}><td>{item.row}</td><td><strong>{item.record.Cantina || item.record.brand_name || '-'}</strong>{item.action === 'duplicate' && item.duplicateOfRow ? <><br /><span className="muted">Duplicato della riga {item.duplicateOfRow}</span></> : null}</td><td>{item.record.Email || item.record.email || '-'}</td><td>{item.record.Provincia || item.record.province || '-'}</td><td><span className="badge">{item.action === 'create' ? 'Crea' : item.action === 'update' ? 'Aggiorna' : 'Duplicato'}</span></td><td>{item.record.Stato || item.record.status || '-'}</td></tr>)}</tbody></table></div>;
}
