const fs = require('fs');

const db = JSON.parse(fs.readFileSync('db.json'));

db.phases.push({
  "id": 3,
  "title": "Fase 3: Impianto elettrico",
  "description": "Selezione rivestimenti extra, accordi con fornitori esterni, calcolo differenze economiche standard.",
  "status": "da_iniziare",
  "dueDate": "2026-08-10"
});

db.phases.sort((a, b) => a.id - b.id);

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
