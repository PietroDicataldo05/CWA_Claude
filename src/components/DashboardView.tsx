import React, { useState } from "react";
import type { ReactNode, ReactElement } from "react";
import { ProjectDocument, VariationRequest, ProjectTimelinePhase, UserRole, CantiereConfig, UnitConfig } from "../types";
import ApartmentCardModal from "./ApartmentCardModal";
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  DollarSign,
  Info,
  MapPin,
  UserCheck,
  Check,
  Sliders,
  Building2,
  Wrench,
  FileCheck,
  Euro,
  User,
  Home,
  Upload,
  UploadCloud,
  ExternalLink,
  Plus,
  UserPlus,
  Layers
} from "lucide-react";
import { PROJECT_DETAILS } from "../data/mockData";
import { motion } from "framer-motion";

interface DashboardViewProps {
  phases: ProjectTimelinePhase[];
  documents: ProjectDocument[];
  variations: VariationRequest[];
  userRole: UserRole;
  cantiereConfig?: CantiereConfig;
  selectedHouseId?: string | null;
  onSaveCantiereConfig?: (newConfig: CantiereConfig) => void;
  onSaveUnitConfig?: (updatedUnit: UnitConfig) => void;
  onUpdateVariationStatus?: (
    id: string,
    status: "richiesta" | "in_valutazione" | "approvata" | "rifiutata" | "completata",
    technicalAssessment?: string,
    estimatedCost?: number,
    finalCost?: number,
    materials?: string[],
    days?: number
  ) => void;
  onUpdatePhaseStatus?: (id: number, status: "completato" | "in_corso" | "da_iniziare") => void;
  onNavigate?: (tab: string) => void;
  onAddDocument?: (doc: ProjectDocument) => void;
}

export default function DashboardView({
  phases,
  documents,
  variations,
  userRole,
  cantiereConfig,
  selectedHouseId,
  onSaveCantiereConfig,
  onSaveUnitConfig,
  onUpdateVariationStatus,
  onUpdatePhaseStatus,
  onNavigate,
  onAddDocument
}: DashboardViewProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(2);
  const [showApartmentModal, setShowApartmentModal] = useState<boolean>(false);

  // Active unit configuration
  const currentUnit: UnitConfig = (cantiereConfig?.units || []).find(
    (u) => u.id === selectedHouseId
  ) || {
    id: "apt-A05",
    code: "A05",
    scaleLetter: "A",
    floorNumber: 2,
    numberOnFloor: 1,
    clientName: "Elena Rossi",
    totalMq: 134,
    balconyMq: 25,
    typology: "Plurilocale",
    address: "Via Roberto Da Bari 62 / Cantiere San Pasquale, Bari",
    basePrice: 245000,
  };

  // Legacy per-room surface breakdown, superseded by unit.totalMq / unit.balconyMq below
  const surfaces = cantiereConfig?.surfaces || [];
  const totalBalconiMq = surfaces.filter((s) => s.type === "balcone").reduce((acc, s) => acc + s.surfaceMq, 0);
  const totalSurfaceMq = surfaces.reduce((acc, s) => acc + s.surfaceMq, 0);

  // Calculate stats
  const completedPhasesCount = phases.filter((p) => p.status === "completato").length;
  const overallProgress = Math.round((completedPhasesCount / phases.length) * 100);

  const baseContractValue = 245000;
  const approvedExtrasValue = variations
    .filter((v) => v.status === "approvata" || v.status === "completata")
    .reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0);

  const activePhase = phases.find((p) => p.id === selectedPhaseId) || phases[2];

  const getRelatedDocs = (phaseId: number) => {
    if (phaseId === 0) {
      return documents.filter((d) => d.id === "doc-005" || d.id === "doc-006");
    } else if (phaseId === 1) {
      return documents.filter((d) => d.id === "doc-003" || d.id === "doc-004" || d.id === "doc-007");
    } else if (phaseId === 2) {
      return documents.filter((d) => d.id === "doc-001" || d.id === "doc-002");
    } else if (phaseId === 3) {
      return documents.filter((d) => d.id === "doc-004" || d.category === "personalizzazione");
    }
    return [];
  };

  const getRelatedVariations = (phaseId: number) => {
    if (phaseId === 1) {
      return variations.filter((v) => v.category === "Architettonica");
    } else if (phaseId === 2) {
      return variations.filter((v) => v.category === "Impiantistica");
    } else if (phaseId === 3) {
      return variations.filter(
        (v) => v.category === "Finitura/Materiali" || v.category === "Fornitura Esterna"
      );
    }
    return [];
  };

  const relatedDocs = getRelatedDocs(selectedPhaseId);
  const relatedVariations = getRelatedVariations(selectedPhaseId);

  const cantiereName = cantiereConfig?.name || PROJECT_DETAILS.name;

  if (!activePhase) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm font-mono-tech">
        Caricamento dati cantiere in corso...
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* 1. KPIs Grid */}
      <div className={`grid grid-cols-1 ${userRole === "TECNICO" ? "md:grid-cols-1" : "md:grid-cols-3"} gap-4`}>
        {/* KPI 1: Overall Progress */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between brutalist-shadow-sm">
          <div>
            <p className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider">Avanzamento Cantiere</p>
            <h3 className="text-2xl font-mono-tech font-black text-white mt-1">{overallProgress}%</h3>
            <p className="text-xs font-mono-tech text-slate-300 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{completedPhasesCount} di {phases.length} fasi completate</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Base Budget */}
        {userRole !== "TECNICO" && (
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between brutalist-shadow-sm">
            <div>
              <p className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider">Prezzo Immobile Standard</p>
              <h3 className="text-2xl font-mono-tech font-black text-white mt-1">€ {baseContractValue.toLocaleString("it-IT")}</h3>
              <p className="text-xs font-mono-tech text-slate-300 mt-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Come da preliminare firmato</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* KPI 3: Extra-Capitolato Approved */}
        {userRole !== "TECNICO" && (
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between brutalist-shadow-sm">
            <div>
              <p className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider">Varianti Approvate</p>
              <h3 className="text-2xl font-mono-tech font-black text-amber-400 mt-1">
                + € {approvedExtrasValue.toLocaleString("it-IT")}
              </h3>
              <p className="text-xs font-mono-tech text-slate-300 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contabilizzate nello storico extra</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Grid: Timeline + Unit specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline (Left 2 cols) */}
        <div className="lg:col-span-2 bg-[#111827] rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6 brutalist-shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-mono-tech font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Cronoprogramma & Stato Avanzamento</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">Seleziona una fase per ispezionare i dettagli operativi e i file allegati.</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-mono-tech px-3 py-1 rounded-lg bg-amber-500/20 font-bold text-amber-400 border border-amber-500/30">
              Fase Attiva: 2. Progettazione Impianti
            </span>
          </div>

          {/* Interactive Timeline Track */}
          <div className="relative pt-4 pb-6 px-1">
            <div className="absolute top-[2.25rem] left-6 right-6 h-1 bg-slate-800 -z-10 rounded-full hidden md:block" />
            <div 
              className="absolute top-[2.25rem] left-6 h-1 bg-amber-400 -z-10 rounded-full transition-all duration-500 hidden md:block shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              style={{ width: `${(completedPhasesCount / (phases.length - 1)) * 100}%` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {phases.map((phase) => {
                const isSelected = selectedPhaseId === phase.id;
                const isCompleted = phase.status === "completato";
                const isInProgress = phase.status === "in_corso";

                return (
                  <button
                    key={phase.id}
                    onClick={() => setSelectedPhaseId(phase.id)}
                    className="flex md:flex-col items-start md:items-center text-left md:text-center group focus:outline-none w-full cursor-pointer"
                    id={`timeline-phase-${phase.id}`}
                  >
                    <div className="mr-4 md:mr-0 mb-0 md:mb-3 flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 border-amber-400 font-black ring-4 ring-amber-400/30 scale-105"
                            : isCompleted
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold group-hover:bg-emerald-400"
                            : isInProgress
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-bold group-hover:bg-amber-400"
                            : "bg-slate-900 text-slate-300 border-slate-700 group-hover:border-slate-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-slate-950" />
                        ) : (
                          <span className="text-xs font-mono-tech font-bold">{phase.id}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4
                        className={`text-xs font-bold leading-tight transition-colors duration-200 ${
                          isSelected
                            ? "text-amber-400 font-black"
                            : "text-slate-200 group-hover:text-white"
                        }`}
                      >
                        {phase.title.split(":")[0]}
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-1 md:hidden lg:block">
                        {phase.title.split(":")[1]?.trim()}
                      </p>
                      <span className="text-[10px] font-mono-tech inline-block font-semibold mt-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        Scadenza: {new Date(phase.dueDate).toLocaleDateString("it-IT", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Phase Card */}
          <motion.div
            key={selectedPhaseId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono-tech uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                  {activePhase.status === "completato"
                    ? "Fase Completata"
                    : activePhase.status === "in_corso"
                    ? "In Corso Operativo"
                    : "Da Avviare"}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{activePhase.title}</h3>
              </div>
              <div className="text-xs font-mono-tech font-medium text-slate-200 flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Scadenza: {new Date(activePhase.dueDate).toLocaleDateString("it-IT")}</span>
                {activePhase.completedDate && (
                  <span className="text-emerald-400 font-bold ml-1">
                    (Completato il {new Date(activePhase.completedDate).toLocaleDateString("it-IT")})
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activePhase.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <h4 className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Documenti Associati ({relatedDocs.length})</span>
                </h4>
                {relatedDocs.length === 0 ? (
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-dashed border-slate-800">
                    Nessun documento specifico collegato.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {relatedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-200 truncate">{doc.title}</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono ml-2">{doc.fileSize}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Varianti di questa Fase ({relatedVariations.length})</span>
                </h4>
                {relatedVariations.length === 0 ? (
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-dashed border-slate-800">
                    Nessuna richiesta di variante legata a questa fase.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {relatedVariations.map((v) => (
                      <div
                        key={v.id}
                        className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs hover:border-amber-400 transition-colors"
                      >
                        <span className="font-semibold text-slate-200 truncate">{v.title}</span>
                        <span className="text-[9px] uppercase font-mono-tech font-bold px-2 py-0.5 rounded shrink-0 ml-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          approvato
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(userRole === "TECNICO" || userRole === "IMPRESA") && activePhase.status !== "completato" && (
              <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={() => {
                    if (onUpdatePhaseStatus) {
                      onUpdatePhaseStatus(activePhase.id, "completato");
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  id={`mark-complete-btn-${activePhase.id}`}
                >
                  <Check className="w-4 h-4" />
                  <span>Contrassegna come completato</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Project & Unit Specifications (Right 1 col) */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6 brutalist-shadow-sm">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-mono-tech font-bold text-white">Scheda dell'Immobile</h2>
            <p className="text-xs text-slate-300 mt-0.5">Dettagli cantiere & ripartizione superfici.</p>
          </div>

          <div className="divide-y divide-slate-800">
            <div className="py-3 flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-mono-tech tracking-wider font-bold text-amber-400">Localizzazione Cantiere</p>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">{PROJECT_DETAILS.address}</p>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-mono-tech tracking-wider font-bold text-amber-400">Complesso & Denominazione</p>
                <p className="text-xs font-black text-white leading-tight mt-0.5">
                  {cantiereName}
                </p>
                <p className="text-[11px] font-semibold text-slate-300 mt-0.5">
                  Unità: Scala A - Secondo Piano (Int. A05)
                </p>
              </div>
            </div>

            {/* Card Riepilogativa "Scheda Appartamento" con i 9 campi richiesti */}
            <div className="py-4 bg-slate-900/90 rounded-2xl p-4 border border-amber-400/30 space-y-3 my-2 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono-tech font-black text-amber-400 uppercase tracking-tight">
                    Scheda Riepilogativa Appartamento
                  </span>
                </div>
                <button
                  onClick={() => setShowApartmentModal(true)}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Apri Scheda
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">Scala & Piano:</span>
                  <span className="font-extrabold text-white">
                    Scala {currentUnit.scaleLetter} • Piano {currentUnit.floorNumber}
                  </span>
                </div>
                <div>
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">Interno:</span>
                  <span className="font-extrabold text-white">
                    Interno {currentUnit.code}
                  </span>
                </div>
                <div>
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">Cliente Associato:</span>
                  <span className="font-extrabold text-white truncate block">
                    {currentUnit.clientName || "Elena Rossi"}
                  </span>
                </div>
                <div>
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">Tipologia:</span>
                  <span className="font-extrabold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px] border border-amber-400/30">
                    {currentUnit.typology || "Plurilocale"}
                  </span>
                </div>
                <div>
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">mq Totali / Balconi:</span>
                  <span className="font-extrabold text-white">
                    {currentUnit.totalMq || totalSurfaceMq} mq ({currentUnit.balconyMq || totalBalconiMq} mq balc.)
                  </span>
                </div>
                <div>
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">Costo Base:</span>
                  <span className="font-black text-emerald-400">
                    € {(currentUnit.basePrice || baseContractValue).toLocaleString("it-IT")}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800">
                  <span className="text-amber-400/80 block text-[9px] uppercase font-bold font-mono-tech">Via Principale:</span>
                  <span className="font-semibold text-slate-200 text-[10px]">
                    {currentUnit.address || PROJECT_DETAILS.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-mono-tech tracking-wider font-bold text-amber-400">Responsabili Commessa</p>
                <div className="text-xs font-bold text-white leading-tight mt-0.5">
                  <p>COEBO S.r.l. (Vito Conversano)</p>
                  <p className="font-normal text-slate-300 text-[11px] mt-0.5">
                    Progettista: Ing. F. Mongelli
                  </p>
                </div>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-mono-tech tracking-wider font-bold text-amber-400">Stima Consegna Immobile</p>
                <p className="text-xs font-bold text-amber-400 leading-tight mt-0.5">
                  {PROJECT_DETAILS.deliveryEstimate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Scheda Appartamento */}
      {showApartmentModal && (
        <ApartmentCardModal
          unit={currentUnit}
          cantiereConfig={
            cantiereConfig || {
              id: "cant-001",
              areaCode: "Area 1",
              projectAppalto: "Residenza San Pasquale",
              location: "Bari",
              name: "Area 1 – Residenza San Pasquale Bari",
              useSiteCodeFormat: true,
              scales: [],
              units: [],
              surfaces: [],
            }
          }
          userRole={userRole}
          onClose={() => setShowApartmentModal(false)}
          onSaveUnit={(updated) => {
            if (onSaveUnitConfig) onSaveUnitConfig(updated);
          }}
        />
      )}

    </div>
  );
}

