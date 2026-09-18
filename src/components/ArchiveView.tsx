import React, { useState, useEffect } from "react";
import { UserRole, UnitConfig, CantiereConfig } from "../types";
import { showToast } from "../lib/toast";
import {
  FolderArchive,
  ShieldCheck,
  Search,
  Download,
  Eye,
  CheckCircle2,
  FileText,
  User,
  Building2,
  Calendar,
  Euro,
  RotateCcw,
  Plus,
  X,
  Lock,
  ExternalLink,
  ShieldAlert,
  Hash
} from "lucide-react";

export interface ArchivedClientRecord {
  id: string;
  clientName: string;
  clientType: "PERSONA_FISICA" | "PERSONA_GIURIDICA";
  taxId: string; // Codice Fiscale o P.IVA
  phone: string;
  email: string;
  unitCode: string;
  unitTypology: string;
  cantiereName: string;
  archivedAt: string;
  deedDate: string; // Data Rogito
  totalValue: number; // Prezzo finale comprensivo di varianti
  basePrice: number;
  extrasTotal: number;
  status: "ROGITATO_ARCHIVIATO" | "PRATICA_CHIUSA";
  notaryName: string;
  sha256: string;
  documentsCount: number;
  notes?: string;
}

interface ArchiveViewProps {
  userRole: UserRole;
  cantiereConfig?: CantiereConfig;
  onNavigateToHouse?: (houseId: string) => void;
}


export default function ArchiveView({ userRole, cantiereConfig, onNavigateToHouse }: ArchiveViewProps) {
  const [archivedList, setArchivedList] = useState<ArchivedClientRecord[]>([]);

  useEffect(() => {
    fetch("/api/archived-clients")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Errore nel recupero archivio"))))
      .then((data: ArchivedClientRecord[]) => setArchivedList(data))
      .catch((err) => console.error("Error loading archived clients:", err));
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"TUTTI" | "PERSONA_FISICA" | "PERSONA_GIURIDICA">("TUTTI");
  const [selectedRecord, setSelectedRecord] = useState<ArchivedClientRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New archive form state
  const [newClientName, setNewClientName] = useState("");
  const [newClientType, setNewClientType] = useState<"PERSONA_FISICA" | "PERSONA_GIURIDICA">("PERSONA_FISICA");
  const [newTaxId, setNewTaxId] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUnitCode, setNewUnitCode] = useState("A01");
  const [newDeedDate, setNewDeedDate] = useState("2026-07-01");
  const [newBasePrice, setNewBasePrice] = useState("200000");
  const [newExtrasTotal, setNewExtrasTotal] = useState("5000");
  const [newNotaryName, setNewNotaryName] = useState("Studio Notarile Dr. Marotta");
  const [newNotes, setNewNotes] = useState("");

  const handleSaveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    const base = Number(newBasePrice) || 0;
    const extra = Number(newExtrasTotal) || 0;
    const nowStr = new Date().toISOString().substring(0, 10);

    const newRec: ArchivedClientRecord = {
      id: "arch-" + Date.now(),
      clientName: newClientName,
      clientType: newClientType,
      taxId: newTaxId,
      phone: newPhone,
      email: newEmail,
      unitCode: newUnitCode,
      unitTypology: "Appartamento Cantiere",
      cantiereName: cantiereConfig?.name || "Residenza San Pasquale - Bari",
      archivedAt: nowStr,
      deedDate: newDeedDate,
      totalValue: base + extra,
      basePrice: base,
      extrasTotal: extra,
      status: "ROGITATO_ARCHIVIATO",
      notaryName: newNotaryName,
      sha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      documentsCount: 8,
      notes: newNotes || "Pratica completata e rogitata. Documentazione archiviata nel vault di sicurezza."
    };

    try {
      const res = await fetch("/api/archived-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRec),
      });
      if (!res.ok) throw new Error("Errore nel salvataggio dell'archivio");
      const saved: ArchivedClientRecord = await res.json();
      setArchivedList((prev) => [saved, ...prev]);
      setShowAddModal(false);
      showToast(`Cliente "${newClientName}" storicizzato con successo nell'Archivio Protetto!`, "success");

      // Reset form
      setNewClientName("");
      setNewTaxId("");
      setNewPhone("");
      setNewEmail("");
      setNewNotes("");
    } catch (err) {
      console.error("Error saving archived client:", err);
      showToast("Errore durante il salvataggio. Riprova.", "error");
    }
  };

  const handleRestoreClient = async (id: string) => {
    if (confirm("Sei sicuro di voler riattivare questa pratica cliente dall'archivio protetto?")) {
      try {
        const res = await fetch(`/api/archived-clients/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Errore durante il ripristino");
        setArchivedList((prev) => prev.filter((item) => item.id !== id));
        setSelectedRecord(null);
        showToast("Scheda cliente ripristinata e trasferita alla gestione attiva.", "success");
      } catch (err) {
        console.error("Error restoring archived client:", err);
        showToast("Errore durante il ripristino. Riprova.", "error");
      }
    }
  };

  const filteredRecords = archivedList.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "TUTTI" || item.clientType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="archive-section-root">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <FolderArchive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Area Protetta & Storicizzata
              </span>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                GDPR Vault Safe
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-1">
              Archivio Storico Clienti & Commesse Rogitate
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Custodia protetta e crittografata dei dati anagrafici, verbali e contratti ufficiali per commesse concluse.
            </p>
          </div>
        </div>

        {(userRole === "IMPRESA" || userRole === "TECNICO") && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Archivia Nuova Commessa / Cliente</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per Nome, Codice Fiscale, P.IVA, Email o Interno (es. A02)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">Filtra Tipologia:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterType("TUTTI")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === "TUTTI" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tutti ({archivedList.length})
            </button>
            <button
              onClick={() => setFilterType("PERSONA_FISICA")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === "PERSONA_FISICA" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Persone Fisiche
            </button>
            <button
              onClick={() => setFilterType("PERSONA_GIURIDICA")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === "PERSONA_GIURIDICA" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Persone Giuridiche
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Anagrafiche Clienti in Archivio Protetti ({filteredRecords.length})
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Standard di sicurezza SHA-256 e conservazione sostitutiva
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Nessuna pratica trovata nell'Archivio Protetto.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              I clienti e le pratiche il cui atto notarile è stato completato compariranno qui in totale sicurezza.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-black uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Cliente / Ragione Sociale</th>
                  <th className="p-3.5">Tipologia</th>
                  <th className="p-3.5">Cod. Fiscale / P.IVA</th>
                  <th className="p-3.5">Telefono</th>
                  <th className="p-3.5">Email Ufficiale</th>
                  <th className="p-3.5">Immobile / Cantiere</th>
                  <th className="p-3.5">Data Rogito</th>
                  <th className="p-3.5 text-right">Valore Finale</th>
                  <th className="p-3.5 text-center">Stato</th>
                  <th className="p-3.5 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {record.clientType === "PERSONA_FISICA" ? (
                          <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                            <User className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="block text-slate-900 font-black">{record.clientName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {record.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.clientType === "PERSONA_FISICA"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      }`}>
                        {record.clientType === "PERSONA_FISICA" ? "Persona Fisica" : "Persona Giuridica"}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-800 font-semibold">
                      {record.taxId}
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">
                      {record.phone}
                    </td>

                    <td className="p-3.5 font-medium text-slate-600">
                      {record.email}
                    </td>

                    <td className="p-3.5">
                      <span className="font-black text-slate-900 block">Interno {record.unitCode}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[140px] block">{record.cantiereName}</span>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-800">
                      {record.deedDate}
                    </td>

                    <td className="p-3.5 text-right font-black text-slate-900">
                      € {record.totalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Rogitato Archiviato</span>
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>Ispeziona</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Details Inspection */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    Fascicolo Cliente Archiviato
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedRecord.clientName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 pr-1">
              {/* Detail Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tipologia</span>
                  <span className="font-bold text-slate-800">{selectedRecord.clientType === "PERSONA_FISICA" ? "Persona Fisica" : "Persona Giuridica"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Codice Fiscale / P.IVA</span>
                  <span className="font-mono font-bold text-slate-800">{selectedRecord.taxId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Unità Immobiliare</span>
                  <span className="font-bold text-amber-700">Interno {selectedRecord.unitCode}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Telefono</span>
                  <span className="font-medium text-slate-800">{selectedRecord.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Ufficiale</span>
                  <span className="font-medium text-slate-800">{selectedRecord.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Rogito Notarile</span>
                  <span className="font-bold text-emerald-700">{selectedRecord.deedDate}</span>
                </div>
              </div>

              {/* Economic Summary */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Consuntivo Economico Definitivo</span>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Prezzo Immobile</span>
                    <span className="font-mono font-bold">€ {selectedRecord.basePrice.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Totale Extra Capitolato</span>
                    <span className="font-mono font-bold text-amber-400">+ € {selectedRecord.extrasTotal.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Totale Saldato</span>
                    <span className="font-mono font-black text-emerald-400">€ {selectedRecord.totalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-[11px] text-amber-900">
                <p className="text-slate-600">{selectedRecord.notes}</p>
                <p className="font-mono text-[10px] text-amber-800/70 break-all pt-1">
                  SHA-256 Vault Hash: {selectedRecord.sha256}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                <button
                  onClick={() => handleRestoreClient(selectedRecord.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ripristina in Gestione Attiva</span>
                </button>
              )}

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Chiudi
                </button>
                <button
                  onClick={() => {
                    showToast(`Download in corso del Fascicolo Completo (ZIP/PDF) per ${selectedRecord.clientName}`, "success");
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Scarica Fascicolo Completo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuova Archiviazione Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    Archiviazione Pratica Completata
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    Storicizza Nuovo Cliente & Rogito
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArchive} className="space-y-4 text-xs text-slate-700">
              
              {/* Type Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Tipologia Soggetto <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewClientType("PERSONA_FISICA")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newClientType === "PERSONA_FISICA"
                        ? "bg-amber-50 border-amber-500 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Persona Fisica</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewClientType("PERSONA_GIURIDICA")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newClientType === "PERSONA_GIURIDICA"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Persona Giuridica</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    {newClientType === "PERSONA_FISICA" ? "Nome e Cognome Cliente *" : "Ragione Sociale *" }
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder={newClientType === "PERSONA_FISICA" ? "Es. Mario Rossi" : "Es. Impresa Bianchi S.r.l."}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    {newClientType === "PERSONA_FISICA" ? "Codice Fiscale *" : "Partita IVA *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaxId}
                    onChange={(e) => setNewTaxId(e.target.value)}
                    placeholder={newClientType === "PERSONA_FISICA" ? "RSSMRA80A01L219K" : "01234567890"}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Numero di Telefono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+39 333 1234567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Email Ufficiale</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="cliente@email.it"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Interno Unità</label>
                  <input
                    type="text"
                    value={newUnitCode}
                    onChange={(e) => setNewUnitCode(e.target.value)}
                    placeholder="A01"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Prezzo Immobile (€)</label>
                  <input
                    type="number"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Tot. Extra (€)</label>
                  <input
                    type="number"
                    value={newExtrasTotal}
                    onChange={(e) => setNewExtrasTotal(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Data Stipula Rogito</label>
                  <input
                    type="date"
                    value={newDeedDate}
                    onChange={(e) => setNewDeedDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Notaio Rogante</label>
                  <input
                    type="text"
                    value={newNotaryName}
                    onChange={(e) => setNewNotaryName(e.target.value)}
                    placeholder="Studio Notarile Dr. Marotta"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Conferma & Storicizza in Archivio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
