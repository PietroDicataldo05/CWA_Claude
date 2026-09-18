# COEBO S.r.l. – Portale di commessa digitale

Web app che fa interagire l'impresa (COEBO) con i clienti acquirenti durante il cantiere: documenti, varianti/extra, contabilità, messaggi, comunicazioni, archivio clienti.

Ruoli: **IMPRESA** (amministratore), **TECNICO** (direzione lavori), **CLIENTE** (acquirente).

## Come è fatta

- **Frontend:** React 19 + Vite + TypeScript + Tailwind (cartella `src/`)
- **Backend:** Express (`server.ts`), serve API e frontend
- **Database, login e file:** Supabase (Postgres + Auth + Storage)
- **Hosting:** Railway (deploy automatico a ogni push su `main`)
- **AI:** Google Gemini (revisione tecnica delle varianti)

## Avvio in locale

Requisiti: Node.js.

1. `npm install`
2. Copia `.env.example` in `.env` e compila i valori (chiedili a chi gestisce Supabase/Gemini):
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (pubbliche, finiscono nel browser)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (**segrete**, solo server: non committarle mai e non usare il prefisso `VITE_`)
3. `npm run dev` → http://localhost:3000

Attenzione: il `.env` di sviluppo punta allo stesso Supabase di produzione, quindi i dati che modificate in locale sono quelli veri.

## Database

- `supabase/schema.sql`: tabelle e regole di sicurezza (da eseguire nell'SQL Editor di Supabase)
- `supabase/seed.sql`: dati demo iniziali
- `npm run seed:users`: crea gli utenti demo in Supabase Auth

## Deploy

Railway ricostruisce e pubblica il sito a ogni push su `main` del repository GitHub collegato (`npm run build` → `npm start`).
Nota: Railway maschera i valori "a forma di JWT" nelle variabili; per questo le chiavi Supabase su Railway sono salvate in base64 (`VITE_SUPABASE_ANON_KEY_B64`, `SUPABASE_SERVICE_ROLE_KEY_B64`) e decodificate in fase di build/avvio (`scripts/prepare-env.cjs`, `server.ts`).

## Comandi utili

- `npm run lint` – controllo dei tipi TypeScript
- `npm run build` – build di produzione
