-- Dati iniziali di dimostrazione (stesso contenuto di src/data/mockData.ts).
-- Esegui DOPO schema.sql, una sola volta.
-- Nota: gli utenti (Elena/Vito/Francesco) NON vengono creati qui — le password
-- vanno create tramite l'API Auth di Supabase (hashate), non con un semplice
-- insert SQL. Verranno creati da uno script Node dedicato (vedi istruzioni
-- fornite separatamente) che poi inserisce anche la riga corrispondente in
-- "profiles". Questo file popola solo i dati "di cantiere".

insert into cantiere_config (id, area_code, project_appalto, location, name, use_site_code_format, surfaces)
values ('cant-001', 'Area 1', 'Residenza San Pasquale', 'Bari', 'Area 1 – Residenza San Pasquale Bari', true, '[]'::jsonb)
on conflict (id) do nothing;

insert into scales (id, cantiere_id, letter, total_floors, units_per_floor, include_interrato, units_per_floor_by_floor) values
  ('scale-a', 'cant-001', 'A', 3, 4, true, '{"-1": 2, "1": 4, "2": 4, "3": 4}'::jsonb),
  ('scale-b', 'cant-001', 'B', 3, 4, true, '{"-1": 2, "1": 4, "2": 4, "3": 4}'::jsonb)
on conflict (id) do nothing;

insert into units (id, cantiere_id, code, scale_letter, floor_number, number_on_floor, position_on_floor, unit_category, client_name, total_mq, balcony_mq, typology, address, base_price) values
  ('apt-A-1-1', 'cant-001', 'A -1 dx', 'A', -1, 1, 'dx', 'Box Auto', 'Mario Rossi', 22, 0, null, 'Via Roberto Da Bari 62 (Interrato), Bari', 28000),
  ('apt-A-1-2', 'cant-001', 'A -1 sx', 'A', -1, 2, 'sx', 'Cantinola', 'Elena Rossi', 12, 0, null, 'Via Roberto Da Bari 62 (Interrato), Bari', 15000),
  ('apt-A01', 'cant-001', 'A 1 dx', 'A', 1, 1, 'dx', null, 'Mario Rossi', 85, 15, 'Bilocale', 'Via Roberto Da Bari 62, Bari', 180000),
  ('apt-A02', 'cant-001', 'A 1 sx', 'A', 1, 2, 'sx', null, 'Giuseppe Bianchi', 95, 18, 'Trilocale', 'Via Roberto Da Bari 62, Bari', 210000),
  ('apt-A03', 'cant-001', 'A 1 ct', 'A', 1, 3, 'ct', null, 'Anna Neri', 100, 20, 'Trilocale', 'Via Roberto Da Bari 62, Bari', 225000),
  ('apt-A04', 'cant-001', 'A 1 dx-2', 'A', 1, 4, 'dx', null, 'Luigi Verdi', 110, 22, 'Quadrilocale', 'Via Roberto Da Bari 62, Bari', 235000),
  ('apt-A05', 'cant-001', 'A 2 dx', 'A', 2, 1, 'dx', null, 'Elena Rossi', 134, 25, 'Plurilocale', 'Via Roberto Da Bari 62 / Cantiere San Pasquale, Bari', 245000),
  ('apt-A06', 'cant-001', 'A 2 sx', 'A', 2, 2, 'sx', null, 'Antonio Esposito', 105, 20, 'Trilocale', 'Via Roberto Da Bari 62, Bari', 220000),
  ('apt-A07', 'cant-001', 'A 2 ct', 'A', 2, 3, 'ct', null, 'Paola Ricci', 115, 22, 'Quadrilocale', 'Via Roberto Da Bari 62, Bari', 238000),
  ('apt-A08', 'cant-001', 'A 2 dx-2', 'A', 2, 4, 'dx', null, 'Roberto Marino', 120, 25, 'Quadrilocale', 'Via Roberto Da Bari 62, Bari', 242000),
  ('apt-A09', 'cant-001', 'A 3 dx', 'A', 3, 1, 'dx', null, 'Laura Bruno', 140, 30, 'Plurilocale', 'Via Roberto Da Bari 62, Bari', 260000),
  ('apt-A10', 'cant-001', 'A 3 sx', 'A', 3, 2, 'sx', null, 'Stefano Gallo', 110, 20, 'Trilocale', 'Via Roberto Da Bari 62, Bari', 230000),
  ('apt-A11', 'cant-001', 'A 3 ct', 'A', 3, 3, 'ct', null, 'Francesca Conti', 125, 26, 'Quadrilocale', 'Via Roberto Da Bari 62, Bari', 250000),
  ('apt-A12', 'cant-001', 'A 3 dx-2', 'A', 3, 4, 'dx', null, 'Marco De Luca', 145, 35, 'Plurilocale', 'Via Roberto Da Bari 62, Bari', 275000),
  ('apt-B01', 'cant-001', 'B 1 dx', 'B', 1, 1, 'dx', null, 'Alessandro Greco', 82, 12, 'Bilocale', 'Via Roberto Da Bari 64, Bari', 175000),
  ('apt-B02', 'cant-001', 'B 1 sx', 'B', 1, 2, 'sx', null, 'Sofia Romano', 92, 16, 'Trilocale', 'Via Roberto Da Bari 64, Bari', 205000),
  ('apt-B03', 'cant-001', 'B 1 ct', 'B', 1, 3, 'ct', null, 'Matteo Ferrari', 98, 18, 'Trilocale', 'Via Roberto Da Bari 64, Bari', 218000),
  ('apt-B04', 'cant-001', 'B 1 dx-2', 'B', 1, 4, 'dx', null, 'Valentina Costa', 108, 20, 'Quadrilocale', 'Via Roberto Da Bari 64, Bari', 230000)
on conflict (id) do nothing;

insert into phases (id, title, description, status, due_date, completed_date) values
  (0, 'Fase 0: Raccolta Documentazione Cliente', 'Caricamento documenti d''identità, codice fiscale e firma preliminare di vendita per sblocco pratiche amministrative.', 'completato', '2026-05-30', '2026-05-28'),
  (1, 'Fase 1: Definizione architettonica e prime forniture', 'Definizione tramezzature interne, distribuzione degli spazi e organizzazione funzionale degli ambienti.', 'completato', '2026-06-20', '2026-06-18'),
  (2, 'Fase 2: Impianti idrico-sanitari e climatizzazione', 'Posizionamento punti luce, prese elettriche, schema idrico, sanitari dei bagni, predisposizione cucina e locale tecnico.', 'in_corso', '2026-07-15', null),
  (3, 'Fase 3: Impianto elettrico', 'Definizione di tutte le personalizzazioni dell''impianto elettrico.', 'da_iniziare', '2026-08-10', null),
  (4, 'Fase 4: Chiusura Lavori & Consegna Immobile', 'Certificazioni finali degli impianti, agibilità, documentazione finale catastale e consegna formale delle chiavi.', 'da_iniziare', '2026-12-15', null)
on conflict (id) do nothing;

insert into documents (id, title, category, file_name, uploaded_by, uploaded_at, status, version, file_size, sha256, signature, is_secured, is_general_cantiere_doc) values
  ('doc-001', 'Disciplinare di Incarico e Gestione Cantiere', 'contrattuale', 'Disciplinare_Incarico_Cantiere_SanPasquale_v2.pdf', 'Amministratore', '2026-05-10 10:00', 'vigente', 2, '3.4 MB', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'COEBO_SECURE_TRUST_CA_SIGNATURE_001', true, true),
  ('doc-002', 'Capitolato Generale dei Lavori e Finiture Cantiere', 'tecnica', 'Capitolato_Generale_Finiture_SanPasquale_2026.pdf', 'Tecnico', '2026-05-12 11:30', 'vigente', 1, '5.8 MB', 'f4c1d55309fc2d250bfcf5d9007fc03538bf52f5750c045db506002c8963c966', 'COEBO_SECURE_TRUST_CA_SIGNATURE_002', true, true)
on conflict (id) do nothing;

insert into document_history (document_id, version, date, "user", description, file_name) values
  ('doc-001', 1, '2026-04-15 09:30', 'Tecnico', 'Bozza iniziale Disciplinare di Cantiere', 'Disciplinare_Incarico_Cantiere_v1.pdf'),
  ('doc-001', 2, '2026-05-10 10:00', 'Amministratore', 'Approvazione e pubblicazione Disciplinare di Cantiere Ufficiale', 'Disciplinare_Incarico_Cantiere_SanPasquale_v2.pdf'),
  ('doc-002', 1, '2026-05-12 11:30', 'Tecnico', 'Capitolato Generale delle Opere e Finiture di Cantiere', 'Capitolato_Generale_Finiture_SanPasquale_2026.pdf');

insert into variations (id, title, description, category, requested_by, requested_at, status, estimated_cost, final_cost, technical_assessment, materials, timeline_impact_days, notes, has_ai_review, is_paid, balance_due, due_date, supplier_details) values
  ('var-001', 'Demolizione tramezzo cucina per creazione Open-Space', 'Rimozione della parete divisoria tra cucina e soggiorno, spostamento degli allacciamenti standard alla parete laterale e raccordatura della pavimentazione continua.', 'Architettonica', 'Elena De Michele', '2026-06-02 15:30', 'approvata', 1200, 1200, 'Fattibilità strutturale verificata. La parete non è portante (tramezzo da 8 cm). Nessun pilastro o elemento in cemento armato coinvolto.', array['Demolizione tramezzo in laterizio forato (mq 12.50)', 'Rimozione detriti e trasporto a discarica autorizzata', 'Rasatura a gesso e ripristino intonaci di raccordo', 'Spostamento linee elettriche intercettate sulla parete demolita'], 1, 'L''intervento richiede una raccordatura perfetta del massetto e della pavimentazione. Avendo scelto parquet uniforme, la posa avverrà senza giunti.', false, true, 0, '2026-07-05', null),
  ('var-002', 'Predisposizione impianto idrico ed elettrico per Isola Cucina', 'Canalizzazione sotto-pavimento per portare gli scarichi idrici, l''acqua calda/fredda e l''alimentazione elettrica a centro stanza per isola cucina con lavello e piano cottura.', 'Impiantistica', 'Elena De Michele', '2026-06-19 11:20', 'approvata', 850, null, 'Possibile previa verifica dello spessore del massetto. Per garantire la pendenza corretta dello scarico del lavello (min 1%), il massetto deve avere uno spessore utile di almeno 10 cm nel tragitto dal pilastro di scarico principale.', array['Tracciatura e scasso nel solaio/massetto per posa tubazioni', 'Posa tubazione di scarico in polietilene alta densità isolato d.50mm', 'Posa tubazioni adduzione multistrato isolate per acqua calda/fredda', 'Posa corrugati d.25mm per alimentazione elettrica piano induzione ed elettrodomestici isola', 'Massetto cementizio di copertura ad alta resistenza'], 2, 'Da definire la posizione esatta prima della gettata del massetto di finitura previsto per la prima settimana di luglio.', false, false, 850, '2026-08-15', null),
  ('var-003', 'Sanitari sospesi e rubinetteria extra-capitolato (Fornitore Esterno)', 'Sostituzione dei sanitari standard a terra da capitolato con sanitari sospesi marca ''Flaminia'' serie Link e miscelatori a incasso marca ''Gessi'' acquistati presso il fornitore esterno ''Bari Ceramiche''.', 'Fornitura Esterna', 'Elena De Michele', '2026-06-22 09:40', 'approvata', 1800, null, 'L''installazione di sanitari sospesi richiede la posa di staffe speciali a muro (es. Geberit Duofix) prima dell''intonacatura e del rivestimento.', null, 1, 'Il cliente acquisterà direttamente i materiali dal fornitore esterno. COEBO addebiterà solo la posa in opera differenziale e la fornitura delle staffe da incasso. Verrà scalato il credito dei sanitari standard.', false, false, 3000, '2026-08-30',
   '{"supplierName": "Bari Ceramiche S.r.l.", "standardCredit": 600, "supplierQuoteCost": 2400, "difference": 1800, "receiptUploaded": true, "receiptFileName": "Fattura_BariCeramiche_ElenaDeMichele_Acconto.pdf"}'::jsonb)
on conflict (id) do nothing;

insert into communications (id, title, category, message, sender_role, sender_name, sent_at, recipients_count, target_audience, is_read_by_all) values
  ('comm-001', 'Comunicazione di Avvenuta Chiusura Visita Cantiere', 'Visita Cantiere', 'Si informano tutti i clienti che le visite programmate in cantiere per la giornata odierna si sono concluse con successo. La direzione tecnica ha completato le verifiche sugli immobili e il cantiere è stato regolarmente messo in sicurezza.', 'Amministratore', 'Amministratore COEBO', '05/08/2026 18:00', 24, 'Tutti i Clienti del Cantiere', true),
  ('comm-002', 'Completamento Tramezzature Interne e Inizio Impianti (Fase 2)', 'Avanzamento Lavori', 'Comunichiamo che le opere murarie e le tramezzature interne sono state ultimate. A partire da lunedì avranno inizio le tracciature degli impianti idrici ed elettrici. Vi invitiamo a confermare eventuali richieste di variante entro i termini.', 'Tecnico', 'Ing. Francesco Mongelli', '01/08/2026 09:30', 24, 'Tutti i Clienti del Cantiere', true)
on conflict (id) do nothing;
