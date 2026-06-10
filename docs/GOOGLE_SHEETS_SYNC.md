# Google Sheets Sync

## Strategia

Un solo Google Spreadsheet per edizione.

Esempio:
`Rosso di Sera 2026`

Fogli interni:
- Espositori
- Pagamenti
- Cantine
- Olio EVO
- Gastronomia
- Sponsor
- Log Sync

## Regole

L'app è fonte primaria. Google Sheet è copia operativa.

Ogni riga esportata deve includere:
- `exhibitor_id`
- `edition_id`
- `last_modified_at`
- `last_modified_by`
- `sheet_updated_at`
- `sync_status`

## Export

L'admin può aggiornare il foglio per una edizione.

## Import

L'admin può importare modifiche dal foglio. Se una riga è cambiata sia nell'app sia nel foglio, viene generato un conflitto.

## Conflitti

Solo admin può risolvere conflitti.
