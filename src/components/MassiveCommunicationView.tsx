import React, { useState } from "react";
import { UserRole, MassiveCommunication } from "../types";
import { showToast } from "../lib/toast";
import {
  Send,
  Bell,
  CheckCircle2,
  Users,
  ShieldCheck,
  Megaphone,
  Calendar,
  User,
  Plus,
  X,
  MessageSquare,
  Building2,
  Info
} from "lucide-react";

interface MassiveCommunicationViewProps {
  userRole: UserRole;
  userName: string;
  communications: MassiveCommunication[];
  onSendCommunication: (comm: MassiveCommunication) => void;
}

export default function MassiveCommunicationView({
  userRole,
  userName,
  communications,
  onSendCommunication,
}: MassiveCommunicationViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Visita Cantiere");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("Tutti i Clienti del Cantiere");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const senderRole: "Amministratore" | "Tecnico" =
    userRole === "IMPRESA" ? "Amministratore" : "Tecnico";

  const handleQuickTemplate = (templateTitle: string, templateCategory: string, templateMsg: string) => {
    setTitle(templateTitle);
    setCategory(templateCategory);
    setMessage(templateMsg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast("Inserire un titolo ed il testo della comunicazione.", "error");
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newComm: MassiveCommunication = {
      id: `comm-${Date.now()}`,
      title: title.trim(),
      category: category,
      message: message.trim(),
      senderRole: senderRole,
      senderName: senderRole === "Amministratore" ? "Amministratore COEBO" : "Ing. Francesco Mongelli (Tecnico)",
      sentAt: formattedDate,
      recipientsCount: 24,
      targetAudience: targetAudience,
      isReadByAll: true,
    };

    onSendCommunication(newComm);
    setIsModalOpen(false);
    setTitle("");
    setMessage("");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto font-sans">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 font-mono-tech text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Comunicazione massiva inviata con successo a <strong>24 clienti</strong>! Notifica push e aggiornamento registro completati.
            </span>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-white hover:text-emerald-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#0F172A] to-[#1E293B] border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white brutalist-shadow-amber">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Megaphone className="w-48 h-48 text-amber-500" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-mono-tech font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Piattaforma Comunicazioni Massive Cantiere</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">
              Notifiche & Aggiornamenti Clienti
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl font-mono-tech">
              Invio circolari, avvisi ufficiali e comunicazioni di chiusura visite o avanzamento lavori a tutti i clienti del cantiere.
            </p>
          </div>

          {(userRole === "IMPRESA" || userRole === "TECNICO") && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs md:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300 font-mono-tech shrink-0"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Nuova Comunicazione Massiva</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sent Communications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono-tech font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Registro Comunicazioni Inviate ({communications.length})</span>
          </h2>
          <span className="text-xs font-mono-tech text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            Destinatari: Tutti i Clienti (24 Acquirenti)
          </span>
        </div>

        {communications.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono-tech text-xs space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <p>Nessuna comunicazione massiva inviata al momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {communications.map((comm) => (
              <div
                key={comm.id}
                className="bg-[#111827] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all shadow-md space-y-3 text-slate-100 font-sans"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono-tech font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {comm.category}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">{comm.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono-tech text-slate-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {comm.sentAt}
                    </span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line bg-[#0B0F17] p-4 rounded-xl border border-slate-800/60">
                  {comm.message}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-tech pt-1">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      Inviato da: {comm.senderRole} ({comm.senderName})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg text-[11px] font-bold">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Consegnato a {comm.recipientsCount} Clienti ({comm.targetAudience})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Composition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 text-white font-sans brutalist-shadow-amber animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white">Invia Comunicazione Massiva ai Clienti</h3>
                  <p className="text-xs font-mono-tech text-slate-400">
                    Ruolo mittente attivo: <strong className="text-amber-400">{senderRole}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono-tech font-bold text-slate-400 uppercase block">
                Modelli Rapidi Preimpostati:
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono-tech">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickTemplate(
                      "Comunicazione di Avvenuta Chiusura Visita Cantiere",
                      "Visita Cantiere",
                      "Si informano tutti i clienti che le visite programmate in cantiere per la giornata odierna si sono concluse con successo. La direzione tecnica ha completato le verifiche sugli immobili ed il cantiere è stato regolarmente messo in sicurezza."
                    )
                  }
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 cursor-pointer font-bold text-[11px]"
                >
                  Chiusura Visita Cantiere
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickTemplate(
                      "Aggiornamento Avanzamento Lavori e Scadenza Varianti",
                      "Avanzamento Lavori",
                      "Gentili Acquirenti, vi informiamo che le lavorazioni previste per la fase corrente stanno procedendo regolarmente. Vi ricordiamo che eventuali richieste di variante agli impianti devono essere inviate entro il termine concordato."
                    )
                  }
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 cursor-pointer font-bold text-[11px]"
                >
                  Avanzamento Lavori
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Categoria Comunicazione
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Visita Cantiere" className="bg-slate-900 text-white">Visita Cantiere</option>
                    <option value="Avanzamento Lavori" className="bg-slate-900 text-white">Avanzamento Lavori</option>
                    <option value="Avviso Sicurezza" className="bg-slate-900 text-white">Avviso Sicurezza</option>
                    <option value="Comunicazione Amministrativa" className="bg-slate-900 text-white">Comunicazione Amministrativa</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Destinatari
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={targetAudience}
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-bold text-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Oggetto / Titolo Comunicazione
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Comunicazione di Avvenuta Chiusura Visita Cantiere"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Testo del Messaggio
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inserisci qui il testo dettagliato dell'avviso da inviare a tutti i clienti..."
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-sans text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Verrà notificato a 24 clienti registrati
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    <span>Invia Ora a Tutti</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
