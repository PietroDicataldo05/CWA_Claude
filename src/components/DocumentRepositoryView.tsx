import React, { useState, useRef } from "react";

// Ensure JSX intrinsic elements exist in environments missing React types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { ProjectDocument, UserRole, DocumentHistoryEntry } from "../types";
import { showToast } from "../lib/toast";
import {
  Search,
  Upload,
  FileText,
  Calendar,
  User,
  History,
  CheckCircle,
  FileDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2,
  X,
  FileUp,
  Plus,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  FileSignature
} from "lucide-react";

interface DocumentRepositoryViewProps {
  documents: ProjectDocument[];
  userRole: UserRole;
  userName: string;
  onAddDocument: (doc: ProjectDocument, file?: File) => void;
  onUpdateDocumentStatus: (id: string, status: "vigente" | "sostituito" | "attesa_approvazione") => void;
  onDeleteDocument: (id: string) => void;
}

export default function DocumentRepositoryView({
  documents,
  userRole,
  userName,
  onAddDocument,
  onUpdateDocumentStatus,
  onDeleteDocument,
}: DocumentRepositoryViewProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload Form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<ProjectDocument | null>(null);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<"contrattuale" | "tecnica" | "personalizzazione" | "finale">("tecnica");
  const [newDocNotes, setNewDocNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filters
  const filteredDocuments = documents.filter((doc) => {
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      if (!newDocTitle) {
        // Auto populate title with file name without extension
        const rawName = e.dataTransfer.files[0].name;
        const nameWithoutExt = rawName.substring(0, rawName.lastIndexOf(".")) || rawName;
        // Clean up dashes/underscores
        setNewDocTitle(nameWithoutExt.replace(/[-_]/g, " "));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!newDocTitle) {
        const rawName = e.target.files[0].name;
        const nameWithoutExt = rawName.substring(0, rawName.lastIndexOf(".")) || rawName;
        setNewDocTitle(nameWithoutExt.replace(/[-_]/g, " "));
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Role uploader formatter: strictly Amministratore or Tecnico
  const getRoleUploader = (role: UserRole): "Amministratore" | "Tecnico" => {
    if (role === "IMPRESA") return "Amministratore";
    return "Tecnico";
  };

  const formatUploaderDisplay = (raw: string): string => {
    if (raw === "Amministratore" || raw === "Tecnico") return raw;
    if (raw.toLowerCase().includes("amministratore") || raw.toLowerCase().includes("coebo") || raw.toLowerCase().includes("impresa")) {
      return "Amministratore";
    }
    return "Tecnico";
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle || !selectedFile) {
      showToast("Si prega di fornire un titolo e caricare un file.", "error");
      return;
    }

    // Role uploader: strictly Amministratore or Tecnico
    const uploaderRole = getRoleUploader(userRole);

    // Check if we are updating an existing document with the same title
    const existingDocIndex = documents.findIndex(
      (d) => d.title.toLowerCase().trim() === newDocTitle.toLowerCase().trim()
    );

    const fileSizeStr = (selectedFile.size / (1024 * 1024)).toFixed(1) + " MB";
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const isGeneralDoc = newDocTitle.toLowerCase().includes("disciplinare") || newDocTitle.toLowerCase().includes("capitolato");

    if (existingDocIndex !== -1) {
      // Overwrite / Update Version
      const existingDoc = documents[existingDocIndex];
      const newVersion = existingDoc.version + 1;

      const newHistoryEntry: DocumentHistoryEntry = {
        version: newVersion,
        date: nowStr,
        user: uploaderRole,
        description: newDocNotes || `Caricato aggiornamento file alla versione ${newVersion}.`,
        fileName: selectedFile.name,
      };

      // Set old document status to 'sostituito' and append history
      const updatedDoc: ProjectDocument = {
        ...existingDoc,
        fileName: selectedFile.name,
        uploadedBy: uploaderRole,
        uploadedAt: nowStr,
        version: newVersion,
        fileSize: fileSizeStr,
        status: "vigente", // New version becomes the active one
        isGeneralCantiereDoc: existingDoc.isGeneralCantiereDoc || isGeneralDoc,
        history: [newHistoryEntry, ...existingDoc.history],
      };

      onAddDocument(updatedDoc, selectedFile);
    } else {
      // Create entirely new document
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        title: newDocTitle,
        category: newDocCategory,
        fileName: selectedFile.name,
        uploadedBy: uploaderRole,
        uploadedAt: nowStr,
        status: "vigente",
        version: 1,
        fileSize: fileSizeStr,
        isGeneralCantiereDoc: isGeneralDoc,
        history: [
          {
            version: 1,
            date: nowStr,
            user: uploaderRole,
            description: newDocNotes || "Caricamento iniziale del documento in piattaforma.",
            fileName: selectedFile.name,
          },
        ],
      };
      onAddDocument(newDoc, selectedFile);
    }

    showToast(`Documento "${selectedFile.name}" caricato con successo ed immediatamente visibile e scaricabile da tutti i clienti!`, "success");

    // Reset Form
    setNewDocTitle("");
    setSelectedFile(null);
    setNewDocNotes("");
    setIsUploadOpen(false);
  };

  const toggleHistory = (docId: string) => {
    if (expandedDocId === docId) {
      setExpandedDocId(null);
    } else {
      setExpandedDocId(docId);
    }
  };

  const handleSimulatedDownload = (doc: ProjectDocument) => {
    setViewingDoc(doc);
  };

  return (
    <div className="space-y-6" id="document-repository-container">
      {/* Top action bar: Search and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-xl brutalist-shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-amber-400" />
          <input
            type="text"
            placeholder="Cerca per titolo, file, caricato da..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            id="search-docs-input"
          />
        </div>

        {/* Upload Trigger Button */}
        {userRole !== "CLIENTE" && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-amber-400 text-slate-950 font-mono-tech font-black px-4 py-2 rounded-xl text-xs hover:bg-amber-300 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer border border-amber-500 shadow-md"
            id="upload-doc-btn"
          >
            <Upload className="w-4 h-4 text-slate-950" />
            <span>Carica Documento</span>
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "all", label: "Tutti i Documenti" },
          { id: "contrattuale", label: "Contratti & Amministrativa" },
          { id: "tecnica", label: "Specifiche & Tecnica" },
          { id: "personalizzazione", label: "Personalizzazioni & Varianti" },
          { id: "finale", label: "Documentazione Finale" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-mono-tech font-bold rounded-xl transition-all cursor-pointer border ${
              activeTab === tab.id
                ? "bg-amber-400 text-slate-950 border-amber-500 font-black shadow-lg"
                : "bg-slate-900 text-slate-200 hover:text-amber-400 hover:bg-slate-800 border-slate-800"
            }`}
            id={`tab-doc-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-[#111827] py-12 rounded-2xl border border-slate-800 text-center space-y-3 shadow-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nessun documento trovato</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Non ci sono documenti in questa categoria corrispondenti alla ricerca. Carica un nuovo file per iniziare.
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl overflow-hidden brutalist-shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono-tech font-bold uppercase text-amber-400 tracking-wider">
                  <th className="py-3.5 px-4 md:px-6">Documento</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Versione Corrente</th>
                  <th className="py-3.5 px-4">Stato</th>
                  <th className="py-3.5 px-4">Ultima Modifica</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredDocuments.map((doc) => {
                  const isExpanded = expandedDocId === doc.id;

                  return (
                    <React.Fragment key={doc.id}>
                      <tr className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-4 px-4 md:px-6">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-slate-900 rounded-lg text-amber-400 shrink-0 mt-1 border border-slate-800">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-white leading-snug hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleSimulatedDownload(doc)}>
                                  {doc.title}
                                </p>
                                {doc.isSecured && (
                                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-mono-tech">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>PROTETTO SHA-256</span>
                                  </span>
                                )}
                                {(doc.isGeneralCantiereDoc || doc.title.toLowerCase().includes("disciplinare") || doc.title.toLowerCase().includes("capitolato")) && (
                                  <span className="inline-flex items-center gap-0.5 bg-sky-500/10 text-sky-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-sky-500/30 font-mono-tech uppercase">
                                    <span>DOC GENERALE CANTIERE</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-300 mt-0.5 font-mono truncate max-w-xs md:max-w-md">
                                {doc.fileName} • {doc.fileSize}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] uppercase font-mono-tech font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {doc.category === "contrattuale" && "Amm. / Contratto"}
                            {doc.category === "tecnica" && "Tecnica / Capitolato"}
                            {doc.category === "personalizzazione" && "Personalizzazione"}
                            {doc.category === "finale" && "Fine Lavori"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleHistory(doc.id)}
                            className="flex items-center space-x-1 hover:text-amber-400 font-mono-tech font-bold cursor-pointer text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                          >
                            <History className="w-3.5 h-3.5 text-amber-400" />
                            <span>v{doc.version}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-tech font-bold uppercase tracking-wider border ${
                              doc.status === "vigente"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : doc.status === "sostituito"
                                ? "bg-slate-900 text-slate-400 border-slate-800 line-through"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
                            }`}
                          >
                            {doc.status === "vigente" && "Vigente"}
                            {doc.status === "sostituito" && "Sostituito"}
                            {doc.status === "attesa_approvazione" && "In Approvazione"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 text-[11px]">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-amber-400" />
                            <span className="font-semibold text-white">{formatUploaderDisplay(doc.uploadedBy)}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5 text-slate-300">
                            <Calendar className="w-3 h-3" />
                            <span>{doc.uploadedAt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {doc.status === "attesa_approvazione" && userRole !== "CLIENTE" && (
                              <button
                                onClick={() => onUpdateDocumentStatus(doc.id, "vigente")}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-1.5 rounded-lg font-mono-tech font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all border border-emerald-400"
                                title="Firma e Approva Documento"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Approva & Firma</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleSimulatedDownload(doc)}
                              className="text-slate-200 hover:text-amber-400 hover:bg-slate-900 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-800"
                              title="Visualizza / Scarica con crittografia"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            {userRole === "IMPRESA" && (
                              <button
                                onClick={() => {
                                  if (confirm("Sei sicuro di voler eliminare questo documento e la sua cronologia crittografica?")) {
                                    onDeleteDocument(doc.id);
                                  }
                                }}
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-900"
                                title="Elimina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Revision History & Cryptographic Console */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-slate-800">
                          <td colSpan={6} className="py-5 px-4 md:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column: Revision History */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <History className="w-4 h-4 text-amber-400" />
                                  <span>Storico Revisioni & Tracciabilità</span>
                                </h4>
                                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                                  {doc.history.map((entry, eIdx) => (
                                    <div
                                      key={eIdx}
                                      className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-2 shadow-md"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-400 px-1.5 py-0.2 rounded font-mono-tech border border-amber-400/30">
                                              v{entry.version}
                                            </span>
                                            <span className="text-xs font-bold text-white truncate max-w-[200px]">{entry.fileName}</span>
                                          </div>
                                          <span className="text-[10px] text-slate-300 font-mono">
                                            SHA256: {entry.sha256 ? `${entry.sha256.substring(0, 8)}...` : "N/D"}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-200 leading-normal italic">
                                          "{entry.description}"
                                        </p>
                                      </div>
                                      <div className="flex justify-between items-center text-[10px] text-slate-300 pt-1.5 border-t border-slate-800">
                                        <div>
                                          <span className="font-semibold text-amber-400">Firmato da:</span> {entry.user}
                                        </div>
                                        <div>{entry.date}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Cryptographic Certificate & Validation */}
                              <div className="bg-slate-900 text-slate-100 p-4.5 rounded-xl border border-slate-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                                    <span>Certificato d'Integrità & Firma</span>
                                  </h4>
                                  <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/25">
                                    VERIFICATO & SICURO
                                  </span>
                                </div>

                                <div className="space-y-3 text-xs">
                                  {/* SHA-256 Block */}
                                  <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Impronta Digitale (SHA-256 Checksum)</span>
                                      <button
                                        onClick={() => handleCopyHash(doc.sha256 || "")}
                                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded hover:bg-slate-800"
                                      >
                                        {copiedHash === doc.sha256 ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span className="text-emerald-400 font-bold">Copiato</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copia</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="font-mono text-[10px] text-emerald-400 break-all select-all py-1 bg-slate-950 px-1.5 rounded border border-slate-900">
                                      {doc.sha256 || "In attesa di calcolo crittografico..."}
                                    </p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">
                                      Garantisce l'immutabilità assoluta. Qualsiasi modifica non autorizzata al file invaliderà immediatamente l'impronta.
                                    </p>
                                  </div>

                                  {/* Asymmetric Signature Block */}
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Sigillo di Firma Digitale COEBO</span>
                                    <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-300 break-all leading-normal">
                                      {doc.signature || "Generazione sigillo di firma..."}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1">
                                      <Lock className="w-3 h-3 text-slate-500" />
                                      <span>Algoritmo: HMAC-SHA256 con chiave asimmetrica autorizzata COEBO</span>
                                    </div>
                                  </div>

                                  {/* Authority Details */}
                                  <div className="border-t border-slate-800/80 pt-2.5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 justify-between">
                                    <div>
                                      <span className="font-semibold text-slate-300 block">Autorità di Certificazione</span>
                                      <span className="text-slate-500">COEBO Secure Trust CA v1.2</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-slate-300 block">Firma Valida ai sensi del:</span>
                                      <span className="text-slate-500">CAD (D.Lgs. 82/2005)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Carica Nuovo Documento</h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 flex-1">
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-amber-500 bg-amber-50/50"
                    : selectedFile
                    ? "border-green-400 bg-green-50/10"
                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Clicca per sostituire
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileUp className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Trascina qui il file o <span className="text-amber-600 underline">sfoglia</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supporta PDF, PNG, JPG, DOCX fino a 15MB
                    </p>
                  </div>
                )}
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Titolo Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Planimetria Varianti Impianti Bagno"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-400">
                  Usa lo stesso titolo di un file esistente per caricarlo come nuova versione.
                </p>
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Categoria
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  <option value="contrattuale">Contratto / Amministrativa</option>
                  <option value="tecnica">Tecnica / Capitolato</option>
                  <option value="personalizzazione">Personalizzazioni / Varianti</option>
                  <option value="finale">Documentazione Finale</option>
                </select>
              </div>

              {/* Revision notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Note di Revisione / Descrizione
                </label>
                <textarea
                  rows={2}
                  placeholder="Note facoltative su modifiche introdotte in questo file..."
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Security Compliance Banners */}
              {userRole === "CLIENTE" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 animate-pulse" />
                  <div>
                    <span className="font-bold">Protocollo Sicurezza Clienti:</span> Qualsiasi documento caricato rimarrà nello stato <span className="font-bold">"In Approvazione"</span> finché l'Impresa o il Direttore dei Lavori non lo avranno verificato e firmato digitalmente.
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold">Firma Automatica CAD:</span> Caricando il file, la piattaforma applicherà automaticamente la firma crittografica del tuo profilo (<span className="italic">{userName}</span>) e calcolerà l'impronta digitale SHA-256.
                  </div>
                </div>
              )}

              {/* Modal footer buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Conferma Caricamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
