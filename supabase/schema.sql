-- COEBO Webapp — schema Postgres per Supabase
-- Esegui questo intero file una volta nel SQL Editor del progetto Supabase
-- (Project → SQL Editor → New query → incolla → Run).
--
-- Sicurezza: RLS abilitata su ogni tabella applicativa. L'unica policy per
-- ruoli "anon"/"authenticated" è quella su profiles (un utente legge/aggiorna
-- solo la propria riga). Tutte le altre tabelle sono raggiungibili solo dal
-- server Express, che usa la service_role key (bypassa sempre RLS).

-- ============================================================
-- PROFILES (estende auth.users con i campi applicativi)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('IMPRESA', 'CLIENTE', 'TECNICO')),
  name text not null,
  company text,
  phone text,
  avatar text,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: user reads own row"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: user updates own row"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- CANTIERE CONFIG (riga singola) + SCALE + UNITÀ
-- ============================================================
create table if not exists cantiere_config (
  id text primary key,
  area_code text not null,
  project_appalto text not null,
  location text not null,
  name text not null,
  use_site_code_format boolean not null default true,
  surfaces jsonb not null default '[]'::jsonb
);

alter table cantiere_config enable row level security;

create table if not exists scales (
  id text primary key,
  cantiere_id text not null references cantiere_config(id) on delete cascade,
  letter text not null,
  total_floors integer not null,
  units_per_floor integer not null,
  include_interrato boolean not null default false,
  units_per_floor_by_floor jsonb not null default '{}'::jsonb
);

alter table scales enable row level security;

create table if not exists units (
  id text primary key,
  cantiere_id text not null references cantiere_config(id) on delete cascade,
  code text not null,
  scale_letter text not null,
  floor_number integer not null,
  number_on_floor integer not null,
  position_on_floor text,
  unit_category text,
  client_name text,
  associated_clients text[] not null default '{}',
  total_mq numeric,
  balcony_mq numeric,
  typology text,
  address text,
  base_price numeric
);

alter table units enable row level security;

-- ============================================================
-- DOCUMENTI + STORICO VERSIONI
-- ============================================================
create table if not exists documents (
  id text primary key,
  title text not null,
  category text not null check (category in ('contrattuale', 'tecnica', 'personalizzazione', 'finale')),
  file_name text not null,
  file_path text,
  uploaded_by text not null,
  uploaded_at text not null,
  status text not null check (status in ('vigente', 'sostituito', 'attesa_approvazione')),
  version integer not null default 1,
  file_size text,
  sha256 text,
  signature text,
  is_secured boolean not null default false,
  is_general_cantiere_doc boolean not null default false
);

alter table documents enable row level security;

create table if not exists document_history (
  id bigint generated always as identity primary key,
  document_id text not null references documents(id) on delete cascade,
  version integer not null,
  date text not null,
  "user" text not null,
  description text not null,
  file_name text not null,
  sha256 text,
  signature text,
  unique (document_id, version)
);

alter table document_history enable row level security;

-- ============================================================
-- VARIANTI EXTRA-CAPITOLATO
-- ============================================================
create table if not exists variations (
  id text primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('Architettonica', 'Impiantistica', 'Finitura/Materiali', 'Fornitura Esterna')),
  requested_by text not null,
  requested_at text not null,
  status text not null check (status in ('richiesta', 'in_valutazione', 'approvata', 'rifiutata', 'completata')),
  estimated_cost numeric not null default 0,
  final_cost numeric,
  technical_assessment text,
  materials text[],
  timeline_impact_days integer,
  notes text,
  has_ai_review boolean not null default false,
  feasibility_study_file text,
  is_paid boolean,
  balance_due numeric,
  due_date text,
  supplier_details jsonb
);

alter table variations enable row level security;

-- ============================================================
-- MESSAGGI (canale di comunicazione cliente-impresa)
-- ============================================================
create table if not exists messages (
  id text primary key,
  channel_id text not null,
  sender_name text not null,
  sender_role text not null check (sender_role in ('IMPRESA', 'CLIENTE', 'TECNICO')),
  text text not null,
  timestamp text not null,
  linked_doc_id text,
  linked_variation_id text
);

alter table messages enable row level security;

-- ============================================================
-- FASI CRONOPROGRAMMA
-- ============================================================
create table if not exists phases (
  id integer primary key,
  title text not null,
  description text not null,
  status text not null check (status in ('completato', 'in_corso', 'da_iniziare')),
  due_date text not null,
  completed_date text
);

alter table phases enable row level security;

-- ============================================================
-- COMUNICAZIONI MASSIVE
-- ============================================================
create table if not exists communications (
  id text primary key,
  title text not null,
  category text not null check (category in ('Visita Cantiere', 'Avanzamento Lavori', 'Documentazione', 'Avviso Generale')),
  message text not null,
  sender_role text not null check (sender_role in ('Amministratore', 'Tecnico')),
  sender_name text not null,
  sent_at text not null,
  recipients_count integer not null default 0,
  target_audience text not null,
  is_read_by_all boolean not null default false
);

alter table communications enable row level security;

-- ============================================================
-- CLIENTI REGISTRATI (attivi) + ARCHIVIO STORICO (post-rogito)
-- ============================================================
create table if not exists registered_clients (
  id text primary key,
  profile_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('PERSONA_FISICA', 'PERSONA_GIURIDICA')),
  nome text not null,
  cognome text,
  ragione_sociale text,
  cf_or_piva text not null,
  email text not null,
  phone text not null,
  associated_unit_id text references units(id) on delete set null,
  associated_unit_code text,
  registration_date text not null
);

alter table registered_clients enable row level security;

create table if not exists archived_clients (
  id text primary key,
  client_name text not null,
  client_type text not null check (client_type in ('PERSONA_FISICA', 'PERSONA_GIURIDICA')),
  tax_id text not null,
  phone text not null,
  email text not null,
  unit_code text not null,
  unit_typology text,
  cantiere_name text not null,
  archived_at text not null,
  deed_date text not null,
  total_value numeric not null,
  base_price numeric not null,
  extras_total numeric not null default 0,
  status text not null check (status in ('ROGITATO_ARCHIVIATO', 'PRATICA_CHIUSA')),
  notary_name text,
  sha256 text,
  documents_count integer not null default 0,
  notes text
);

alter table archived_clients enable row level security;

-- ============================================================
-- STORAGE: bucket privato per i documenti di cantiere
-- (accesso solo via server con service_role; nessuna policy
-- pubblica necessaria)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
