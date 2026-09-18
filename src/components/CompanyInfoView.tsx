import React from "react";
import { Building2, Users, HardHat, Award, MapPin, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";

export default function CompanyInfoView() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12 overflow-y-auto">
      {/* Header section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-500/10 text-amber-700 rounded-xl border border-amber-500/20">
            <Building2 className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Informazioni sull'azienda</h1>
            <p className="text-slate-500 font-medium">COEBO S.r.l. - Impresa generale di costruzione</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <HardHat className="w-5 h-5 text-amber-500" />
            Chi Siamo e La Nostra Storia
          </h2>
          <div className="text-slate-600 space-y-4 leading-relaxed mb-8">
            <p>
              <strong className="text-slate-800">COEBO S.r.l.</strong> è un'impresa generale di costruzione a capitale privato che opera nel settore dell'edilizia civile dai primi anni Novanta. La società rappresenta oggi il terzo passaggio generazionale del Gruppo Bonerba Costruzioni, portandone avanti la continuità imprenditoriale e i valori.
            </p>
            <p>
              Le radici dell'azienda risalgono al 1964, quando Onofrio Bonerba fondò la Bonerba Fratelli S.n.c., specializzandosi nel tempo in nuove costruzioni e ristrutturazioni residenziali nel territorio di Bari e provincia. Nel 1992, per rispondere a un mercato sempre più dinamico, nasce la COEBO S.r.l. insieme ai figli ingegneri Alessandra e Nicola Bonerba. L'ingresso della nuova generazione ha permesso di affiancare all'edilizia tradizionale anche il settore impiantistico (civile, commerciale e industriale), portando l'azienda verso standard sempre più elevati di innovazione.
            </p>
            <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
              I valori fondanti che ci guidano sono la tradizione, la qualità, la ricerca tecnologica e il costante aggiornamento.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cosa Facciamo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-amber-500" />
            Cosa Facciamo
          </h2>
          <p className="text-slate-600 mb-6">
            L'azienda opera in diversi ambiti, tra cui edilizia pubblica e privata, restauro monumentale, ristrutturazioni chiavi in mano, costruzione di parcheggi e interventi per il recupero del territorio. Il nostro lavoro si divide principalmente in tre aree:
          </p>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Progettazione</strong>
                <span className="text-slate-600 text-sm">Sviluppiamo interventi in ambito edilizio e civile adottando soluzioni innovative e all'avanguardia, guidati da un costante orientamento alle esigenze del cliente.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Realizzazione</strong>
                <span className="text-slate-600 text-sm">Costruiamo opere edili ed impiantistiche avvalendoci di maestranze specializzate e materiali accuratamente scelti per garantire interventi duraturi ed efficienti.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Manutenzione e Riqualificazione</strong>
                <span className="text-slate-600 text-sm">Operiamo sul patrimonio edilizio esistente con interventi di ristrutturazione, adeguamento normativo, miglioramento sismico ed efficientamento energetico (inclusi Superbonus 110% e Sismabonus). Negli ultimi anni realizziamo anche impianti fotovoltaici e soluzioni per l'energia sostenibile.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          {/* Il Nostro Team */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-amber-500" />
              Il Nostro Team
            </h2>
            <p className="text-slate-600 mb-4">
              L'azienda può contare su una squadra di professionisti altamente qualificata. A guidare il gruppo ci sono l'<strong>Ing. Nicola Bonerba</strong> (Amministratore unico e coordinatore generale) e l'<strong>Ing. Alessandra Bonerba</strong> (gestione rapporto azienda-utente).
            </p>
            <p className="text-slate-600">
              Il team direttivo, tecnico e operativo include inoltre ingegneri, geometri ed esperti amministrativi che curano ogni aspetto tecnico, normativo e organizzativo dei cantieri.
            </p>
          </div>

          {/* Progetti di Rilievo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-amber-500" />
              Progetti di Rilievo
            </h2>
            <p className="text-slate-600">
              Siamo fortemente impegnati in progetti di rigenerazione urbana e opere pubbliche-private, tra cui spicca il <strong>P.I.R.P. Japigia</strong>, un vasto programma di riqualificazione per la città di Bari che ha previsto la costruzione di decine di nuovi alloggi, centri civici, scuole materne, parchi urbani attrezzati e piazze pubbliche. Tra le nostre realizzazioni rientra anche il progetto <strong>"PIRP LE VILLE"</strong>, un complesso abitativo ad alta efficienza energetica.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualità e Certificazioni */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-amber-500" />
            Qualità e Certificazioni
          </h2>
          <p className="text-slate-600 mb-6">
            A garanzia dell'affidabilità e della sicurezza dei nostri processi, la nostra azienda vanta:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Attestazione SOA GROUP (Cat. OG1 Class. VIII Illimitata; Cat. OG11 Class. III BIS).</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Certificazione del sistema di gestione ISO 9001:2015.</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Certificazione UNI PDR 125 (Livello Argento).</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Vincitori dei prestigiosi "Cassa Edile Awards" negli anni 2023, 2024 e 2025.</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Adesione al circuito Confindustria (Bari e Barletta-Andria-Trani) e ANCE.</span>
            </li>
          </ul>
        </div>

        {/* Contatti */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-amber-500" />
            Contatti
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-800 text-sm">Sede Legale</strong>
                <span className="text-slate-600">Via Roberto da Bari, 62 - 70122 Bari BA</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-800 text-sm">Sede Operativa</strong>
                <span className="text-slate-600">Via Natale Loiacono, 2A - 70126 Bari BA</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-800 text-sm">Telefono</strong>
                <span className="text-slate-600">080 5525812</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-800 text-sm">Email</strong>
                <a href="mailto:info.coebo@gmail.com" className="text-amber-600 hover:underline">info.coebo@gmail.com</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-800 text-sm">Sito Web</strong>
                <a href="https://www.coebo.it" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">www.coebo.it</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
