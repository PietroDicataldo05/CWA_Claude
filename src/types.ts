export type UserRole = "IMPRESA" | "CLIENTE" | "TECNICO";

export interface UserProfile {
  role: UserRole;
  name: string;
  company?: string;
  avatar?: string;
  email: string;
  phone: string;
}

export interface DocumentHistoryEntry {
  version: number;
  date: string;
  user: string;
  description: string;
  fileName: string;
  sha256?: string;
  signature?: string;
}

export interface ProjectDocument {
  id: string;
  title: string;
  category: "contrattuale" | "tecnica" | "personalizzazione" | "finale";
  fileName: string;
  uploadedBy: "Amministratore" | "Tecnico" | string;
  uploadedAt: string;
  status: "vigente" | "sostituito" | "attesa_approvazione";
  version: number;
  fileSize: string;
  history: DocumentHistoryEntry[];
  sha256?: string;
  signature?: string;
  isSecured?: boolean;
  isGeneralCantiereDoc?: boolean; // Disciplinare & Capitolato generali per l'intero cantiere
  fileUrl?: string; // Data URL or File Blob URL for rendering PDF preview & download
}

export interface VariationRequest {
  id: string;
  title: string;
  description: string;
  category: "Architettonica" | "Impiantistica" | "Finitura/Materiali" | "Fornitura Esterna";
  requestedBy: string;
  requestedAt: string;
  status: "richiesta" | "in_valutazione" | "approvata" | "rifiutata" | "completata";
  estimatedCost: number;
  finalCost?: number;
  technicalAssessment?: string;
  materials?: string[];
  timelineImpactDays?: number;
  notes?: string;
  hasAiReview: boolean;
  feasibilityStudyFile?: string;
  isPaid?: boolean;
  balanceDue?: number;
  dueDate?: string;
  supplierDetails?: {
    supplierName: string;
    standardCredit: number; // Fornitura standard scalata
    supplierQuoteCost: number; // Preventivo del fornitore esterno
    difference: number; // Differenza economica
    receiptUploaded: boolean;
    receiptFileName?: string;
  };
}

export interface ChatMessage {
  id: string;
  channelId: string; // 'generale' | 'architettura' | 'impianti' | 'extra'
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  linkedDocId?: string;
  linkedVariationId?: string;
}

export interface ProjectTimelinePhase {
  id: number;
  title: string;
  description: string;
  status: "completato" | "in_corso" | "da_iniziare";
  dueDate: string;
  completedDate?: string;
}

export interface ProjectKPIs {
  overallProgress: number;
  baseContractValue: number;
  approvedExtrasValue: number;
  pendingExtrasCount: number;
  openRequestsCount: number;
  completedVariationsCount: number;
}

export interface RoomSurface {
  id: string;
  name: string;
  type: "stanza" | "balcone";
  surfaceMq: number;
}

export type UnitTypology = "Monolocale" | "Bilocale" | "Trilocale" | "Quadrilocale" | "Plurilocale" | "Pertinenza";

export type ElevatorPosition = "dx" | "sx" | "ct";

export interface UnitConfig {
  id: string;
  code: string; // Es: A 1 dx
  scaleLetter: string;
  floorNumber: number; // -1: Interrato (Box/Cantinola), 0: Piano Terra, 1, 2, 3...
  numberOnFloor: number;
  positionOnFloor?: ElevatorPosition; // Dx (destra ascensore), Sx (sinistra ascensore), Ct (centrale)
  unitCategory?: "Appartamento" | "Box Auto" | "Cantinola";
  clientName?: string;
  associatedClients?: string[];
  totalMq?: number;
  balconyMq?: number;
  typology?: UnitTypology;
  address?: string;
  basePrice?: number;
}

export interface ScaleConfig {
  id: string;
  letter: string;
  totalFloors: number;
  unitsPerFloor: number; // Numero standard o di default
  includeInterrato?: boolean; // Se include il Piano Interrato (-1) per Box Auto / Cantine
  unitsPerFloorByFloor?: Record<number, number>; // Personalizzazione numero interni per singolo piano (es: {-1: 6, 1: 3, 2: 4})
}

export interface CantiereConfig {
  id: string;
  areaCode: string;
  projectAppalto: string;
  location: string;
  name: string;
  useSiteCodeFormat: boolean;
  scales: ScaleConfig[];
  units: UnitConfig[];
  surfaces?: RoomSurface[];
}

export interface MassiveCommunication {
  id: string;
  title: string;
  category: "Visita Cantiere" | "Avanzamento Lavori" | "Documentazione" | "Avviso Generale";
  message: string;
  senderRole: "Amministratore" | "Tecnico";
  senderName: string;
  sentAt: string;
  recipientsCount: number;
  targetAudience: string; // Es. "Tutti i Clienti del Cantiere", "Clienti Scala A"
  isReadByAll?: boolean;
}

