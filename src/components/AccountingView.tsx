import React, { useState } from "react";
import { UserRole, VariationRequest, UnitConfig, CantiereConfig } from "../types";
import { showToast } from "../lib/toast";
import {
  Euro,
  Calculator,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Plus,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  X,
  Upload,
  Calendar,
  Building,
  Home,
  Sliders,
  ShieldCheck,
  Percent
} from "lucide-react";

export interface PropertyPaymentTranche {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  receivedDate?: string;
  status: "SALDATO" | "IN_ATTESA" | "IN_SCADENZA" | "DA_SALDARE_AL_ROGITO";
  paymentMethod?: string;
  receiptFileName?: string;
  notes?: string;
}

interface AccountingViewProps {
  userRole: UserRole;
  variations: VariationRequest[];
  selectedHouseId?: string | null;
  cantiereConfig?: CantiereConfig;
  onNavigateToVariations?: () => void;
  onUpdateVariationPayment?: (
    variationId: string,
    updates: { isPaid?: boolean; balanceDue?: number; dueDate?: string }
  ) => void;
}

const INITIAL_PROPERTY_PAYMENTS: PropertyPaymentTranche[] = [
  {
    id: "pay-001",
    title: "1° Acconto - Caparra Confirmatoria",
    description: "Versamento iniziale contestuale alla sottoscrizione del preliminare di vendita.",
    amount: 30000,
    dueDate: "2025-09-15",
    receivedDate: "2025-09-14",
    status: "SALDATO",
    paymentMethod: "Bonifico Bancario Irrevocabile",
    receiptFileName: "Distinta_Bonifico_Caparra_A01.pdf",
    notes: "Bonifico pervenuto nei tempi stabiliti dal preliminare."
  },
  {
    id: "pay-002",
    title: "2° Acconto - Inizio Struttura & Solai",
    description: "Rata legata all'avanzamento lavori di completamento struttura portante e solai.",
    amount: 40000,
    dueDate: "2026-01-20",
    receivedDate: "2026-01-18",
    status: "SALDATO",
    paymentMethod: "Bonifico SEPA",
    receiptFileName: "Accredito_Avanzamento_Struttura_A01.pdf",
    notes: "Verificata la conformità dell'asseverazione strutturale."
  },
  {
    id: "pay-003",
    title: "3° Acconto - Impianti & Massetti Esecutivi",
    description: "Tranche prevista al completamento tracciature ed installazione impianti.",
    amount: 30000,
    dueDate: "2026-08-30",
    status: "IN_ATTESA",
    paymentMethod: "Bonifico Bancario",
    notes: "In attesa del completamento del collaudo impianti da capitolato."
  },
  {
    id: "pay-004",
    title: "Saldo Finale - Tranche al Rogito Notarile",
    description: "Versamento dell'importo finale al momento della stipula dell'atto di compravendita.",
    amount: 80000,
    dueDate: "2026-12-15",
    status: "DA_SALDARE_AL_ROGITO",
    paymentMethod: "Assegno Circolare / Bonifico Notarile",
    notes: "Saldo contestuale al verbale di consegna chiavi."
  }
];

export default function AccountingView({
  userRole,
  variations,
  selectedHouseId,
  cantiereConfig,
  onNavigateToVariations,
  onUpdateVariationPayment
}: AccountingViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"APPARTAMENTO" | "EXTRA">("APPARTAMENTO");
  
  // Local list of property payments
  const [propertyPayments, setPropertyPayments] = useState<PropertyPaymentTranche[]>(() => {
    const saved = localStorage.getItem(`coebo_property_payments_${selectedHouseId || "A01"}`);
    return saved ? JSON.parse(saved) : INITIAL_PROPERTY_PAYMENTS;
  });

  // Selected Unit Info
  const currentUnit: UnitConfig = (cantiereConfig?.units || []).find(
    (u) => u.id === selectedHouseId
  ) || {
    id: "apt-A01",
    code: "A01",
    scaleLetter: "A",
    floorNumber: 1,
    numberOnFloor: 1,
    clientName: "Mario Rossi",
    totalMq: 85,
    typology: "Bilocale",
    basePrice: 180000
  };

  const basePrice = currentUnit.basePrice || 180000;

  // Property payment totals
  const totalPropertyPaid = propertyPayments
    .filter((p) => p.status === "SALDATO")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPropertyRemaining = basePrice - totalPropertyPaid;
  const propertyPaidPercentage = Math.round((totalPropertyPaid / basePrice) * 100);

  // Extra Capitolato variations totals
  const approvedVariations = variations.filter((v) => v.status === "approvata" || v.status === "completata");
  const totalApprovedExtrasValue = approvedVariations.reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0);
  
  const paidExtrasValue = approvedVariations
    .filter((v) => v.isPaid)
    .reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0);

  const remainingExtrasValue = totalApprovedExtrasValue - paidExtrasValue;

  // Modal states for Property Payment
  const [showAddTrancheModal, setShowAddTrancheModal] = useState(false);

  // Add Tranche Form State
  const [trancheTitle, setTrancheTitle] = useState("");
  const [trancheAmount, setTrancheAmount] = useState("");
  const [trancheDueDate, setTrancheDueDate] = useState("");
  const [trancheDescription, setTrancheDescription] = useState("");

  const handleCreateTranche = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(trancheAmount) || 0;
    const newTranche: PropertyPaymentTranche = {
      id: "pay-" + Date.now(),
      title: trancheTitle,
      description: trancheDescription || "Rata aggiuntiva programmata di contabilità cantiere.",
      amount: amountNum,
      dueDate: trancheDueDate,
      status: "IN_ATTESA",
      notes: "Creata da pannello di contabilità cantiere."
    };

    const updated = [...propertyPayments, newTranche];
    setPropertyPayments(updated);
    localStorage.setItem(`coebo_property_payments_${selectedHouseId || "A01"}`, JSON.stringify(updated));
    setShowAddTrancheModal(false);
    
    // Reset form
    setTrancheTitle("");
    setTrancheAmount("");
    setTrancheDueDate("");
    setTrancheDescription("");
  };

  const handleToggleTrancheStatus = (id: string) => {
    const updated = propertyPayments.map((p) => {
      if (p.id === id) {
        const isSaldato = p.status === "SALDATO";
        const newStatus: PropertyPaymentTranche["status"] = isSaldato ? "IN_ATTESA" : "SALDATO";
        const todayStr = new Date().toISOString().substring(0, 10);
        return {
          ...p,
          status: newStatus,
          receivedDate: !isSaldato ? todayStr : undefined
        };
      }
      return p;
    });

    setPropertyPayments(updated);
    localStorage.setItem(`coebo_property_payments_${selectedHouseId || "A01"}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 animate-fade-in" id="accounting-view-root">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Pannello Gestionale Finanziario
              </span>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Unità {currentUnit.code} ({currentUnit.clientName || "Cliente"})
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-1">
              Contabilità Cantiere & Saldi Economici
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Quadri sinottici per il tracciamento cronologico dei pagamenti dell'immobile e del consuntivo extra-capitolato.
            </p>
          </div>
        </div>

        {/* Global Action Export */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              showToast(`Estratto Conto Generale scaricato per l'unità Interno ${currentUnit.code}`, "success");
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Esporta Estratto Conto PDF</span>
          </button>
        </div>
      </div>

      {/* Main Macro-Area Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-3xs">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab("APPARTAMENTO")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === "APPARTAMENTO"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>1. Contabilità Appartamento</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full ml-1">
              € {basePrice.toLocaleString("it-IT")}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("EXTRA")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === "EXTRA"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>2. Contabilità Extra Capitolato</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full ml-1">
              € {totalApprovedExtrasValue.toLocaleString("it-IT")}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-3 hidden md:block">
          Selezionato: <strong className="text-slate-900">Interno {currentUnit.code}</strong> — {currentUnit.typology || "Plurilocale"} ({currentUnit.totalMq || 85} mq)
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MACRO-AREA 1: CONTABILITÀ APPARTAMENTO */}
      {/* ========================================================================= */}
      {activeSubTab === "APPARTAMENTO" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary KPI Cards for Property */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* KPI 1: Total Property List Price */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Prezzo di Listino Immobile</span>
                <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  € {basePrice.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Valore contrattuale base d'acquisto
                </p>
              </div>
              <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl border border-slate-200">
                <Home className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Total Property Paid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Totale Acconti Incassati / Versati</span>
                <p className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
                  € {totalPropertyPaid.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${propertyPaidPercentage}%` }} />
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700">{propertyPaidPercentage}% Saldato</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Total Remaining Due at Deed */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Saldo Rimanente da Versare al Rogito</span>
                <p className="text-2xl font-black text-amber-700 tracking-tight mt-0.5">
                  € {totalPropertyRemaining.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-amber-800/80 mt-1 font-medium">
                  Saldo finale contestuale all'atto notarile
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Chronological Payment Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">
                    Tabella Cronologica Pagamenti Immobile — Interno {currentUnit.code}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Tracciamento ufficiale degli acconti e saldo finale dell'unità abitativa.
                  </p>
                </div>
              </div>

              {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                <button
                  onClick={() => setShowAddTrancheModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Rata / Scadenza</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Tranche Rata</th>
                    <th className="p-3.5">Importo (€)</th>
                    <th className="p-3.5">Data Scadenza</th>
                    <th className="p-3.5">Data Ricezione</th>
                    <th className="p-3.5">Metodo Pagamento</th>
                    <th className="p-3.5 text-center">Stato Saldo</th>
                    <th className="p-3.5 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {propertyPayments.map((p, index) => {
                    const isSaldato = p.status === "SALDATO";
                    const isRogito = p.status === "DA_SALDARE_AL_ROGITO";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-black text-slate-900 block">{p.title}</span>
                              {p.description && (
                                <span className="text-[10px] text-slate-500 font-medium block mt-0.5 max-w-xs">
                                  {p.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                          € {p.amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3.5 font-semibold text-slate-800">
                          {p.dueDate}
                        </td>

                        <td className="p-3.5 font-semibold">
                          {p.receivedDate ? (
                            <span className="text-emerald-700 font-bold">{p.receivedDate}</span>
                          ) : (
                            <span className="text-slate-400 italic">In attesa</span>
                          )}
                        </td>

                        <td className="p-3.5 text-slate-600 text-[11px]">
                          {p.paymentMethod || "Bonifico SEPA"}
                        </td>

                        <td className="p-3.5 text-center">
                          {isSaldato && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>SALDATO</span>
                            </span>
                          )}
                          {!isSaldato && !isRogito && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-[10px] font-black">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>IN ATTESA</span>
                            </span>
                          )}
                          {isRogito && (
                            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 border border-indigo-300 px-2.5 py-1 rounded-full text-[10px] font-black">
                              <CreditCard className="w-3 h-3 text-indigo-600" />
                              <span>SALDO AL ROGITO</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                              <button
                                onClick={() => handleToggleTrancheStatus(p.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  isSaldato
                                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                                }`}
                                title="Segna come Saldato/In attesa"
                              >
                                {isSaldato ? "Segna In Attesa" : "Segna Saldato"}
                              </button>
                            )}
                            {userRole === "CLIENTE" && (
                              <span className="text-slate-300 text-[10px]">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MACRO-AREA 2: CONTABILITÀ EXTRA CAPITOLATO */}
      {/* ========================================================================= */}
      {activeSubTab === "EXTRA" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary KPI Cards for Extra Capitolato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Extra KPI 1: Total Approved Extras */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Totale Varianti Extra Approvate</span>
                <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  € {totalApprovedExtrasValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Somma di tutte le richieste extra fuori capitolato approvate
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200">
                <Sliders className="w-6 h-6" />
              </div>
            </div>

            {/* Extra KPI 2: Total Paid Extras */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Totale Incassato / Saldato Extra</span>
                <p className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
                  € {paidExtrasValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-800/80 mt-1 font-medium">
                  Pagamenti extra-capitolato già registrati
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Extra KPI 3: Remaining Extra Due */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Totale Residuo Extra da Incassare</span>
                <p className="text-2xl font-black text-amber-700 tracking-tight mt-0.5">
                  € {remainingExtrasValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-amber-800/80 mt-1 font-medium">
                  Pendenze o conguaglio finale varianti
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                <Clock className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Table dedicated exclusively to Extra-Capitolato accounting */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">
                    Riepilogo Dettagliato Pagamenti & Costi Varianti Extra-Capitolato
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Gestione dedicata ed esclusiva dei conguagli e bonifici per modifiche ed extra.
                  </p>
                </div>
              </div>

              {onNavigateToVariations && (
                <button
                  onClick={onNavigateToVariations}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <span>Gestisci Varianti</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {approvedVariations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nessuna variante extra-capitolato approvata al momento.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Le modifiche o integrazioni richieste dal cliente compariranno qui una volta approvate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-black uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Variante Extra</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Importo Fuori Capitolato</th>
                      <th className="p-3.5">Richiesta Da</th>
                      <th className="p-3.5 text-center">Stato Pagamento</th>
                      <th className="p-3.5 text-right">Azione / Salda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {approvedVariations.map((v) => {
                      const cost = v.finalCost || v.estimatedCost || 0;

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="block font-black text-slate-900">{v.title}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[280px]">{v.description}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {v.category}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                            € {cost.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3.5 text-slate-800 font-semibold">
                            {v.requestedBy}
                          </td>

                          <td className="p-3.5 text-center">
                            {v.isPaid ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>SALDATO</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-[10px] font-black">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>IN ATTESA</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            {(userRole === "IMPRESA" || userRole === "TECNICO") && onUpdateVariationPayment ? (
                              <button
                                onClick={() => onUpdateVariationPayment(v.id, { isPaid: !v.isPaid })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  v.isPaid
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                                }`}
                              >
                                {v.isPaid ? "Riapri Pagamento" : "Registra Incasso Extra"}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {v.isPaid ? "Pagamento Confermato" : "In attesa saldo"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal Nuova Tranche / Rata Pagamento Immobile */}
      {showAddTrancheModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    Contabilità Cantiere
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    Aggiungi Nuova Rata / Acconto Immobile
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowAddTrancheModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTranche} className="space-y-3 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Titolo Rata / Tranche *</label>
                <input
                  type="text"
                  required
                  value={trancheTitle}
                  onChange={(e) => setTrancheTitle(e.target.value)}
                  placeholder="Es. 3° Acconto - Intonaci e Tramezzature"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Importo (€) *</label>
                  <input
                    type="number"
                    required
                    value={trancheAmount}
                    onChange={(e) => setTrancheAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Data Scadenza *</label>
                  <input
                    type="date"
                    min="1900-01-01"
                    max="9999-12-31"
                    required
                    value={trancheDueDate}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val) {
                        const parts = val.split("-");
                        if (parts[0] && parts[0].length > 4) {
                          parts[0] = parts[0].slice(0, 4);
                          val = parts.join("-");
                        }
                      }
                      setTrancheDueDate(val);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Descrizione & Condizioni di Sblocco</label>
                <textarea
                  rows={2}
                  value={trancheDescription}
                  onChange={(e) => setTrancheDescription(e.target.value)}
                  placeholder="Es. Rata da versare al completamento dell'intonaco interno e posa controtelai."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrancheModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Crea e Registra Rata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
