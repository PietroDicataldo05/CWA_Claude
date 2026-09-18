import { UserProfile, ProjectDocument, VariationRequest, ChatMessage, ProjectTimelinePhase, CantiereConfig, MassiveCommunication } from "../types";

export const INITIAL_CANTIERE_CONFIG: CantiereConfig = {
  id: "cant-001",
  areaCode: "Area 1",
  projectAppalto: "Residenza San Pasquale",
  location: "Bari",
  name: "Area 1 – Residenza San Pasquale Bari",
  useSiteCodeFormat: true,
  scales: [
    { 
      id: "scale-a", 
      letter: "A", 
      totalFloors: 3, 
      unitsPerFloor: 4,
      includeInterrato: true,
      unitsPerFloorByFloor: { "-1": 2, 1: 4, 2: 4, 3: 4 }
    },
    { 
      id: "scale-b", 
      letter: "B", 
      totalFloors: 3, 
      unitsPerFloor: 4,
      includeInterrato: true,
      unitsPerFloorByFloor: { "-1": 2, 1: 4, 2: 4, 3: 4 }
    },
  ],
  units: [
    // Piano Interrato Scale A (Box & Cantine)
    { id: "apt-A-1-1", code: "A -1 dx", scaleLetter: "A", floorNumber: -1, numberOnFloor: 1, positionOnFloor: "dx", unitCategory: "Box Auto", clientName: "Mario Rossi", totalMq: 22, balconyMq: 0, address: "Via Roberto Da Bari 62 (Interrato), Bari", basePrice: 28000 },
    { id: "apt-A-1-2", code: "A -1 sx", scaleLetter: "A", floorNumber: -1, numberOnFloor: 2, positionOnFloor: "sx", unitCategory: "Cantinola", clientName: "Elena Rossi", totalMq: 12, balconyMq: 0, address: "Via Roberto Da Bari 62 (Interrato), Bari", basePrice: 15000 },

    // Standard Nomenclature: [Scala] [Piano] [Posizione] (es. A 1 dx, A 1 sx, A 1 ct)
    { id: "apt-A01", code: "A 1 dx", scaleLetter: "A", floorNumber: 1, numberOnFloor: 1, positionOnFloor: "dx", clientName: "Mario Rossi", totalMq: 85, balconyMq: 15, typology: "Bilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 180000 },
    { id: "apt-A02", code: "A 1 sx", scaleLetter: "A", floorNumber: 1, numberOnFloor: 2, positionOnFloor: "sx", clientName: "Giuseppe Bianchi", totalMq: 95, balconyMq: 18, typology: "Trilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 210000 },
    { id: "apt-A03", code: "A 1 ct", scaleLetter: "A", floorNumber: 1, numberOnFloor: 3, positionOnFloor: "ct", clientName: "Anna Neri", totalMq: 100, balconyMq: 20, typology: "Trilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 225000 },
    { id: "apt-A04", code: "A 1 dx-2", scaleLetter: "A", floorNumber: 1, numberOnFloor: 4, positionOnFloor: "dx", clientName: "Luigi Verdi", totalMq: 110, balconyMq: 22, typology: "Quadrilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 235000 },

    { id: "apt-A05", code: "A 2 dx", scaleLetter: "A", floorNumber: 2, numberOnFloor: 1, positionOnFloor: "dx", clientName: "Elena Rossi", totalMq: 134, balconyMq: 25, typology: "Plurilocale", address: "Via Roberto Da Bari 62 / Cantiere San Pasquale, Bari", basePrice: 245000 },
    { id: "apt-A06", code: "A 2 sx", scaleLetter: "A", floorNumber: 2, numberOnFloor: 2, positionOnFloor: "sx", clientName: "Antonio Esposito", totalMq: 105, balconyMq: 20, typology: "Trilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 220000 },
    { id: "apt-A07", code: "A 2 ct", scaleLetter: "A", floorNumber: 2, numberOnFloor: 3, positionOnFloor: "ct", clientName: "Paola Ricci", totalMq: 115, balconyMq: 22, typology: "Quadrilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 238000 },
    { id: "apt-A08", code: "A 2 dx-2", scaleLetter: "A", floorNumber: 2, numberOnFloor: 4, positionOnFloor: "dx", clientName: "Roberto Marino", totalMq: 120, balconyMq: 25, typology: "Quadrilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 242000 },

    { id: "apt-A09", code: "A 3 dx", scaleLetter: "A", floorNumber: 3, numberOnFloor: 1, positionOnFloor: "dx", clientName: "Laura Bruno", totalMq: 140, balconyMq: 30, typology: "Plurilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 260000 },
    { id: "apt-A10", code: "A 3 sx", scaleLetter: "A", floorNumber: 3, numberOnFloor: 2, positionOnFloor: "sx", clientName: "Stefano Gallo", totalMq: 110, balconyMq: 20, typology: "Trilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 230000 },
    { id: "apt-A11", code: "A 3 ct", scaleLetter: "A", floorNumber: 3, numberOnFloor: 3, positionOnFloor: "ct", clientName: "Francesca Conti", totalMq: 125, balconyMq: 26, typology: "Quadrilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 250000 },
    { id: "apt-A12", code: "A 3 dx-2", scaleLetter: "A", floorNumber: 3, numberOnFloor: 4, positionOnFloor: "dx", clientName: "Marco De Luca", totalMq: 145, balconyMq: 35, typology: "Plurilocale", address: "Via Roberto Da Bari 62, Bari", basePrice: 275000 },

    // Scale B Units
    { id: "apt-B01", code: "B 1 dx", scaleLetter: "B", floorNumber: 1, numberOnFloor: 1, positionOnFloor: "dx", clientName: "Alessandro Greco", totalMq: 82, balconyMq: 12, typology: "Bilocale", address: "Via Roberto Da Bari 64, Bari", basePrice: 175000 },
    { id: "apt-B02", code: "B 1 sx", scaleLetter: "B", floorNumber: 1, numberOnFloor: 2, positionOnFloor: "sx", clientName: "Sofia Romano", totalMq: 92, balconyMq: 16, typology: "Trilocale", address: "Via Roberto Da Bari 64, Bari", basePrice: 205000 },
    { id: "apt-B03", code: "B 1 ct", scaleLetter: "B", floorNumber: 1, numberOnFloor: 3, positionOnFloor: "ct", clientName: "Matteo Ferrari", totalMq: 98, balconyMq: 18, typology: "Trilocale", address: "Via Roberto Da Bari 64, Bari", basePrice: 218000 },
    { id: "apt-B04", code: "B 1 dx-2", scaleLetter: "B", floorNumber: 1, numberOnFloor: 4, positionOnFloor: "dx", clientName: "Valentina Costa", totalMq: 108, balconyMq: 20, typology: "Quadrilocale", address: "Via Roberto Da Bari 64, Bari", basePrice: 230000 },
  ],
  surfaces: [],
};

export const PROJECT_DETAILS = {
  name: "Area 1 – Residenza San Pasquale Bari",
  unit: "Scala A - Secondo Piano - Interno A05",
  address: "Via Roberto Da Bari 62 / Cantiere San Pasquale, Bari",
  builder: "COEBO S.r.l. / Appalto San Pasquale",
  surface: "109 mq Stanze + 25 mq Balconi",
  rooms: "Penta-vano (Soggiorno, Cucina, 3 Camere, 2 Bagni)",
  deliveryEstimate: "Dicembre 2026",
};


export const USER_PROFILES: { [key: string]: UserProfile } = {
  IMPRESA: {
    role: "IMPRESA",
    name: "Amministratore COEBO",
    company: "COEBO S.r.l.",
    email: "vito.conversano@binp.it",
    phone: "+39 3486131769",
  },
  CLIENTE: {
    role: "CLIENTE",
    name: "Elena De Michele",
    company: "Acquirente Privato",
    email: "elena.demichele99@gmail.com",
    phone: "+39 334 1234567",
  },
  TECNICO: {
    role: "TECNICO",
    name: "Ing. Francesco Mongelli",
    company: "Studio Tecnico Mongelli (RPA)",
    email: "ing.mongellifrancesco@gmail.com",
    phone: "+39 339 1787289",
  },
};

export const INITIAL_PHASES: ProjectTimelinePhase[] = [
  {
    id: 0,
    title: "Fase 0: Raccolta Documentazione Cliente",
    description: "Caricamento documenti d'identità, codice fiscale e firma preliminare di vendita per sblocco pratiche amministrative.",
    status: "completato",
    dueDate: "2026-05-30",
    completedDate: "2026-05-28",
  },
  {
    id: 1,
    title: "Fase 1: Definizione architettonica e prime forniture",
    description: "Definizione tramezzature interne, distribuzione degli spazi e organizzazione funzionale degli ambienti.",
    status: "completato",
    dueDate: "2026-06-20",
    completedDate: "2026-06-18",
  },
  {
    id: 2,
    title: "Fase 2: Impianti idrico-sanitari e climatizzazione",
    description: "Posizionamento punti luce, prese elettriche, schema idrico, sanitari dei bagni, predisposizione cucina e locale tecnico.",
    status: "in_corso",
    dueDate: "2026-07-15",
  },
  {
    id: 3,
    title: "Fase 3: Impianto elettrico",
    description: "Definizione di tutte le personalizzazioni dell'impianto elettrico.",
    status: "da_iniziare",
    dueDate: "2026-08-10",
  },
  {
    id: 4,
    title: "Fase 4: Chiusura Lavori & Consegna Immobile",
    description: "Certificazioni finali degli impianti, agibilità, documentazione finale catastale e consegna formale delle chiavi.",
    status: "da_iniziare",
    dueDate: "2026-12-15",
  },
];

export const INITIAL_DOCUMENTS: ProjectDocument[] = [
  {
    id: "doc-001",
    title: "Disciplinare di Incarico e Gestione Cantiere",
    category: "contrattuale",
    fileName: "Disciplinare_Incarico_Cantiere_SanPasquale_v2.pdf",
    uploadedBy: "Amministratore",
    uploadedAt: "2026-05-10 10:00",
    status: "vigente",
    version: 2,
    fileSize: "3.4 MB",
    isSecured: true,
    isGeneralCantiereDoc: true,
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    signature: "COEBO_SECURE_TRUST_CA_SIGNATURE_001",
    history: [
      {
        version: 1,
        date: "2026-04-15 09:30",
        user: "Tecnico",
        description: "Bozza iniziale Disciplinare di Cantiere",
        fileName: "Disciplinare_Incarico_Cantiere_v1.pdf"
      },
      {
        version: 2,
        date: "2026-05-10 10:00",
        user: "Amministratore",
        description: "Approvazione e pubblicazione Disciplinare di Cantiere Ufficiale",
        fileName: "Disciplinare_Incarico_Cantiere_SanPasquale_v2.pdf"
      }
    ]
  },
  {
    id: "doc-002",
    title: "Capitolato Generale dei Lavori e Finiture Cantiere",
    category: "tecnica",
    fileName: "Capitolato_Generale_Finiture_SanPasquale_2026.pdf",
    uploadedBy: "Tecnico",
    uploadedAt: "2026-05-12 11:30",
    status: "vigente",
    version: 1,
    fileSize: "5.8 MB",
    isSecured: true,
    isGeneralCantiereDoc: true,
    sha256: "f4c1d55309fc2d250bfcf5d9007fc03538bf52f5750c045db506002c8963c966",
    signature: "COEBO_SECURE_TRUST_CA_SIGNATURE_002",
    history: [
      {
        version: 1,
        date: "2026-05-12 11:30",
        user: "Tecnico",
        description: "Capitolato Generale delle Opere e Finiture di Cantiere",
        fileName: "Capitolato_Generale_Finiture_SanPasquale_2026.pdf"
      }
    ]
  }
];

export const INITIAL_MASSIVE_COMMUNICATIONS: MassiveCommunication[] = [
  {
    id: "comm-001",
    title: "Comunicazione di Avvenuta Chiusura Visita Cantiere",
    category: "Visita Cantiere",
    message: "Si informano tutti i clienti che le visite programmate in cantiere per la giornata odierna si sono concluse con successo. La direzione tecnica ha completato le verifiche sugli immobili e il cantiere è stato regolarmente messo in sicurezza.",
    senderRole: "Amministratore",
    senderName: "Amministratore COEBO",
    sentAt: "05/08/2026 18:00",
    recipientsCount: 24,
    targetAudience: "Tutti i Clienti del Cantiere",
    isReadByAll: true,
  },
  {
    id: "comm-002",
    title: "Completamento Tramezzature Interne e Inizio Impianti (Fase 2)",
    category: "Avanzamento Lavori",
    message: "Comunichiamo che le opere murarie e le tramezzature interne sono state ultimate. A partire da lunedì avranno inizio le tracciature degli impianti idrici ed elettrici. Vi invitiamo a confermare eventuali richieste di variante entro i termini.",
    senderRole: "Tecnico",
    senderName: "Ing. Francesco Mongelli",
    sentAt: "01/08/2026 09:30",
    recipientsCount: 24,
    targetAudience: "Tutti i Clienti del Cantiere",
    isReadByAll: true,
  }
];


export const INITIAL_VARIATIONS: VariationRequest[] = [
  {
    id: "var-001",
    title: "Demolizione tramezzo cucina per creazione Open-Space",
    description: "Rimozione della parete divisoria tra cucina e soggiorno, spostamento degli allacciamenti standard alla parete laterale e raccordatura della pavimentazione continua.",
    category: "Architettonica",
    requestedBy: "Elena De Michele",
    requestedAt: "2026-06-02 15:30",
    status: "approvata",
    estimatedCost: 1200,
    finalCost: 1200,
    technicalAssessment: "Fattibilità strutturale verificata. La parete non è portante (tramezzo da 8 cm). Nessun pilastro o elemento in cemento armato coinvolto.",
    materials: [
      "Demolizione tramezzo in laterizio forato (mq 12.50)",
      "Rimozione detriti e trasporto a discarica autorizzata",
      "Rasatura a gesso e ripristino intonaci di raccordo",
      "Spostamento linee elettriche intercettate sulla parete demolita"
    ],
    timelineImpactDays: 1,
    notes: "L'intervento richiede una raccordatura perfetta del massetto e della pavimentazione. Avendo scelto parquet uniforme, la posa avverrà senza giunti.",
    hasAiReview: false,
    isPaid: true,
    balanceDue: 0,
    dueDate: "2026-07-05",
  },
  {
    id: "var-002",
    title: "Predisposizione impianto idrico ed elettrico per Isola Cucina",
    description: "Canalizzazione sotto-pavimento per portare gli scarichi idrici, l'acqua calda/fredda e l'alimentazione elettrica a centro stanza per isola cucina con lavello e piano cottura.",
    category: "Impiantistica",
    requestedBy: "Elena De Michele",
    requestedAt: "2026-06-19 11:20",
    status: "approvata",
    estimatedCost: 850,
    technicalAssessment: "Possibile previa verifica dello spessore del massetto. Per garantire la pendenza corretta dello scarico del lavello (min 1%), il massetto deve avere uno spessore utile di almeno 10 cm nel tragitto dal pilastro di scarico principale.",
    materials: [
      "Tracciatura e scasso nel solaio/massetto per posa tubazioni",
      "Posa tubazione di scarico in polietilene alta densità isolato d.50mm",
      "Posa tubazioni adduzione multistrato isolate per acqua calda/fredda",
      "Posa corrugati d.25mm per alimentazione elettrica piano induzione ed elettrodomestici isola",
      "Massetto cementizio di copertura ad alta resistenza"
    ],
    timelineImpactDays: 2,
    notes: "Da definire la posizione esatta prima della gettata del massetto di finitura previsto per la prima settimana di luglio.",
    hasAiReview: false,
    isPaid: false,
    balanceDue: 850,
    dueDate: "2026-08-15",
  },
  {
    id: "var-003",
    title: "Sanitari sospesi e rubinetteria extra-capitolato (Fornitore Esterno)",
    description: "Sostituzione dei sanitari standard a terra da capitolato con sanitari sospesi marca 'Flaminia' serie Link e miscelatori a incasso marca 'Gessi' acquistati presso il fornitore esterno 'Bari Ceramiche'.",
    category: "Fornitura Esterna",
    requestedBy: "Elena De Michele",
    requestedAt: "2026-06-22 09:40",
    status: "approvata",
    estimatedCost: 1800,
    technicalAssessment: "L'installazione di sanitari sospesi richiede la posa di staffe speciali a muro (es. Geberit Duofix) prima dell'intonacatura e del rivestimento.",
    timelineImpactDays: 1,
    notes: "Il cliente acquisterà direttamente i materiali dal fornitore esterno. COEBO addebiterà solo la posa in opera differenziale e la fornitura delle staffe da incasso. Verrà scalato il credito dei sanitari standard.",
    hasAiReview: false,
    isPaid: false,
    balanceDue: 3000,
    dueDate: "2026-08-30",
    supplierDetails: {
      supplierName: "Bari Ceramiche S.r.l.",
      standardCredit: 600, // Credito per sanitari standard non installati
      supplierQuoteCost: 2400, // Preventivo totale del fornitore esterno
      difference: 1800, // Costo extra a carico di Elena
      receiptUploaded: true,
      receiptFileName: "Fattura_BariCeramiche_ElenaDeMichele_Acconto.pdf",
    }
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [];


