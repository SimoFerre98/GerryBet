# GerryBet - Specifiche Tecniche del Progetto

**Data:** 2026-04-19
**Stato:** Bozza in Revisione
**Tecnologie:** Next.js, Supabase (PostgreSQL, Auth, Real-time), Tailwind CSS

---

## 1. Obiettivo del Progetto
Realizzare una piattaforma web "mobile-first" per la gestione delle scommesse virtuali durante un torneo di calcio estivo. Gli utenti scommettono utilizzando una valuta virtuale chiamata **GerryPoints (GP)**, ottenibile tramite ricariche effettuate dall'amministratore (es. a seguito di acquisti al bar del campo).

---

## 2. Sistema Economico (GerryPoints)
- **Conversione Simbolica:** 1€ = 100 GP (per distanziare la percezione dal denaro reale).
- **Bonus Benvenuto:** Ogni nuovo iscritto riceve 100 GP omaggio.
- **Ricariche:** Gestite esclusivamente dall'Admin (CRUD su saldo utente).
- **Flusso:** Acquisto al bar -> Admin carica GP sull'account -> Utente scommette sul sito.

---

## 3. Logica delle Scommesse e Power Ranking
Le quote sono decise dall'Admin, ma il sistema fornisce un suggerimento basato sulla forza delle squadre.

### Power Ranking (Punteggio Squadra)
Ogni giocatore ha un valore basato sulla categoria di appartenenza:
- Eccellenza: 4 punti
- Promozione: 3 punti
- Prima Categoria: 2 punti
- Altro/Amatoriale: 1 punto

Il **Power Ranking** di una squadra è la somma dei punti dei suoi componenti. 
Il sistema suggerirà le quote 1X2 in base alla differenza di Power Ranking tra le due sfidanti.

### Tipologie di Scommessa
1. **Esito Finale (1X2)**
2. **Marcatori** (scelti da una lista di giocatori)
3. **Numero di Gol** (Under/Over o Risultato Esatto)

---

## 4. Requisiti Funzionali

### Area Utente
- **Login/Registrazione:** Tramite email e password.
- **Dashboard:** Visualizzazione saldo GP in tempo reale.
- **Palinsesto:** Elenco partite aperte con relative quote.
- **Storico Scommesse:** Elenco giocate effettuate (aperte, vinte, perse).
- **Classifica:** Top scommettitori per saldo GP e per percentuale di vincita ("Il Cecchino").

### Area Admin
- **Gestione Utenti:** Ricerca, visualizzazione dettagli e CRUD sul saldo GP.
- **Gestione Torneo:** Inserimento squadre e giocatori (con relativi punti categoria).
- **Gestione Partite:** Creazione match, impostazione quote (con suggerimento Power Ranking) e chiusura match con inserimento risultato.
- **Statistiche Globali:**
    - Totale GP in circolazione.
    - Guadagno/Perdita netta del "Banco".
    - Squadra più puntata ("Feticcio").
    - Volume di scommesse per singola partita.

---

## 5. Architettura Tecnica
- **Frontend:** Next.js con App Router, ottimizzato per dispositivi mobili.
- **Database & Backend:** Supabase (PostgreSQL).
- **Stato Real-time:** Utilizzo di Supabase Realtime per aggiornare classifiche e saldi senza refresh.
- **Hosting:** Vercel o simile.

---

## 6. Sicurezza
- Ruoli database (RLS) per impedire agli utenti di modificare il proprio saldo o le scommesse altrui.
- Solo gli utenti con ruolo `admin` possono accedere alle funzioni di gestione e ricarica GP.
