# Sicurezza

## Autenticazione

- Google OAuth per utenti staff.
- Email/password solo con MFA TOTP obbligatoria.
- Gli utenti staff devono essere abilitati da admin.

## Autorizzazione

Ruoli previsti:
- admin
- operatore

Le autorizzazioni sono applicate tramite Row Level Security Supabase.

## Regole operatore

L'operatore può:
- leggere tutti gli espositori
- modificare tutti gli espositori
- registrare pagamenti per tutti
- creare espositori
- eliminare solo espositori creati da lui

## Log attività

Ogni operazione rilevante deve creare una riga in `activity_logs`.
