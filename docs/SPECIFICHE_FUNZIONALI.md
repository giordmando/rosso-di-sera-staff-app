# Specifiche funzionali

## Obiettivo

Realizzare un'app interna separata dal sito pubblico per gestire espositori, candidature, pagamenti, edizioni e sincronizzazione Google Sheet di Rosso di Sera.

## Utenti

### Admin
- vede tutto
- crea, modifica ed elimina tutto
- gestisce utenti e ruoli
- registra pagamenti
- esporta/importa Google Sheet
- risolve conflitti di sincronizzazione

### Operatore
- vede tutti gli espositori
- modifica tutti gli espositori
- registra pagamenti per tutti
- aggiunge espositori
- elimina solo espositori creati da lui

## Moduli

### Edizioni
Ogni dato operativo appartiene a una edizione: 2026, 2027, 2028.

### Espositori
Campi principali:
- ragione sociale
- nome azienda/cantina
- referente
- telefono
- email
- sito/social
- comune, provincia, regione
- tipologia espositore
- prodotti presentati
- descrizione azienda
- esperienze offerte
- consenso immagini
- stato candidatura
- note interne

### Pagamenti
Storico pagamenti separato dall'espositore:
- importo previsto
- importo pagato
- metodo
- data
- ricevuta
- note
- registrato da

### Form pubblico
Gli espositori compilano un form sul sito o su una pagina pubblica dell'app. La candidatura entra nello stato `candidatura_ricevuta`.

### Google Sheet
Un solo Spreadsheet per edizione, con più fogli interni:
- Espositori
- Pagamenti
- Cantine
- Olio EVO
- Gastronomia
- Sponsor
- Log Sync

L'app rimane fonte primaria. Google Sheet è copia operativa sincronizzabile.
