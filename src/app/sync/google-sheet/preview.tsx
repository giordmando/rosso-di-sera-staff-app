'use client';

import { useState } from 'react';

type PreviewItem = { row: number; action: 'create' | 'update'; conflict?: boolean; existingId: string | null; record: Record<string, string> };

export function GoogleSheetSyncPreview() {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [csvItems, setCsvItems] = useState<PreviewItem[]>([]);
  const [message, setMessage] = useState('');
  const [csvMessage, setCsvMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  async function safeJson(response: Response) { try { return await response.json(); } catch { return {}; } }
  async function analyze() { setLoading(true); setMessage(''); const response = await fetch('/api/sync/google-sheet/preview'); const data = await safeJson(response); setLoading(false); if (!response.ok) setMessage(data.message || 'Errore analisi'); setItems(data.items ?? []); }
  async function apply(overwriteConflicts: boolean) { setApplying(true); setMessage(''); const response = await fetch('/api/sync/google-sheet/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ overwriteConflicts }) }); const data = await safeJson(response); setApplying(false); setMessage(`${data.message || 'Operazione completata'} - creati: ${data.created ?? 0}, aggiornati: ${data.updated ?? 0}, conflitti saltati: ${data.skippedConflicts ?? 0}`); await analyze(); }
  async function csvPreview() { if (!csvFile) return; const form = new FormData(); form.append('file', csvFile); const response = await fetch('/api/sync/csv/preview', { method: 'POST', body: form }); const data = await safeJson(response); if (!response.ok) setCsvMessage(data.message || 'Errore anteprima import'); else setCsvMessage('Anteprima caricata. Controlla i dati prima di importare.'); setCsvItems(data.items ?? []); }
  async function csvApply() { if (!csvFile) return; const form = new FormData(); form.append('file', csvFile); const response = await fetch('/api/sync/csv/apply', { method: 'POST', body: form }); const data = await safeJson(response); setCsvMessage(`${data.message || 'Operazione completata'} - creati: ${data.created ?? 0}, aggiornati: ${data.updated ?? 0}`); await csvPreview(); }

  const createCount = items.filter((item) => item.action === 'create').length;
  const updateCount = items.filter((item) => item.action === 'update').length;
  const conflictCount = items.filter((item) => item.conflict).length;
  const csvCreateCount = csvItems.filter((item) => item.action === 'create').length;
  const csvUpdateCount = csvItems.filter((item) => item.action === 'update').length;

  return <div className="grid" style={{ gap: 24 }}>
    <section className="card"><div className="page-header" style={{ marginBottom: 18 }}><div><p className="eyebrow">Google Sheet</p><h2 style={{ margin: 0 }}>Sincronizza espositori</h2><p className="muted">Analizza il foglio, controlla nuovi record e conflitti, poi scegli se importare.</p></div></div><div className="toolbar" style={{ justifyContent: 'flex-start' }}><button className="btn btn-primary" type="button" onClick={analyze} disabled={loading}>{loading ? 'Analisi...' : 'Analizza Google Sheet'}</button>{items.length > 0 ? <button className="btn btn-secondary" type="button" onClick={() => apply(false)} disabled={applying}>{applying ? 'Import...' : 'Importa senza conflitti'}</button> : null}{conflictCount > 0 ? <button className="btn btn-soft" type="button" onClick={() => apply(true)} disabled={applying}>Forza conflitti</button> : null}</div>{message ? <p className="badge" style={{ marginTop: 16 }}>{message}</p> : null}{items.length > 0 ? <div style={{ marginTop: 24 }}><Summary createCount={createCount} updateCount={updateCount} thirdLabel="Conflitti" thirdValue={conflictCount} /><PreviewTable items={items} /></div> : null}</section>
    <section className="card"><div className="page-header" style={{ marginBottom: 18 }}><div><p className="eyebrow">Excel / CSV</p><h2 style={{ margin: 0 }}>Import cantine</h2><p className="muted">Carica il file Excel storico “Cantine 2026 ROSSO DI SERA.xlsx” o un CSV compatibile. L'app usa il foglio “Elenco 2026” se presente.</p></div></div><div className="card" style={{ boxShadow: 'none', marginBottom: 16 }}><p className="muted" style={{ marginTop: 0 }}>Tracciato supportato: Denominazione cantina, Produzione, Provincia, EMAIL, EMAIL 2, CONTATTI, TELEFONI, Pagamento, N. Partecipanti, Data invio mail, Data contatto telefonico, Note.</p><div className="toolbar" style={{ justifyContent: 'flex-start' }}><input type="file" accept=".xlsx,.xls,.csv,text/csv" onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)} style={{ maxWidth: 420 }} /><button className="btn btn-primary" type="button" onClick={csvPreview} disabled={!csvFile}>Anteprima file</button>{csvItems.length > 0 ? <button className="btn btn-secondary" type="button" onClick={csvApply}>Importa file</button> : null}</div></div>{csvMessage ? <p className="badge" style={{ marginTop: 16 }}>{csvMessage}</p> : null}{csvItems.length > 0 ? <div style={{ marginTop: 24 }}><Summary createCount={csvCreateCount} updateCount={csvUpdateCount} thirdLabel="Totale" thirdValue={csvItems.length} /><PreviewTable items={csvItems} /></div> : null}</section>
  </div>;
}

function Summary({ createCount, updateCount, thirdLabel, thirdValue }: { createCount: number; updateCount: number; thirdLabel: string; thirdValue: number }) {
  return <div className="grid grid-3" style={{ marginBottom: 16 }}><div className="card"><p className="muted">Nuovi</p><strong className="stat-value">{createCount}</strong></div><div className="card"><p className="muted">Aggiornabili</p><strong className="stat-value">{updateCount}</strong></div><div className="card"><p className="muted">{thirdLabel}</p><strong className="stat-value">{thirdValue}</strong></div></div>;
}

function PreviewTable({ items }: { items: PreviewItem[] }) {
  return <div className="table-wrap"><table className="table"><thead><tr><th>Riga</th><th>Cantina</th><th>Email</th><th>Provincia</th><th>Azione</th><th>Stato</th></tr></thead><tbody>{items.map((item) => <tr key={item.row}><td>{item.row}</td><td><strong>{item.record.Cantina || item.record.brand_name || '-'}</strong></td><td>{item.record.Email || item.record.email || '-'}</td><td>{item.record.Provincia || item.record.province || '-'}</td><td><span className="badge">{item.action === 'create' ? 'Crea' : 'Aggiorna'}</span></td><td>{item.record.Stato || item.record.status || '-'}</td></tr>)}</tbody></table></div>;
}
