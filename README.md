# Rosso di Sera Staff App

App interna per la gestione espositori, candidature, pagamenti, edizioni e sincronizzazione Google Sheet del progetto Rosso di Sera.

## Dominio previsto

`approssodisera.lucidimezzo.it`

## Stack tecnico

- Next.js
- Supabase Auth + Postgres + Row Level Security
- Google Sheets API
- Vercel

## Obiettivi MVP

- Login Google per lo staff
- Login email/password con MFA TOTP obbligatoria
- Ruoli admin e operatore
- Gestione multi-edizione
- Gestione espositori e tipologie
- Gestione pagamenti
- Form pubblico candidatura espositori
- Export/import Google Sheet per edizione
- Log attività

## Struttura documentale

- `docs/SPECIFICHE_FUNZIONALI.md`
- `docs/ARCHITETTURA.md`
- `docs/ROADMAP.md`
- `docs/SECURITY.md`
- `docs/GOOGLE_SHEETS_SYNC.md`
- `docs/DEPLOY_VERCEL.md`
- `supabase/schema.sql`
- `supabase/policies.sql`
- `supabase/seed.sql`

## Stato

Repository inizializzato per sviluppo MVP.