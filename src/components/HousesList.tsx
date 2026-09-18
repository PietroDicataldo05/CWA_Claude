import React, { useState } from "react";
import { Building, MapPin, Layers, Home, ChevronRight, LogOut, Sliders, Hash, FileText, User, FolderArchive, ShieldCheck, Users, Search, Filter, CheckCircle2, Edit3, Zap, Menu, X, ChevronDown, ChevronUp, BookOpen, FileCheck, Eye, UploadCloud, Download } from "lucide-react";
import { UserRole, CantiereConfig, UnitConfig, ProjectDocument } from "../types";
import ApartmentCardModal from "./ApartmentCardModal";
import CantiereConfigurator from "./CantiereConfigurator";
import QuickUnitsBatchEditorModal from "./QuickUnitsBatchEditorModal";
import { showToast } from "../lib/toast";

interface HousesListProps {
  onSelectHouse: (houseId: string) => void;
  onLogout: () => void;
  userRole: UserRole;
  cantiereConfig?: CantiereConfig;
  documents?: ProjectDocument[];
  onAddDocument?: (doc: ProjectDocument, file?: File) => void;
  onOpenConfigurator?: () => void;
  onSaveCantiereConfig?: (newConfig: CantiereConfig) => void;
  onSaveUnitConfig?: (updatedUnit: UnitConfig) => void;
  onOpenArchive?: () => void;
  onOpenGestione?: () => void;
  onOpenDocuments?: () => void;
}

export default function HousesList({
  onSelectHouse,
  onLogout,
  userRole,
  cantiereConfig,
  documents,
  onAddDocument,
  onOpenConfigurator,
  onSaveCantiereConfig,
  onSaveUnitConfig,
  onOpenArchive,
  onOpenGestione,
  onOpenDocuments,
}: HousesListProps) {
  const [selectedModalUnit, setSelectedModalUnit] = useState<UnitConfig | null>(null);
  const [isBatchEditorOpen, setIsBatchEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScaleFilter, setSelectedScaleFilter] = useState<string>("ALL");
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // States for Common Cantiere Documents (Disciplinare & Capitolato)
  const [viewingCommonDoc, setViewingCommonDoc] = useState<ProjectDocument | null>(null);
  const [uploadingDocType, setUploadingDocType] = useState<"disciplinare" | "capitolato" | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState<string>("");

  const docsList = documents || [];

  // Retrieve or fallback common site documents
  const disciplinareDoc: ProjectDocument = docsList.find(
    (d) => d.id === "doc-001" || d.title.toLowerCase().includes("disciplinare")
  ) || {
    id: "doc-001",
    title: "Disciplinare di Incarico e Gestione Cantiere",
    category: "contrattuale",
    fileName: "Disciplinare_Incarico_Cantiere_SanPasquale_v2.pdf",
    uploadedBy: "COEBO Admin (Vito & Team)",
    uploadedAt: "2026-05-10 10:00",
    status: "vigente",
    version: 2,
    fileSize: "3.4 MB",
    isSecured: true,
    history: []
  };

  const capitolatoDoc: ProjectDocument = docsList.find(
    (d) => d.id === "doc-002" || d.title.toLowerCase().includes("capitolato")
  ) || {
    id: "doc-002",
    title: "Capitolato Generale dei Lavori e Finiture Cantiere",
    category: "tecnica",
    fileName: "Capitolato_Generale_Finiture_SanPasquale_2026.pdf",
    uploadedBy: "Ing. Francesco Mongelli",
    uploadedAt: "2026-05-12 11:30",
    status: "vigente",
    version: 1,
    fileSize: "5.8 MB",
    isSecured: true,
    history: []
  };

  const config = cantiereConfig || {
    id: "cant-001",
    areaCode: "Area 1",
    projectAppalto: "Residenza San Pasquale",
    location: "Bari",
    name: "Area 1 – Residenza San Pasquale Bari",
    useSiteCodeFormat: true,
    scales: [
      { id: "scale-a", letter: "A", totalFloors: 3, unitsPerFloor: 4 },
      { id: "scale-b", letter: "B", totalFloors: 3, unitsPerFloor: 4 },
    ],
    units: [
      { id: "apt-A01", code: "A01", scaleLetter: "A", floorNumber: 1, numberOnFloor: 1, clientName: "Mario Rossi", totalMq: 85, balconyMq: 15, typology: "Bilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 180000 },
      { id: "apt-A05", code: "A05", scaleLetter: "A", floorNumber: 2, numberOnFloor: 1, clientName: "Elena Rossi", totalMq: 134, balconyMq: 25, typology: "Plurilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 245000 },
    ],
    surfaces: [],
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] bg-blueprint-grid flex flex-col font-sans antialiased text-slate-100">
      {/* Header Principale */}
      <header className="bg-[#0D131F]/95 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-900 border border-amber-500/40 rounded-xl shadow-[2px_2px_0px_0px_rgba(245,158,11,0.5)] shrink-0">
                  <img src="/logo.png" alt="Logo COEBO" className="h-10 w-auto object-contain" />
                </div>
                <div className="hidden sm:block h-6 w-px bg-slate-800" />
                <div className="hidden sm:block">
                  <span className="text-xs font-mono-tech font-black text-amber-400 uppercase tracking-wide block">Piattaforma Gestione Cantiere</span>
                  <span className="text-[11px] font-mono-tech font-semibold text-slate-400 block">COEBO Industrial Construction Suite</span>
                </div>
              </div>

              {/* Mobile / Tablet Toggle Button */}
              <button
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech font-black text-amber-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-amber-500/50 transition-all cursor-pointer"
                aria-label="Riduci o espandi menu"
                title={isNavCollapsed ? "Espandi menu" : "Riduci a icona"}
              >
                {isNavCollapsed ? (
                  <>
                    <Menu className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px]">MENU</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px]">RIDUCI</span>
                  </>
                )}
              </button>
            </div>

            <div className={`${isNavCollapsed ? "hidden md:flex" : "flex"} flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t border-slate-800/80 md:border-t-0`}>
              {userRole !== "CLIENTE" && onOpenGestione && (
                <button
                  onClick={onOpenGestione}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono-tech font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all cursor-pointer border border-amber-400 brutalist-shadow-amber"
                  title="Gestione Cantiere: Assegnazione Clienti & Appartamenti"
                  id="btn-houses-gestione"
                >
                  <Users className="w-4 h-4 text-slate-950" />
                  <span>GESTIONE CANTIERE</span>
                </button>
              )}
              {userRole !== "CLIENTE" && onOpenArchive && (
                <button
                  onClick={onOpenArchive}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono-tech font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all cursor-pointer border border-slate-800 brutalist-shadow-sm"
                  title="Accedi all'Area Protetta Storicizzazione Clienti"
                >
                  <FolderArchive className="w-4 h-4 text-amber-500" />
                  <span>ARCHIVIO PROTETTO</span>
                </button>
              )}
              {onOpenDocuments && (
                <button
                  onClick={onOpenDocuments}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono-tech font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all cursor-pointer border border-slate-800 brutalist-shadow-sm"
                  title="Accedi al Repository Documenti di Cantiere"
                  id="btn-houses-documents"
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>DOCUMENTI CANTIERE</span>
                </button>
              )}
              <span className="text-xs font-mono-tech font-bold text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>RUOLO: <strong className="text-amber-400 font-black">{userRole}</strong></span>
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono-tech font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-500 hover:text-slate-950 rounded-xl transition-colors cursor-pointer border border-rose-500/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ESCI</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">

        {/* 1. SEZIONE SUPERIORE: PANNELLO STRUTTURA DINAMICA CANTIERE */}
        <div className="w-full" id="main-struttura-dinamica-cantiere-top">
          <CantiereConfigurator
            config={config}
            readOnly={userRole === "CLIENTE"}
            collapsible={true}
            defaultExpanded={false}
            onSaveConfig={(newCfg) => {
              if (onSaveCantiereConfig) {
                onSaveCantiereConfig(newCfg);
              }
            }}
          />
        </div>

        {/* 2. SEZIONE: DOCUMENTAZIONE GENERALE DI CANTIERE (DISCIPLINARE & CAPITOLATO) */}
        <div className="bg-[#111827] rounded-2xl p-6 text-white shadow-xl border border-slate-800 space-y-5 brutalist-shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-tech font-black tracking-widest uppercase bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Documentazione Generale di Cantiere
                  </span>
                  <span className="text-[10px] font-mono-tech font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    Validi per tutti gli appartamenti del Cantiere
                  </span>
                </div>
                <h2 className="text-xl font-display font-black tracking-tight text-white mt-1">
                  Disciplinare e Capitolato Generale
                </h2>
                <p className="text-xs text-slate-400">
                  Documenti ufficiali di riferimento per specifiche tecniche, opere da capitolato e disciplina d'appalto inviati a tutti i clienti.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Document Card 1: DISCIPLINARE */}
            <div className="bg-[#0B0F17] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono-tech font-bold text-indigo-400 uppercase tracking-wider block">
                        Disciplinare di Cantiere
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {disciplinareDoc.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-tech font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                    v{disciplinareDoc.version}.0 Vigente
                  </span>
                </div>

                <div className="text-[11px] font-mono-tech text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <p><span className="text-slate-500 font-medium">Nome File:</span> <span className="font-mono text-slate-300">{disciplinareDoc.fileName}</span></p>
                  <p><span className="text-slate-500 font-medium">Pubblicato da:</span> {disciplinareDoc.uploadedBy}</p>
                  <p><span className="text-slate-500 font-medium">Data Aggiornamento:</span> {disciplinareDoc.uploadedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setViewingCommonDoc(disciplinareDoc)}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs font-mono-tech"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizza / Ispeziona</span>
                </button>

                {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                  <button
                    onClick={() => {
                      setUploadingDocType("disciplinare");
                      setUploadFile(null);
                      setUploadNotes("");
                    }}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer font-mono-tech"
                    title="Carica o aggiorna la versione del Disciplinare"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aggiorna</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Card 2: CAPITOLATO */}
            <div className="bg-[#0B0F17] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono-tech font-bold text-emerald-400 uppercase tracking-wider block">
                        Capitolato Generale
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {capitolatoDoc.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-tech font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                    v{capitolatoDoc.version}.0 Vigente
                  </span>
                </div>

                <div className="text-[11px] font-mono-tech text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <p><span className="text-slate-500 font-medium">Nome File:</span> <span className="font-mono text-slate-300">{capitolatoDoc.fileName}</span></p>
                  <p><span className="text-slate-500 font-medium">Pubblicato da:</span> {capitolatoDoc.uploadedBy}</p>
                  <p><span className="text-slate-500 font-medium">Data Aggiornamento:</span> {capitolatoDoc.uploadedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setViewingCommonDoc(capitolatoDoc)}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs font-mono-tech"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizza / Ispeziona</span>
                </button>

                {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                  <button
                    onClick={() => {
                      setUploadingDocType("capitolato");
                      setUploadFile(null);
                      setUploadNotes("");
                    }}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer font-mono-tech"
                    title="Carica o aggiorna la versione del Capitolato"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aggiorna</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 3. TITOLO E SELEZIONE UNITA' ABITATIVE */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 uppercase tracking-wider">
                  {config.projectAppalto}
                </span>
                <span className="text-xs font-mono-tech text-slate-400">• CODICE CANTIERE: {config.areaCode}</span>
              </div>
              <h1 className="text-2xl font-display font-black text-white mt-1.5">{config.name}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{config.location} — Seleziona un appartamento per aprire la Dashboard Cantiere, BIM 3D & Gestione Varianti.</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono-tech font-bold text-slate-300 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>TOTALE UNITA: <strong className="text-amber-400 font-black">{config.units.length}</strong></span>
              </span>

              {userRole !== "CLIENTE" && (
                <button
                  onClick={() => setIsBatchEditorOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono-tech font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all border border-amber-400 brutalist-shadow-amber cursor-pointer"
                  title="Modifica velocemente tipologia, mq, clienti e prezzi di tutti gli appartamenti in una sola tabella"
                  id="btn-houses-batch-editor"
                >
                  <Edit3 className="w-4 h-4 text-slate-950" />
                  <span>TABELLARE INTERNI</span>
                </button>
              )}
            </div>
          </div>

          {/* FILTRI DI RICERCA RAPIDA & SCALA */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca per codice (es. A05) o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0B0F17] text-xs border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-mono-tech placeholder-slate-500"
              />
            </div>

            {/* Scale Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-mono-tech font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span>FILTRA SCALA:</span>
              </span>
              <button
                onClick={() => setSelectedScaleFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                  selectedScaleFilter === "ALL"
                    ? "bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-sm"
                    : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
              >
                TUTTE ({config.scales.length})
              </button>
              {config.scales.map((scale) => (
                <button
                  key={scale.id}
                  onClick={() => setSelectedScaleFilter(scale.letter)}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                    selectedScaleFilter === scale.letter
                      ? "bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-sm"
                      : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  SCALA {scale.letter}
                </button>
              ))}
            </div>
          </div>

          {/* GRID PER LE SCALE E I PIANI */}
          <div className="space-y-6">
            {config.scales
              .filter((scale) => selectedScaleFilter === "ALL" || selectedScaleFilter === scale.letter)
              .map((scale) => {
                let scaleUnits = config.units.filter((u) => u.scaleLetter === scale.letter);
                
                // Filter by search query if present
                if (searchTerm.trim() !== "") {
                  const q = searchTerm.toLowerCase();
                  scaleUnits = scaleUnits.filter(
                    (u) =>
                      u.code.toLowerCase().includes(q) ||
                      (u.clientName && u.clientName.toLowerCase().includes(q)) ||
                      (u.typology && u.typology.toLowerCase().includes(q))
                  );
                }

                const floorsMap: { [floorNum: number]: typeof scaleUnits } = {};
                for (let f = 1; f <= scale.totalFloors; f++) {
                  floorsMap[f] = scaleUnits.filter((u) => u.floorNumber === f);
                }

                if (scaleUnits.length === 0 && searchTerm.trim() !== "") {
                  return (
                    <div key={scale.id} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 text-center text-slate-400 font-mono-tech text-xs">
                      Nessun appartamento trovato in Scala {scale.letter} per "{searchTerm}"
                    </div>
                  );
                }

                return (
                  <div key={scale.id} className="bg-[#0D121D] rounded-2xl border border-slate-800 p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center font-display border border-amber-400 brutalist-shadow-amber">
                          {scale.letter}
                        </div>
                        <div>
                          <h3 className="text-base font-display font-black text-white">
                            Scala {scale.letter}
                          </h3>
                          <p className="text-xs font-mono-tech text-slate-400">
                            {scale.totalFloors} Piani Complessivi • {scale.unitsPerFloor} Unità per Piano
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono-tech font-extrabold text-amber-400 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
                        {scaleUnits.length} Unità Abitative
                      </span>
                    </div>

                    <div className="space-y-5">
                      {Object.keys(floorsMap).map((floorStr) => {
                        const floorNum = Number(floorStr);
                        const floorUnits = floorsMap[floorNum];
                        if (floorUnits.length === 0 && searchTerm.trim() !== "") return null;

                        return (
                          <div key={floorNum} className="space-y-3">
                            <div className="text-xs font-mono-tech font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-amber-500" />
                              <span>
                                {floorNum === 1
                                  ? "Primo Piano"
                                  : floorNum === 2
                                  ? "Secondo Piano"
                                  : floorNum === 3
                                  ? "Terzo Piano"
                                  : `${floorNum}° Piano`}
                              </span>
                              <span className="text-[10px] font-normal text-slate-500 lowercase">
                                ({floorUnits.length} unità)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {floorUnits.map((apt) => (
                                <div
                                  key={apt.id}
                                  onClick={() => onSelectHouse(apt.id)}
                                  className="bg-[#111827] border border-slate-800 hover:border-amber-400 transition-all duration-200 rounded-xl p-4 flex flex-col justify-between group cursor-pointer relative hover:-translate-y-1 brutalist-shadow-sm hover:brutalist-shadow-amber"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-900 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-all border border-slate-800 group-hover:border-amber-400 shrink-0">
                                          <Home className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <span className="block text-sm font-mono-tech font-black text-white group-hover:text-amber-400 transition-colors">
                                            Int. {apt.code}
                                          </span>
                                          <span className="block text-[11px] font-mono-tech text-slate-400">
                                            {apt.typology || "Plurilocale"} • {apt.totalMq || 134} mq
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedModalUnit(apt);
                                        }}
                                        className="p-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-lg text-[10px] font-mono-tech font-bold transition-all cursor-pointer border border-slate-800"
                                        title="Scheda Dettagliata Appartamento"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
                                      {apt.balconyMq && apt.balconyMq > 0 ? (
                                        <span className="text-[10px] font-mono-tech bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 inline-block">
                                          Balconi: {apt.balconyMq} mq
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono-tech text-slate-500">Interno standard</span>
                                      )}
                                      {apt.clientName ? (
                                        <span className="text-[9px] font-mono-tech bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-black">
                                          ASSEGNATO
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-mono-tech bg-amber-950/60 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                                          DISPONIBILE
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                                      <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span className="text-slate-300 font-mono-tech font-bold text-[11px] truncate">
                                        {apt.clientName || "Cliente Assegnato"}
                                      </span>
                                    </div>
                                    <div className="text-amber-400 group-hover:text-amber-300 font-mono-tech font-black text-xs flex items-center gap-0.5 shrink-0">
                                      <span>ACCEDI</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </main>

      {/* Apartment Card Modal */}
      {selectedModalUnit && (
        <ApartmentCardModal
          unit={selectedModalUnit}
          cantiereConfig={config}
          userRole={userRole}
          onClose={() => setSelectedModalUnit(null)}
          onSaveUnit={(updatedUnit) => {
            if (onSaveUnitConfig) {
              onSaveUnitConfig(updatedUnit);
            }
            setSelectedModalUnit(updatedUnit);
          }}
          onSelectAndNavigate={(unitId) => {
            setSelectedModalUnit(null);
            onSelectHouse(unitId);
          }}
        />
      )}

      {/* Quick Units Batch Editor Modal */}
      {isBatchEditorOpen && (
        <QuickUnitsBatchEditorModal
          config={config}
          onClose={() => setIsBatchEditorOpen(false)}
          onSaveUnits={(updatedUnits) => {
            if (onSaveCantiereConfig) {
              onSaveCantiereConfig({
                ...config,
                units: updatedUnits,
              });
            }
          }}
        />
      )}

      {/* Modal Visualizzazione Documento Comune (Disciplinare / Capitolato) */}
      {viewingCommonDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider bg-amber-100 px-2 py-0.5 rounded-full">
                    Documento Ufficiale di Cantiere
                  </span>
                  <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                    {viewingCommonDoc.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setViewingCommonDoc(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 text-xs text-slate-600 pr-1">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Nome File Ufficiale</span>
                  <span className="font-mono text-slate-900 font-bold">{viewingCommonDoc.fileName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Versione Attiva</span>
                  <span className="font-extrabold text-emerald-700">v{viewingCommonDoc.version}.0 (Vigente per tutto il cantiere)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Caricato Da</span>
                  <span className="font-semibold text-slate-800">{viewingCommonDoc.uploadedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Data di Pubblicazione</span>
                  <span className="font-semibold text-slate-800">{viewingCommonDoc.uploadedAt}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-900 text-xs uppercase">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Certificazione di Integrità e Validità Generale</span>
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Questo documento ha validità per tutti gli appartamenti compresi nel cantiere COEBO ({config.name}). Ogni richiesta di variante o personalizzazione sarà valutata ed integrata nel rispetto delle norme stabilite nel presente fascicolo.
                </p>
                {viewingCommonDoc.sha256 && (
                  <p className="text-[10px] font-mono text-amber-800/70 break-all pt-1 border-t border-amber-200/60">
                    Impronta Digitale SHA-256: {viewingCommonDoc.sha256}
                  </p>
                )}
              </div>

              {viewingCommonDoc.fileUrl ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-900 flex flex-col items-center">
                  <iframe
                    src={viewingCommonDoc.fileUrl}
                    className="w-full h-[400px] border-0"
                    title={viewingCommonDoc.title}
                  />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-slate-200 space-y-2 font-mono text-[11px]">
                  <p className="text-amber-400 font-bold">// Anteprima Sintesi Esecutiva Fascicolo Cantiere</p>
                  <p>--- FASCICOLO GENERALE D'APPALTO & SPECIFICHE TECNICHE ---</p>
                  <p>1. Disciplina dei Lavori e Modalità di Accesso al Cantiere.</p>
                  <p>2. Capitolato delle Finiture Standard e Parametri di Scelta Materiali.</p>
                  <p>3. Regolamento delle Richieste Varianti Extra-Capitolato.</p>
                  <p>4. Tempi di Consegna e Saldi Economici della Commessa.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 font-mono">Formato PDF • {viewingCommonDoc.fileSize || "3.5 MB"}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingCommonDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Chiudi
                </button>
                <a
                  href={viewingCommonDoc.fileUrl || `#download-${viewingCommonDoc.id}`}
                  download={viewingCommonDoc.fileName}
                  onClick={(e) => {
                    if (!viewingCommonDoc.fileUrl) {
                      e.preventDefault();
                      showToast(`Download in corso del file ufficiale: ${viewingCommonDoc.fileName}`, "success");
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Scarica File Ufficiale</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Caricamento / Aggiornamento Documento Comune (Disciplinare o Capitolato) */}
      {uploadingDocType && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    Pannello Impresa Cantiere
                  </span>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    {uploadingDocType === "disciplinare"
                      ? "Aggiorna Disciplinare di Cantiere"
                      : "Aggiorna Capitolato Generale"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setUploadingDocType(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!uploadFile) {
                  showToast("Seleziona prima un file da caricare.", "error");
                  return;
                }

                const docTitle =
                  uploadingDocType === "disciplinare"
                    ? "Disciplinare di Incarico e Gestione Cantiere"
                    : "Capitolato Generale dei Lavori e Finiture Cantiere";

                const category = uploadingDocType === "disciplinare" ? "contrattuale" : "tecnica";
                const fileSizeStr = (uploadFile.size / (1024 * 1024)).toFixed(1) + " MB";
                const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

                const newDoc: ProjectDocument = {
                  id: uploadingDocType === "disciplinare" ? "doc-001" : "doc-002",
                  title: docTitle,
                  category: category,
                  fileName: uploadFile.name,
                  uploadedBy: userRole === "IMPRESA" ? "COEBO Admin (Vito & Team)" : "Ing. Francesco Mongelli",
                  uploadedAt: nowStr,
                  status: "vigente",
                  version: (uploadingDocType === "disciplinare" ? disciplinareDoc.version : capitolatoDoc.version) + 1,
                  fileSize: fileSizeStr,
                  isSecured: true,
                  isGeneralCantiereDoc: true,
                  history: [
                    {
                      version: (uploadingDocType === "disciplinare" ? disciplinareDoc.version : capitolatoDoc.version) + 1,
                      date: nowStr,
                      user: userRole === "IMPRESA" ? "COEBO Admin" : "Ing. F. Mongelli",
                      description: uploadNotes || `Nuova versione pubblicata per tutto il cantiere.`,
                      fileName: uploadFile.name
                    }
                  ]
                };

                if (onAddDocument) {
                  onAddDocument(newDoc, uploadFile);
                }
                showToast(`File PDF "${uploadFile.name}" inserito ed inviato con successo! Tutti i clienti del cantiere riceveranno ed avranno accesso immediato al documento.`, "success");
                setUploadingDocType(null);
              }}
              className="space-y-4 text-xs text-slate-700"
            >
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">Documento di riferimento:</p>
                <p className="text-slate-500 text-[11px]">
                  {uploadingDocType === "disciplinare"
                    ? "Disciplinare di Incarico e Gestione Cantiere (Valido per tutti i clienti)"
                    : "Capitolato Generale delle Opere e Finiture (Valido per tutti i clienti)"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Seleziona File (PDF o DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Note sulla nuova versione (Opzionale)</label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Inserisci note o dettagli della revisione..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadingDocType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Pubblica per Tutti i Clienti</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

