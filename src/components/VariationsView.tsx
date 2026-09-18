import React, { useState, useEffect } from "react";
import { VariationRequest, UserRole } from "../types";
import { showToast } from "../lib/toast";
import {
  Sparkles,
  Calculator,
  Check,
  X,
  FileText,
  FileUp,
  Clock,
  CheckCircle,
  HelpCircle,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Construction,
  Calendar,
  Info
} from "lucide-react";
import { motion } from "motion/react";

function VariationDueDateEditor({
  variationId,
  currentDueDate,
  onUpdateVariationPayment,
}: {
  variationId: string;
  currentDueDate?: string;
  onUpdateVariationPayment?: (
    id: string,
    updates: { isPaid?: boolean; balanceDue?: number; dueDate?: string }
  ) => void;
}) {
  const [val, setVal] = useState(currentDueDate || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVal(currentDueDate || "");
  }, [currentDueDate]);

  const handleSave = () => {
    if (onUpdateVariationPayment) {
      onUpdateVariationPayment(variationId, { dueDate: val });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wider block">
        Da saldare entro: (data)
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          min="1900-01-01"
          max="9999-12-31"
          value={val}
          onChange={(e) => {
            let newVal = e.target.value;
            if (newVal) {
              const parts = newVal.split("-");
              if (parts[0] && parts[0].length > 4) {
                parts[0] = parts[0].slice(0, 4);
                newVal = parts.join("-");
              }
            }
            setVal(newVal);
            if (onUpdateVariationPayment) {
              onUpdateVariationPayment(variationId, { dueDate: newVal });
            }
          }}
          className="w-full px-2.5 py-1.5 bg-slate-950 text-xs font-mono-tech font-bold text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
        />
        <button
          type="button"
          onClick={handleSave}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono-tech font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
            saved
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
              : "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500"
          }`}
          title="Salva data di scadenza"
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Salvato</span>
            </>
          ) : (
            <span>Salva</span>
          )}
        </button>
      </div>
    </div>
  );
}

interface VariationsViewProps {
  variations: VariationRequest[];
  userRole: UserRole;
  userName: string;
  onAddVariation: (variation: VariationRequest) => void;
  onUpdateVariationStatus: (
    id: string,
    status: "richiesta" | "in_valutazione" | "approvata" | "rifiutata" | "completata",
    technicalAssessment?: string,
    estimatedCost?: number,
    finalCost?: number,
    materials?: string[],
    days?: number
  ) => void;
  onUpdateVariationPayment?: (
    id: string,
    updates: { isPaid?: boolean; balanceDue?: number; dueDate?: string }
  ) => void;
}

export default function VariationsView({
  variations,
  userRole,
  userName,
  onAddVariation,
  onUpdateVariationStatus,
  onUpdateVariationPayment,
}: VariationsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Architettonica" | "Impiantistica" | "Finitura/Materiali" | "Fornitura Esterna">("Architettonica");
  const [newDescription, setNewDescription] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // External supplier states if needed
  const [supplierName, setSupplierName] = useState("");
  const [standardCredit, setStandardCredit] = useState(0);
  const [supplierQuote, setSupplierQuote] = useState(0);

  // Manual input states for IMPRESA / TECNICO
  const [estimatedCost, setEstimatedCost] = useState<number | "">("");
  const [technicalAssessment, setTechnicalAssessment] = useState("");
  const [timelineImpactDays, setTimelineImpactDays] = useState<number | "">("");
  const [materials, setMaterials] = useState("");
  const [notes, setNotes] = useState("");

  // Feasibility study states
  const [hasFeasibilityStudy, setHasFeasibilityStudy] = useState(false);
  const [feasibilityFileName, setFeasibilityFileName] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<"all" | "Architettonica" | "Impiantistica" | "Finitura/Materiali" | "Fornitura Esterna">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");

  // Filter variations based on category & payment status
  const filteredVariations = variations.filter((v) => {
    if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
    if (paymentFilter === "paid" && !v.isPaid) return false;
    if (paymentFilter === "unpaid" && v.isPaid) return false;
    return true;
  });

  const totalApprovedCount = variations.length;
  let totaleAssolutoScelte = 0;
  let totaleRimanenteDaSaldare = 0;
  let totaleGiaSaldato = 0;

  let totaleImpresa = 0;
  let saldatoImpresa = 0;
  let daSaldareImpresa = 0;

  let totaleFornitore = 0;
  let saldatoFornitore = 0;
  let daSaldareFornitore = 0;

  variations.forEach((v) => {
    let itemSupplierCost = 0;
    let itemImpresaCost = 0;

    if (v.category === "Fornitura Esterna" || v.supplierDetails) {
      if (v.supplierDetails) {
        itemSupplierCost = v.supplierDetails.supplierQuoteCost || 0;
        itemImpresaCost = v.supplierDetails.standardCredit || 0;
      } else {
        itemSupplierCost = v.finalCost ?? v.estimatedCost ?? 0;
        itemImpresaCost = 0;
      }
    } else {
      itemImpresaCost = v.finalCost ?? v.estimatedCost ?? 0;
      itemSupplierCost = 0;
    }

    const itemTotalChoiceCost = itemSupplierCost + itemImpresaCost;
    totaleAssolutoScelte += itemTotalChoiceCost;

    const isPaid = v.isPaid === true;
    const balanceDue = v.balanceDue !== undefined ? v.balanceDue : (isPaid ? 0 : itemTotalChoiceCost);

    const paidAmount = isPaid ? itemTotalChoiceCost : Math.max(0, itemTotalChoiceCost - balanceDue);
    const unpaidAmount = isPaid ? 0 : Math.min(itemTotalChoiceCost, balanceDue);

    totaleGiaSaldato += paidAmount;
    totaleRimanenteDaSaldare += unpaidAmount;

    // Split between Impresa and Fornitore
    if (itemSupplierCost > 0) {
      totaleFornitore += itemSupplierCost;
      totaleImpresa += itemImpresaCost;

      if (isPaid) {
        saldatoFornitore += itemSupplierCost;
        saldatoImpresa += itemImpresaCost;
      } else {
        const supplierUnpaid = Math.min(itemSupplierCost, unpaidAmount);
        const impresaUnpaid = Math.max(0, unpaidAmount - supplierUnpaid);

        daSaldareFornitore += supplierUnpaid;
        saldatoFornitore += Math.max(0, itemSupplierCost - supplierUnpaid);

        daSaldareImpresa += impresaUnpaid;
        saldatoImpresa += Math.max(0, itemImpresaCost - impresaUnpaid);
      }
    } else {
      totaleImpresa += itemImpresaCost;
      if (isPaid) {
        saldatoImpresa += itemImpresaCost;
      } else {
        daSaldareImpresa += unpaidAmount;
        saldatoImpresa += Math.max(0, itemImpresaCost - unpaidAmount);
      }
    }
  });

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      showToast("Inserire titolo e descrizione.", "error");
      return;
    }

    setIsAiLoading(true);

    const now = new Date();
    const nowStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let createdVar: VariationRequest = {
      id: `var-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      requestedBy: userName,
      requestedAt: nowStr,
      status: "approvata",
      estimatedCost: 0,
      finalCost: 0,
      dueDate: "",
      hasAiReview: false,
    };

    if (newCategory === "Fornitura Esterna") {
      const diff = Math.max(0, supplierQuote - standardCredit);
      createdVar.supplierDetails = {
        supplierName: supplierName || "Fornitore Esterno",
        standardCredit: Number(standardCredit) || 0,
        supplierQuoteCost: Number(supplierQuote) || 0,
        difference: diff,
        receiptUploaded: true,
        receiptFileName: "Fattura_Preventivo_Fornitore.pdf",
      };
      createdVar.estimatedCost = diff;
      createdVar.finalCost = diff;
      createdVar.status = "approvata";
      createdVar.technicalAssessment = "Computo fornitura esterna caricata dall'impresa.";
      createdVar.timelineImpactDays = Number(timelineImpactDays) || 0;
      createdVar.notes = notes || "";
    }

    if (useAi && newCategory !== "Fornitura Esterna") {
      try {
        const response = await fetch("/api/technical-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            description: newDescription,
            category: newCategory,
          }),
        });

        if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
          const aiData = await response.json();
          createdVar = {
            ...createdVar,
            status: "approvata",
            estimatedCost: aiData.estimatedCost,
            finalCost: aiData.estimatedCost,
            technicalAssessment: aiData.feasibility,
            materials: aiData.materials,
            timelineImpactDays: aiData.estimatedDays,
            notes: aiData.notes,
            hasAiReview: true,
          };
        } else {
          console.error("Failed to get Gemini response");
          // Fallback to local defaults if API fails
          const costVal = newCategory === "Impiantistica" ? 450 : 750;
          createdVar.estimatedCost = costVal;
          createdVar.finalCost = costVal;
          createdVar.status = "approvata";
          createdVar.technicalAssessment = `[Simulazione] Modifica fattibile. L'intervento è realizzabile con i normali canoni di cantiere residenziale COEBO.`;
          createdVar.materials = ["Manodopera qualificata", "Materiali edili standard"];
          createdVar.timelineImpactDays = 1;
        }
      } catch (err) {
        console.error("AI Evaluation error:", err);
        createdVar.estimatedCost = 500;
        createdVar.finalCost = 500;
        createdVar.status = "approvata";
        createdVar.technicalAssessment = "Fattibile previa verifica strutturale cantiere.";
      }
    } else if (newCategory !== "Fornitura Esterna") {
      if (userRole === "IMPRESA" || userRole === "TECNICO") {
        createdVar.status = "approvata";
        const costVal = Number(estimatedCost) || 0;
        createdVar.estimatedCost = costVal;
        createdVar.finalCost = costVal;
        createdVar.technicalAssessment = hasFeasibilityStudy && feasibilityFileName
          ? `Studio di fattibilità allegato in formato digitale.`
          : (technicalAssessment || "Valutazione tecnica fornita all'atto della creazione.");
        if (hasFeasibilityStudy && feasibilityFileName) {
          createdVar.feasibilityStudyFile = feasibilityFileName;
        }
        createdVar.materials = materials ? materials.split(",").map((m) => m.trim()).filter(Boolean) : [];
        createdVar.timelineImpactDays = Number(timelineImpactDays) || 0;
        createdVar.notes = notes || "";
        createdVar.hasAiReview = false;
      } else {
        // Presets for client
        const costVal = newCategory === "Impiantistica" ? 350 : 600;
        createdVar.status = "approvata";
        createdVar.estimatedCost = costVal;
        createdVar.finalCost = costVal;
        createdVar.technicalAssessment = "Modifica approvata e registrata nel piano personalizzazioni.";
        createdVar.materials = [];
        createdVar.timelineImpactDays = 0;
      }
    }

    onAddVariation(createdVar);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setSupplierName("");
    setStandardCredit(0);
    setSupplierQuote(0);
    setEstimatedCost("");
    setTechnicalAssessment("");
    setTimelineImpactDays("");
    setMaterials("");
    setNotes("");
    setHasFeasibilityStudy(false);
    setFeasibilityFileName("");
    setIsAiLoading(false);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6" id="variations-tracker-container">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Layout Sinistra: Totale Assoluto & Rimanente da Saldare */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
          <div className="space-y-4 z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                Riepilogo Economico
              </span>
              <span className="text-xs text-slate-400 font-medium">{variations.length} Scelte Registrate</span>
            </div>

            {/* In alto a sinistra: Totale Assoluto Scelte */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Totale Assoluto Scelte Effettuate
              </p>
              <h2 className="text-3xl font-black text-white tracking-tight">
                € {totaleAssolutoScelte.toLocaleString("it-IT")}
              </h2>
              <p className="text-[11px] text-slate-400">
                Somma totale fornitori esterni e lavorazioni impresa (saldate e non saldate)
              </p>
            </div>

            {/* Subito sotto: Cifra Rimanente da Saldare */}
            <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-xl border border-slate-700/80 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Rimanente da Saldare
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Già Saldato: € {totaleGiaSaldato.toLocaleString("it-IT")}
                </span>
              </div>
              <h3 className="text-2xl font-black text-amber-300">
                € {totaleRimanenteDaSaldare.toLocaleString("it-IT")}
              </h3>
            </div>
          </div>
        </div>

        {/* Layout Destra: Suddivisione Analitica Dettaglio Costi Varianti */}
        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 brutalist-shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Dettaglio Costi Varianti</span>
            </h3>
            <span className="text-[10px] font-mono-tech font-bold text-slate-300 uppercase">Suddivisione Macro-Aree</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Macro-area 1: Costi varianti - saldati (Evidenziata in VERDE) */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <span className="text-xs font-mono-tech font-black text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Costi varianti - saldati</span>
                </span>
                <span className="text-[9px] font-mono-tech font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Saldato
                </span>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-2xl font-mono-tech font-black text-emerald-400 tracking-tight">
                  € {totaleGiaSaldato.toLocaleString("it-IT")}
                </p>
                <p className="text-[10px] font-mono-tech font-medium text-slate-300">
                  Importi totali saldati
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-500/30 text-xs text-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-slate-300">Lavorazioni Impresa:</span>
                  <span className="font-bold text-white">€ {saldatoImpresa.toLocaleString("it-IT")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-slate-300">Fornitori Esterni:</span>
                  <span className="font-bold text-white">€ {saldatoFornitore.toLocaleString("it-IT")}</span>
                </div>
              </div>
            </div>

            {/* Macro-area 2: Costi varianti - non saldati (Evidenziata in ROSSO) */}
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                <span className="text-xs font-mono-tech font-black text-rose-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Costi varianti - non saldati</span>
                </span>
                <span className="text-[9px] font-mono-tech font-extrabold bg-rose-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Da Saldare
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-2xl font-mono-tech font-black text-rose-400 tracking-tight">
                  € {totaleRimanenteDaSaldare.toLocaleString("it-IT")}
                </p>
                <p className="text-[10px] font-mono-tech font-medium text-slate-300">
                  Importi ancora da saldare
                </p>
              </div>

              <div className="pt-2 border-t border-rose-500/30 text-xs text-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-slate-300">Lavorazioni Impresa:</span>
                  <span className="font-bold text-white">€ {daSaldareImpresa.toLocaleString("it-IT")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-slate-300">Fornitori Esterni:</span>
                  <span className="font-bold text-white">€ {daSaldareFornitore.toLocaleString("it-IT")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <span>Sincronizzato in tempo reale con lo stato di ogni variante</span>
            <span className="font-bold text-amber-400">
              {variations.filter((v) => v.isPaid).length} Saldate • {variations.filter((v) => !v.isPaid).length} Non Saldate
            </span>
          </div>
        </div>
      </div>

      {/* Variation Request Form / Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 text-white font-sans brutalist-shadow-amber animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white">
                    {userRole === "CLIENTE"
                      ? "Richiedi Nuova Variante Personalizzata"
                      : "Aggiungi Nuova Variante & Extra-Capitolato"}
                  </h3>
                  <p className="text-xs font-mono-tech text-slate-400">
                    {userRole === "CLIENTE"
                      ? "Inoltra una proposta di variazione all'impresa costruttrice"
                      : "Registra e quantifica una variante tecnica o fornitura extra"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setNewTitle("");
                  setNewDescription("");
                  setSupplierName("");
                  setStandardCredit(0);
                  setSupplierQuote(0);
                  setEstimatedCost("");
                  setTechnicalAssessment("");
                  setTimelineImpactDays("");
                  setMaterials("");
                  setNotes("");
                  setHasFeasibilityStudy(false);
                  setFeasibilityFileName("");
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech overflow-y-auto pr-1">
              {/* Category */}
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Tipologia della Variante
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Architettonica" className="bg-slate-900 text-white">Edile / Architettonica (muri, porte, spazi)</option>
                  <option value="Impiantistica" className="bg-slate-900 text-white">Impianti (idraulici, elettrici, climatizzazione)</option>
                  <option value="Finitura/Materiali" className="bg-slate-900 text-white">Finiture & Materiali Interni</option>
                  <option value="Fornitura Esterna" className="bg-slate-900 text-white">Fornitore Esterno</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Titolo della Richiesta
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Spostamento allaccio termosifone zona living"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Descrizione Modifica & Specifiche Richieste
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Fornisci dettagli precisi (es. Spostare il radiatore standard della parete A di 1.5m a destra verso l'angolo...)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-sans text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed placeholder:text-slate-500"
                />
              </div>

              {/* IF EXTERNAL SUPPLIER */}
              {newCategory === "Fornitura Esterna" && (
                <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Nome Fornitore Esterno</label>
                    <input
                      type="text"
                      placeholder="es. Bari Ceramiche, Marmi d'Apulia"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Costo Posa (€)</label>
                    <input
                      type="number"
                      placeholder="es. 600"
                      value={standardCredit || ""}
                      onChange={(e) => setStandardCredit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Costo Fornitore (€)</label>
                    <input
                      type="number"
                      placeholder="es. 2400"
                      value={supplierQuote || ""}
                      onChange={(e) => setSupplierQuote(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="sm:col-span-2 bg-[#111827] p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>Differenza economica calcolata:</span>
                    <span className="font-bold text-amber-400 font-mono-tech">
                      € {Math.max(0, supplierQuote - standardCredit).toLocaleString("it-IT")} Extra
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Impatto sulla timeline (Giorni)</label>
                    <input
                      type="number"
                      placeholder="es. 2"
                      value={timelineImpactDays}
                      onChange={(e) => setTimelineImpactDays(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Note</label>
                    <input
                      type="text"
                      placeholder="es. Da concordare con il fornitore"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* AI Technical Review Toggle (Gemini) */}
              {newCategory !== "Fornitura Esterna" && (
                <div className="flex items-center gap-2 py-2 px-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="use-ai-review"
                    checked={useAi}
                    onChange={(e) => setUseAi(e.target.checked)}
                    className="rounded border-slate-700 bg-[#111827] text-amber-500 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="use-ai-review" className="text-xs font-semibold text-slate-300 cursor-pointer select-none flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Richiedi valutazione tecnica automatica con Assistente IA (Gemini)</span>
                  </label>
                </div>
              )}

              {/* Manual Fields for IMPRESA and TECNICO when AI is not selected */}
              {(userRole === "IMPRESA" || userRole === "TECNICO") && newCategory !== "Fornitura Esterna" && !useAi && (
                <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Dettagli Tecnici & Computo Metrico</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Costo Extra (€)</label>
                      <input
                        type="number"
                        placeholder="es. 450"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Impatto sulla Timeline (giorni)</label>
                      <input
                        type="number"
                        placeholder="es. 2"
                        value={timelineImpactDays}
                        onChange={(e) => setTimelineImpactDays(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="has-feasibility-study"
                      checked={hasFeasibilityStudy}
                      onChange={(e) => setHasFeasibilityStudy(e.target.checked)}
                      className="rounded border-slate-700 bg-[#111827] text-amber-500 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="has-feasibility-study" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                      Carica documento di Studio di Fattibilità
                    </label>
                  </div>

                  {hasFeasibilityStudy && (
                    <div className="space-y-1.5 bg-[#111827] p-3 rounded-lg border border-slate-800">
                      <label className="text-[10px] font-bold text-slate-300 uppercase block">
                        Studio di fattibilità
                      </label>
                      <div
                        onClick={() => document.getElementById("feasibility-file-input")?.click()}
                        className="border border-dashed border-slate-700 hover:border-amber-500 hover:bg-amber-500/5 bg-[#0B0F17] rounded-xl p-4 text-center cursor-pointer transition-colors"
                      >
                        <input
                          type="file"
                          id="feasibility-file-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFeasibilityFileName(file.name);
                            }
                          }}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                        {feasibilityFileName ? (
                          <div className="space-y-1">
                            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                            <p className="text-xs font-bold text-slate-200 truncate max-w-[200px] mx-auto">
                              {feasibilityFileName}
                            </p>
                            <p className="text-[10px] text-amber-400">
                              Clicca per sostituire il file
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <FileUp className="w-8 h-8 text-slate-500 mx-auto" />
                            <p className="text-xs font-medium text-slate-300">
                              Trascina o <span className="text-amber-400 underline font-semibold">sfoglia</span> per caricare il documento
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Supporta PDF, PNG, JPG, DOCX
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Lavorazioni & Materiali (separati da virgola)</label>
                    <input
                      type="text"
                      placeholder="es. Tramezzatura in cartongesso, Stuccatura, Idropittura bianca"
                      value={materials}
                      onChange={(e) => setMaterials(e.target.value)}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Note</label>
                    <input
                      type="text"
                      placeholder="es. Verificare pendenze scarichi prima della posa"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal footer buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Registrazione istantanea nella contabilità
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setNewTitle("");
                      setNewDescription("");
                      setSupplierName("");
                      setStandardCredit(0);
                      setSupplierQuote(0);
                      setEstimatedCost("");
                      setTechnicalAssessment("");
                      setTimelineImpactDays("");
                      setMaterials("");
                      setNotes("");
                      setHasFeasibilityStudy(false);
                      setFeasibilityFileName("");
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-700"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300 font-mono-tech disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        <span>Analisi IA in corso...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Invia Richiesta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variations List Header & Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-mono-tech font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <span>Varianti & Extra-Capitolato Approvati ({totalApprovedCount})</span>
          </h2>

          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono-tech font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-amber-500"
            id="add-variation-btn"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{userRole === "CLIENTE" ? "+ Richiedi Nuova Variante" : "+ Aggiungi Nuova Variante / Extra"}</span>
          </button>
        </div>

        {/* Filter Tabs by Category and Payment */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition-colors cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Tutte ({variations.length})
            </button>
            <button
              onClick={() => setCategoryFilter("Architettonica")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition-colors cursor-pointer ${
                categoryFilter === "Architettonica"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Architettonica ({variations.filter((v) => v.category === "Architettonica").length})
            </button>
            <button
              onClick={() => setCategoryFilter("Impiantistica")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition-colors cursor-pointer ${
                categoryFilter === "Impiantistica"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Impiantistica ({variations.filter((v) => v.category === "Impiantistica").length})
            </button>
            <button
              onClick={() => setCategoryFilter("Finitura/Materiali")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition-colors cursor-pointer ${
                categoryFilter === "Finitura/Materiali"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Finiture ({variations.filter((v) => v.category === "Finitura/Materiali").length})
            </button>
            <button
              onClick={() => setCategoryFilter("Fornitura Esterna")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition-colors cursor-pointer ${
                categoryFilter === "Fornitura Esterna"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Forniture Esterne ({variations.filter((v) => v.category === "Fornitura Esterna").length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono-tech">
            <button
              onClick={() => setPaymentFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === "all" ? "bg-amber-400 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Tutti i Pagamenti
            </button>
            <button
              onClick={() => setPaymentFilter("paid")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === "paid" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Saldate
            </button>
            <button
              onClick={() => setPaymentFilter("unpaid")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === "unpaid" ? "bg-rose-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Da Saldare
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredVariations.map((v) => {
            return (
              <div
                key={v.id}
                className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl p-5 space-y-4 hover:border-amber-400/60 transition-colors duration-200 brutalist-shadow-sm"
                id={`variation-card-${v.id}`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono-tech border border-slate-700">
                        {v.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 font-mono-tech">
                        {v.category}
                      </span>
                      {v.hasAiReview && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono-tech flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>Analisi IA Gemini</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{v.title}</h3>
                    <p className="text-[11px] text-slate-300">
                      Inserito il <span className="font-semibold text-amber-400">{v.requestedAt}</span>
                    </p>
                  </div>

                  {/* Status & Cost Info */}
                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-sm flex items-center gap-1 border border-emerald-400">
                        <CheckCircle className="w-3 h-3 text-slate-950" />
                        Approvata
                      </span>
                    </div>

                    {v.category === "Fornitura Esterna" && v.supplierDetails ? (
                      <div className="flex items-center gap-4 sm:gap-6 text-left sm:text-right mt-1">
                        <div>
                          <p className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wide">Costo Posa:</p>
                          <p className="text-base font-mono-tech font-black text-white">
                            € {v.supplierDetails.standardCredit.toLocaleString("it-IT")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wide">Costo Fornitore:</p>
                          <p className="text-base font-mono-tech font-black text-amber-400">
                            € {v.supplierDetails.supplierQuoteCost.toLocaleString("it-IT")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-left sm:text-right mt-1">
                        <p className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wide">Costo Extra:</p>
                        <p className="text-xl font-mono-tech font-black text-amber-400">
                          € {(v.finalCost || v.estimatedCost || 0).toLocaleString("it-IT")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description and perizia details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Description (Enlarged) */}
                  <div className="lg:col-span-7 space-y-3 bg-slate-900/90 p-5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Descrizione Richiesta</span>
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{v.description}"
                    </p>

                    {v.supplierDetails && (
                      <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="font-bold text-white">Fornitura Esterna: <span className="font-semibold text-amber-400">{v.supplierDetails.supplierName}</span></p>
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                          <div>
                            <span className="text-amber-400 font-medium block text-[10px] uppercase font-mono-tech">Costo Posa:</span>
                            <span className="font-bold text-white text-sm">€ {v.supplierDetails.standardCredit.toLocaleString("it-IT")}</span>
                          </div>
                          <div>
                            <span className="text-amber-400 font-medium block text-[10px] uppercase font-mono-tech">Costo Fornitore:</span>
                            <span className="font-bold text-white text-sm">€ {v.supplierDetails.supplierQuoteCost.toLocaleString("it-IT")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Technical Details (Materials, Timeline, Notes, Feasibility Study File) */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Materials section */}
                    {v.materials && v.materials.length > 0 && (
                      <div className="space-y-1 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wider">Lavorazioni & Materiali</p>
                        <ul className="text-xs text-slate-200 space-y-1 list-disc pl-4 mt-1">
                          {v.materials.map((m, mIdx) => (
                            <li key={mIdx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timeline & Notes box */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-2.5">
                      <div>
                        <p className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wider">Impatto sulla Timeline</p>
                        <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>{v.timelineImpactDays} giorni lavorativi aggiuntivi</span>
                        </p>
                      </div>
                      {v.notes && (
                        <div className="border-t border-slate-800 pt-2 mt-2">
                          <p className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wider">Note</p>
                          <p className="text-xs text-slate-300 italic mt-0.5">{v.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Feasibility Study File download link if available */}
                    {v.feasibilityStudyFile && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <div className="min-w-0">
                            <p className="font-bold text-white">Studio di Fattibilità</p>
                            <p className="text-[10px] text-amber-400 truncate max-w-[150px]">{v.feasibilityStudyFile}</p>
                          </div>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast(`Download simulato di: ${v.feasibilityStudyFile}`, "success");
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold underline shrink-0 ml-4"
                        >
                          Scarica
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scadenze e Pagamenti Box */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3 mt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider">
                        Scadenze & Gestione Pagamento
                      </span>
                    </div>

                    {/* Stato Pagamento */}
                    {userRole !== "CLIENTE" ? (
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateVariationPayment) {
                              onUpdateVariationPayment(v.id, { isPaid: true, balanceDue: 0 });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-mono-tech font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            v.isPaid
                              ? "bg-emerald-500 text-slate-950 shadow-sm border border-emerald-400"
                              : "text-slate-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Pagato</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const choiceTotal = (v.category === "Fornitura Esterna" && v.supplierDetails)
                              ? (v.supplierDetails.supplierQuoteCost + v.supplierDetails.standardCredit)
                              : (v.finalCost || v.estimatedCost || 0);
                            if (onUpdateVariationPayment) {
                              onUpdateVariationPayment(v.id, { isPaid: false, balanceDue: choiceTotal });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-mono-tech font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            !v.isPaid
                              ? "bg-rose-500 text-slate-950 shadow-sm border border-rose-400"
                              : "text-slate-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Non pagato</span>
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech font-black flex items-center gap-1.5 ${
                        v.isPaid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}>
                        {v.isPaid ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Stato: Pagato</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Stato: Non pagato</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Saldo Dovuto */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wider block">
                        Saldo Dovuto (€)
                      </label>
                      {userRole !== "CLIENTE" ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs">€</span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            placeholder="0"
                            value={(() => {
                              const calcVal = v.balanceDue !== undefined
                                ? v.balanceDue
                                : (v.isPaid ? 0 : ((v.category === "Fornitura Esterna" && v.supplierDetails) ? (v.supplierDetails.supplierQuoteCost + v.supplierDetails.standardCredit) : (v.finalCost || v.estimatedCost || 0)));
                              return calcVal === 0 ? "" : calcVal;
                            })()}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                if (onUpdateVariationPayment) {
                                  onUpdateVariationPayment(v.id, {
                                    balanceDue: 0,
                                  });
                                }
                              } else {
                                const val = Number(raw);
                                if (onUpdateVariationPayment) {
                                  onUpdateVariationPayment(v.id, {
                                    balanceDue: val,
                                    isPaid: val === 0,
                                  });
                                }
                              }
                            }}
                            className="w-full pl-7 pr-3 py-1.5 bg-slate-950 text-xs font-mono-tech font-bold text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                          />
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono-tech font-black text-amber-400">
                          € {(v.balanceDue !== undefined
                            ? v.balanceDue
                            : (v.isPaid ? 0 : ((v.category === "Fornitura Esterna" && v.supplierDetails) ? (v.supplierDetails.supplierQuoteCost + v.supplierDetails.standardCredit) : (v.finalCost || v.estimatedCost || 0)))
                          ).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>

                    {/* Da saldare entro: (data) */}
                    {userRole !== "CLIENTE" ? (
                      <VariationDueDateEditor
                        variationId={v.id}
                        currentDueDate={v.dueDate}
                        onUpdateVariationPayment={onUpdateVariationPayment}
                      />
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-wider block">
                          Da saldare entro: (data)
                        </label>
                        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono-tech font-bold text-amber-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            {v.dueDate ? (
                              v.dueDate.includes("-") ? (
                                v.dueDate.split("-").reverse().join("/")
                              ) : (
                                v.dueDate
                              )
                            ) : (
                              "Da definire"
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Perizia / Note Action for Impresa & Tecnico */}
                {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        const assessment = prompt("Inserisci o aggiorna lo studio di fattibilità tecnica / perizia:", v.technicalAssessment || "");
                        const costStr = prompt("Inserisci o aggiorna il costo in Euro:", String(v.finalCost || v.estimatedCost || 0));
                        const daysStr = prompt("Inserisci l'impatto in giorni:", String(v.timelineImpactDays || 0));
                        if (assessment !== null && costStr !== null) {
                          const costNum = Number(costStr) || 0;
                          onUpdateVariationStatus(
                            v.id,
                            "approvata",
                            assessment,
                            costNum,
                            costNum,
                            v.materials && v.materials.length > 0 ? v.materials : ["Materiali edili forniti", "Manodopera COEBO"],
                            Number(daysStr) || 0
                          );
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono-tech font-bold text-xs py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <Construction className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modifica Dettagli Tecnici</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
