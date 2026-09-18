const fs = require('fs');

const db = JSON.parse(fs.readFileSync('db.json'));

db.phases = [
  {
    "id": 0,
    "title": "Fase 0: Raccolta Documentazione Cliente",
    "description": "Caricamento documenti d'identità, codice fiscale e firma preliminare di vendita per sblocco pratiche amministrative.",
    "status": "completato",
    "dueDate": "2026-05-30",
    "completedDate": "2026-05-28"
  },
  {
    "id": 1,
    "title": "Fase 1: Definizione architettonica e prime forniture",
    "description": "Definizione tramezzature interne, distribuzione degli spazi e organizzazione funzionale degli ambienti.",
    "status": "completato",
    "dueDate": "2026-06-20",
    "completedDate": "2026-06-18"
  },
  {
    "id": 2,
    "title": "Fase 2: Impianti idrico-sanitari e climatizzazione",
    "description": "Posizionamento punti luce, prese elettriche, schema idrico, sanitari dei bagni, predisposizione cucina e locale tecnico.",
    "status": "in_corso",
    "dueDate": "2026-07-15"
  },
  {
    "id": 4,
    "title": "Fase 4: Chiusura Lavori & Consegna Immobile",
    "description": "Certificazioni finali degli impianti, agibilità, documentazione finale catastale e consegna formale delle chiavi.",
    "status": "da_iniziare",
    "dueDate": "2026-12-15"
  }
];

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
