# Architettura

## Stack

- Next.js per frontend e API routes/server actions
- Supabase Auth per autenticazione
- Supabase Postgres come database principale
- Supabase Row Level Security per autorizzazioni
- Google Sheets API per export/import
- Vercel per deploy

## Principio guida

Database Supabase = fonte primaria.
Google Sheet = strumento operativo sincronizzabile.

## Dominio

`approssodisera.lucidimezzo.it`

## Moduli applicativi

- Auth
- Dashboard
- Edizioni
- Espositori
- Pagamenti
- Candidature pubbliche
- Google Sheet Sync
- Utenti e ruoli
- Activity log

## Sicurezza

Le regole admin/operatore devono essere implementate lato database tramite RLS e replicate nella UI solo per esperienza utente.
