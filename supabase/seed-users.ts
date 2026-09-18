// Script una tantum: crea i 3 utenti demo in Supabase Auth + la riga profilo
// corrispondente, e collega Elena all'unità apt-A05 come cliente registrato.
// Esegui con: npm run seed:users
// Richiede SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Mancano SUPABASE_URL e/o SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  {
    email: "elena.demichele99@gmail.com",
    password: "elena123",
    role: "CLIENTE",
    name: "Elena De Michele",
    company: "Acquirente Privato",
    phone: "+39 334 1234567",
    unitId: "apt-A05",
    unitCode: "A05",
  },
  {
    email: "vito.conversano@binp.it",
    password: "vito123",
    role: "IMPRESA",
    name: "Amministratore COEBO",
    company: "COEBO S.r.l.",
    phone: "+39 3486131769",
  },
  {
    email: "ing.mongellifrancesco@gmail.com",
    password: "francesco123",
    role: "TECNICO",
    name: "Ing. Francesco Mongelli",
    company: "Studio Tecnico Mongelli (RPA)",
    phone: "+39 339 1787289",
  },
];

async function main() {
  for (const u of DEMO_USERS) {
    console.log(`Creo utente ${u.email}...`);

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (createErr) {
      console.error(`  Errore creazione ${u.email}:`, createErr.message);
      continue;
    }

    const userId = created.user.id;

    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: userId,
      role: u.role,
      name: u.name,
      company: u.company,
      phone: u.phone,
      onboarding_done: u.role !== "CLIENTE",
    });

    if (profileErr) {
      console.error(`  Errore creazione profilo per ${u.email}:`, profileErr.message);
      continue;
    }

    if (u.role === "CLIENTE" && u.unitId) {
      const { error: clientErr } = await supabase.from("registered_clients").upsert({
        id: `cli-${userId}`,
        profile_id: userId,
        type: "PERSONA_FISICA",
        nome: u.name.split(" ")[0],
        cognome: u.name.split(" ").slice(1).join(" "),
        cf_or_piva: "N/D",
        email: u.email,
        phone: u.phone,
        associated_unit_id: u.unitId,
        associated_unit_code: u.unitCode,
        registration_date: new Date().toLocaleDateString("it-IT"),
      });
      if (clientErr) {
        console.error(`  Errore creazione registered_client per ${u.email}:`, clientErr.message);
      }
    }

    console.log(`  OK — ${u.email} / password: ${u.password}`);
  }

  console.log("\nFatto. Password temporanee sopra — comunicale ai rispettivi utenti.");
}

main();
