import { normalizeProvince, normalizeRegion } from '@/lib/geo/normalize';

export type CsvExhibitor = Record<string, string>;

type RawValue = string | number | boolean | Date | null | undefined;

function text(value: RawValue) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function first(...values: Array<RawValue>) {
  return values.map(text).find(Boolean) ?? '';
}

function excelDate(value: RawValue) {
  const v = text(value);
  if (!v || v.toLowerCase() === 'no' || v.toLowerCase() === 'x') return '';
  return v;
}

function statusFromPayment(value: RawValue) {
  const payment = text(value).toLowerCase();
  if (payment.includes('non partecipa')) return 'rinunciato';
  if (payment.includes('pagato') || payment === 'si' || payment === 'sì') return 'confermato';
  if (payment.includes('da pagare')) return 'in_attesa_pagamento';
  return 'candidatura_ricevuta';
}

function notesFromTrace(row: CsvExhibitor) {
  const parts = [
    first(row['Note'], row.internal_notes) ? `Note: ${first(row['Note'], row.internal_notes)}` : '',
    first(row['EMAIL 2']) ? `Email 2: ${first(row['EMAIL 2'])}` : '',
    first(row['CONTATTO 2']) || first(row['TELEFONO 2']) ? `Contatto 2: ${first(row['CONTATTO 2'])} ${first(row['TELEFONO 2'])}`.trim() : '',
    first(row['Contatto 3']) || first(row['TELEFONO 3']) ? `Contatto 3: ${first(row['Contatto 3'])} ${first(row['TELEFONO 3'])}`.trim() : '',
    first(row['Pagamento']) ? `Pagamento storico: ${first(row['Pagamento'])}` : '',
    first(row['N. Partecipanti']) ? `N. partecipanti: ${first(row['N. Partecipanti'])}` : '',
    excelDate(row['Data invio mail']) ? `Data invio mail: ${excelDate(row['Data invio mail'])}` : '',
    excelDate(row['Data contatto telefonico']) ? `Data contatto telefonico: ${excelDate(row['Data contatto telefonico'])}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join('\n') : null;
}

function normalizeTraceRow(row: CsvExhibitor): CsvExhibitor {
  const brand = first(row['Denominazione cantina'], row.Cantina, row.brand_name);
  const email = first(row.EMAIL, row.Email, row.email);
  const province = first(row.Provincia, row.province);
  const normalizedProvince = normalizeProvince(province);
  const normalizedRegion = normalizeRegion(first(row.Regione, row.region) || (normalizedProvince ? 'Marche' : ''));
  return {
    ...row,
    Cantina: brand,
    Email: email,
    Telefono: first(row['TELEFONO 1'], row.Telefono, row.phone),
    Referente: first(row['CONTATTO 1'], row.Referente, row.contact_name),
    Provincia: normalizedProvince ?? '',
    Regione: normalizedRegion ?? '',
    Prodotti: first(row.Produzione, row.Prodotti, row.products),
    Stato: first(row.Stato, row.status) || statusFromPayment(row.Pagamento),
    'Note interne': notesFromTrace(row) ?? first(row['Note interne'], row.internal_notes),
  };
}

export function parseCsv(textValue: string) {
  const lines = textValue.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map((item) => item.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(separator).map((item) => item.trim().replace(/^"|"$/g, ''));
    const row: CsvExhibitor = {};
    headers.forEach((header, index) => { row[header] = values[index] ?? ''; });
    return normalizeTraceRow(row);
  }).filter((row) => row.Cantina || row.Email);
}

export async function parseImportFile(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames.includes('Elenco 2026') ? 'Elenco 2026' : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, RawValue>>(sheet, { defval: '', raw: true });
    return rawRows.map((row) => {
      const normalized: CsvExhibitor = {};
      Object.entries(row).forEach(([key, value]) => { normalized[key.trim()] = text(value); });
      return normalizeTraceRow(normalized);
    }).filter((row) => row.Cantina || row.Email);
  }
  return parseCsv(await file.text());
}

export function csvPayload(row: CsvExhibitor) {
  return {
    brand_name: row.ID ? row.Cantina || 'Senza nome' : row.Cantina || row.brand_name || 'Senza nome',
    company_name: row['Ragione sociale'] || row.company_name || null,
    contact_name: row.Referente || row.contact_name || null,
    email: row.Email || row.email || null,
    phone: row.Telefono || row.phone || null,
    city: row.Comune || row.city || null,
    province: normalizeProvince(row.Provincia || row.province),
    region: normalizeRegion(row.Regione || row.region),
    status: row.Stato || row.status || 'candidatura_ricevuta',
    products: row.Prodotti || row.products || null,
    internal_notes: row['Note interne'] || row.internal_notes || null,
    updated_at: new Date().toISOString(),
  };
}
