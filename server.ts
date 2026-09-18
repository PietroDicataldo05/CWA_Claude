import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// Some hosts (e.g. Railway) auto-redact any config value shaped like a JWT
// wherever it appears, corrupting it with bullet characters -- including
// this key itself, since Supabase service_role keys ARE JWTs. Accept a
// base64-encoded form (SUPABASE_SERVICE_ROLE_KEY_B64) as a workaround: a
// plain base64 blob doesn't match the JWT-shape heuristic, so it survives
// intact and we decode it back here at runtime.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_B64
  ? Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY_B64, "base64").toString("utf-8")
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("SUPABASE_URL e/o SUPABASE_SERVICE_ROLE_KEY(_B64) mancanti in .env — il server non potrà leggere/scrivere dati.");
}

const supabase = createClient(supabaseUrl || "", supabaseServiceRoleKey || "", {
  auth: { autoRefreshToken: false, persistSession: false },
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Cryptographic utility helpers for securing documents
function calculateDocSHA256(doc: { title: string; category: string; fileName: string; version: number }): string {
  const contentToHash = `${doc.title.trim()}:${doc.category}:${doc.fileName}:${doc.version}`;
  return crypto.createHash("sha256").update(contentToHash).digest("hex");
}

function generateDigitalSignature(sha256: string, signer: string): string {
  const salt = `COEBO_SECURE_TRUST_CA_KEY_PEM_${signer.replace(/\s+/g, "_").toUpperCase()}`;
  return crypto.createHmac("sha256", salt).update(sha256).digest("base64");
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password;
}

// ============================================================
// Row <-> App-object mappers (DB is snake_case, frontend is camelCase)
// ============================================================

function mapDocument(row: any, historyRows: any[], fileUrl?: string) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    fileName: row.file_name,
    fileUrl,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
    status: row.status,
    version: row.version,
    fileSize: row.file_size,
    sha256: row.sha256,
    signature: row.signature,
    isSecured: row.is_secured,
    isGeneralCantiereDoc: row.is_general_cantiere_doc,
    history: (historyRows || [])
      .filter((h) => h.document_id === row.id)
      .sort((a, b) => a.version - b.version)
      .map((h) => ({
        version: h.version,
        date: h.date,
        user: h.user,
        description: h.description,
        fileName: h.file_name,
        sha256: h.sha256,
        signature: h.signature,
      })),
  };
}

async function signDocumentUrl(filePath?: string | null): Promise<string | undefined> {
  if (!filePath) return undefined;
  const { data } = await supabase.storage.from("documents").createSignedUrl(filePath, 3600);
  return data?.signedUrl;
}

function mapVariation(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    requestedBy: row.requested_by,
    requestedAt: row.requested_at,
    status: row.status,
    estimatedCost: Number(row.estimated_cost) || 0,
    finalCost: row.final_cost != null ? Number(row.final_cost) : undefined,
    technicalAssessment: row.technical_assessment ?? undefined,
    materials: row.materials ?? undefined,
    timelineImpactDays: row.timeline_impact_days ?? undefined,
    notes: row.notes ?? undefined,
    hasAiReview: !!row.has_ai_review,
    feasibilityStudyFile: row.feasibility_study_file ?? undefined,
    isPaid: row.is_paid ?? undefined,
    balanceDue: row.balance_due != null ? Number(row.balance_due) : undefined,
    dueDate: row.due_date ?? undefined,
    supplierDetails: row.supplier_details ?? undefined,
  };
}

function variationToDb(v: any) {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    category: v.category,
    requested_by: v.requestedBy,
    requested_at: v.requestedAt,
    status: v.status,
    estimated_cost: v.estimatedCost ?? 0,
    final_cost: v.finalCost ?? null,
    technical_assessment: v.technicalAssessment ?? null,
    materials: v.materials ?? null,
    timeline_impact_days: v.timelineImpactDays ?? null,
    notes: v.notes ?? null,
    has_ai_review: !!v.hasAiReview,
    feasibility_study_file: v.feasibilityStudyFile ?? null,
    is_paid: v.isPaid ?? null,
    balance_due: v.balanceDue ?? null,
    due_date: v.dueDate ?? null,
    supplier_details: v.supplierDetails ?? null,
  };
}

function mapMessage(row: any) {
  return {
    id: row.id,
    channelId: row.channel_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    text: row.text,
    timestamp: row.timestamp,
    linkedDocId: row.linked_doc_id ?? undefined,
    linkedVariationId: row.linked_variation_id ?? undefined,
  };
}

function mapPhase(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.due_date,
    completedDate: row.completed_date ?? undefined,
  };
}

function mapCommunication(row: any) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    message: row.message,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    sentAt: row.sent_at,
    recipientsCount: row.recipients_count,
    targetAudience: row.target_audience,
    isReadByAll: row.is_read_by_all,
  };
}

function mapUnit(row: any) {
  return {
    id: row.id,
    code: row.code,
    scaleLetter: row.scale_letter,
    floorNumber: row.floor_number,
    numberOnFloor: row.number_on_floor,
    positionOnFloor: row.position_on_floor ?? undefined,
    unitCategory: row.unit_category ?? undefined,
    clientName: row.client_name ?? undefined,
    associatedClients: row.associated_clients?.length ? row.associated_clients : undefined,
    totalMq: row.total_mq != null ? Number(row.total_mq) : undefined,
    balconyMq: row.balcony_mq != null ? Number(row.balcony_mq) : undefined,
    typology: row.typology ?? undefined,
    address: row.address ?? undefined,
    basePrice: row.base_price != null ? Number(row.base_price) : undefined,
  };
}

function mapScale(row: any) {
  return {
    id: row.id,
    letter: row.letter,
    totalFloors: row.total_floors,
    unitsPerFloor: row.units_per_floor,
    includeInterrato: row.include_interrato,
    unitsPerFloorByFloor: row.units_per_floor_by_floor ?? undefined,
  };
}

function mapRegisteredClient(row: any) {
  return {
    id: row.id,
    type: row.type,
    nome: row.nome,
    cognome: row.cognome ?? undefined,
    ragioneSociale: row.ragione_sociale ?? undefined,
    cfOrPiva: row.cf_or_piva,
    email: row.email,
    phone: row.phone,
    associatedUnitId: row.associated_unit_id ?? undefined,
    associatedUnitCode: row.associated_unit_code ?? undefined,
    registrationDate: row.registration_date,
  };
}

function mapArchivedClient(row: any) {
  return {
    id: row.id,
    clientName: row.client_name,
    clientType: row.client_type,
    taxId: row.tax_id,
    phone: row.phone,
    email: row.email,
    unitCode: row.unit_code,
    unitTypology: row.unit_typology ?? undefined,
    cantiereName: row.cantiere_name,
    archivedAt: row.archived_at,
    deedDate: row.deed_date,
    totalValue: Number(row.total_value),
    basePrice: Number(row.base_price),
    extrasTotal: Number(row.extras_total),
    status: row.status,
    notaryName: row.notary_name ?? undefined,
    sha256: row.sha256 ?? undefined,
    documentsCount: row.documents_count,
    notes: row.notes ?? undefined,
  };
}

async function getCantiereConfigAssembled(cantiereId: string) {
  const { data: configRow, error: cfgErr } = await supabase.from("cantiere_config").select("*").eq("id", cantiereId).single();
  if (cfgErr || !configRow) return null;

  const { data: scaleRows } = await supabase.from("scales").select("*").eq("cantiere_id", cantiereId);
  const { data: unitRows } = await supabase.from("units").select("*").eq("cantiere_id", cantiereId).order("id", { ascending: true });

  return {
    id: configRow.id,
    areaCode: configRow.area_code,
    projectAppalto: configRow.project_appalto,
    location: configRow.location,
    name: configRow.name,
    useSiteCodeFormat: configRow.use_site_code_format,
    surfaces: configRow.surfaces || [],
    scales: (scaleRows || []).map(mapScale),
    units: (unitRows || []).map(mapUnit),
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json({ limit: "2mb" }));

  // Initialize Gemini Client safely
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: !!ai, dbEnabled: !!(supabaseUrl && supabaseServiceRoleKey) });
  });

  /* ========================================================
     DATABASE REST API ENDPOINTS (Supabase Postgres + Storage)
     ======================================================== */

  // DOCUMENTS ENDPOINTS
  app.get("/api/documents", async (req, res) => {
    const { data: docs, error } = await supabase.from("documents").select("*").order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });

    const { data: historyRows } = await supabase.from("document_history").select("*");

    const result = await Promise.all(
      (docs || []).map(async (d) => mapDocument(d, historyRows || [], await signDocumentUrl(d.file_path)))
    );
    res.json(result);
  });

  app.post("/api/documents", upload.single("file"), async (req, res) => {
    let meta: any;
    try {
      meta = JSON.parse(req.body.meta);
    } catch {
      return res.status(400).json({ error: "Dati documento non validi" });
    }

    if (!meta || !meta.id || !meta.title) {
      return res.status(400).json({ error: "Dati documento non validi" });
    }

    let filePath: string | undefined;
    if (req.file) {
      filePath = `${meta.id}/${Date.now()}_${req.file.originalname}`;
      const { error: uploadErr } = await supabase.storage
        .from("documents")
        .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
      if (uploadErr) return res.status(500).json({ error: "Errore caricamento file: " + uploadErr.message });
    }

    const sha256 = calculateDocSHA256({ title: meta.title, category: meta.category, fileName: meta.fileName, version: meta.version });
    const signature = generateDigitalSignature(sha256, meta.uploadedBy);

    const row = {
      id: meta.id,
      title: meta.title,
      category: meta.category,
      file_name: meta.fileName,
      file_path: filePath,
      uploaded_by: meta.uploadedBy,
      uploaded_at: meta.uploadedAt,
      status: meta.status,
      version: meta.version,
      file_size: meta.fileSize,
      sha256,
      signature,
      is_secured: true,
      is_general_cantiere_doc: !!meta.isGeneralCantiereDoc,
    };

    const { data: upserted, error: upsertErr } = await supabase.from("documents").upsert(row).select().single();
    if (upsertErr) return res.status(500).json({ error: upsertErr.message });

    await supabase.from("document_history").delete().eq("document_id", meta.id);
    const historyToInsert = (meta.history || []).map((h: any) => ({
      document_id: meta.id,
      version: h.version,
      date: h.date,
      user: h.user,
      description: h.description,
      file_name: h.fileName,
      sha256: h.sha256 || calculateDocSHA256({ title: meta.title, category: meta.category, fileName: h.fileName, version: h.version }),
      signature: h.signature || generateDigitalSignature(h.sha256 || sha256, h.user),
    }));
    if (historyToInsert.length > 0) {
      await supabase.from("document_history").insert(historyToInsert);
    }

    const fileUrl = await signDocumentUrl(filePath);
    res.status(201).json(mapDocument(upserted, historyToInsert, fileUrl));
  });

  app.patch("/api/documents/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const { data: existing, error: fetchErr } = await supabase.from("documents").select("*").eq("id", id).single();
    if (fetchErr || !existing) return res.status(404).json({ error: "Documento non trovato" });

    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.fileName !== undefined) dbUpdates.file_name = updates.fileName;
    if (updates.version !== undefined) dbUpdates.version = updates.version;
    if (updates.fileSize !== undefined) dbUpdates.file_size = updates.fileSize;
    if (updates.isGeneralCantiereDoc !== undefined) dbUpdates.is_general_cantiere_doc = updates.isGeneralCantiereDoc;

    const merged = { ...existing, ...dbUpdates };
    const signer = updates.approvedBy || merged.uploaded_by;
    dbUpdates.sha256 = calculateDocSHA256({ title: merged.title, category: merged.category, fileName: merged.file_name, version: merged.version });
    dbUpdates.signature = generateDigitalSignature(dbUpdates.sha256, signer);
    dbUpdates.is_secured = true;

    const { data: updated, error } = await supabase.from("documents").update(dbUpdates).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });

    const { data: historyRows } = await supabase.from("document_history").select("*").eq("document_id", id);
    const fileUrl = await signDocumentUrl(updated.file_path);
    res.json(mapDocument(updated, historyRows || [], fileUrl));
  });

  app.delete("/api/documents/:id", async (req, res) => {
    const { id } = req.params;
    const { data: existing } = await supabase.from("documents").select("file_path").eq("id", id).single();

    const { error, count } = await supabase.from("documents").delete({ count: "exact" }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    if (!count) return res.status(404).json({ error: "Documento non trovato" });

    if (existing?.file_path) {
      await supabase.storage.from("documents").remove([existing.file_path]);
    }
    res.json({ success: true, id });
  });

  // VARIATIONS ENDPOINTS
  app.get("/api/variations", async (req, res) => {
    const { data, error } = await supabase.from("variations").select("*").order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapVariation));
  });

  app.post("/api/variations", async (req, res) => {
    const newVar = req.body;
    if (!newVar || !newVar.id || !newVar.title) {
      return res.status(400).json({ error: "Dati variante non validi" });
    }

    const { data, error } = await supabase.from("variations").upsert(variationToDb(newVar)).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(mapVariation(data));
  });

  app.patch("/api/variations/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const { data: existing, error: fetchErr } = await supabase.from("variations").select("*").eq("id", id).single();
    if (fetchErr || !existing) return res.status(404).json({ error: "Variante non trovata" });

    const merged = { ...mapVariation(existing), ...updates };
    const { data, error } = await supabase.from("variations").update(variationToDb(merged)).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(mapVariation(data));
  });

  // CHAT MESSAGES ENDPOINTS
  app.get("/api/messages", async (req, res) => {
    const { data, error } = await supabase.from("messages").select("*").order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapMessage));
  });

  app.post("/api/messages", async (req, res) => {
    const msg = req.body;
    if (!msg || !msg.id || !msg.text) {
      return res.status(400).json({ error: "Messaggio non valido" });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        id: msg.id,
        channel_id: msg.channelId,
        sender_name: msg.senderName,
        sender_role: msg.senderRole,
        text: msg.text,
        timestamp: msg.timestamp,
        linked_doc_id: msg.linkedDocId ?? null,
        linked_variation_id: msg.linkedVariationId ?? null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(mapMessage(data));
  });

  // PHASES ENDPOINTS
  app.get("/api/phases", async (req, res) => {
    const { data, error } = await supabase.from("phases").select("*").order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapPhase));
  });

  app.patch("/api/phases/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.completedDate !== undefined) dbUpdates.completed_date = updates.completedDate;

    const { data, error } = await supabase.from("phases").update(dbUpdates).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: "Fase non trovata" });
    res.json(mapPhase(data));
  });

  // MASSIVE COMMUNICATIONS ENDPOINTS
  app.get("/api/communications", async (req, res) => {
    const { data, error } = await supabase.from("communications").select("*").order("id", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapCommunication));
  });

  app.post("/api/communications", async (req, res) => {
    const newComm = req.body;
    if (!newComm || !newComm.id || !newComm.title) {
      return res.status(400).json({ error: "Dati comunicazione non validi" });
    }

    const { data, error } = await supabase
      .from("communications")
      .insert({
        id: newComm.id,
        title: newComm.title,
        category: newComm.category,
        message: newComm.message,
        sender_role: newComm.senderRole,
        sender_name: newComm.senderName,
        sent_at: newComm.sentAt,
        recipients_count: newComm.recipientsCount,
        target_audience: newComm.targetAudience,
        is_read_by_all: !!newComm.isReadByAll,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(mapCommunication(data));
  });

  // CANTIERE CONFIG ENDPOINTS (struttura scale/piani/unità del cantiere)
  app.get("/api/cantiere-config", async (req, res) => {
    const { data: anyConfig, error: anyConfigErr } = await supabase.from("cantiere_config").select("id").limit(1).single();
    if (anyConfigErr) console.error("GET /api/cantiere-config - Supabase error:", anyConfigErr);
    if (!anyConfig) return res.status(404).json({ error: "Nessuna configurazione cantiere trovata", detail: anyConfigErr?.message });

    const assembled = await getCantiereConfigAssembled(anyConfig.id);
    if (!assembled) return res.status(404).json({ error: "Configurazione cantiere non trovata" });
    res.json(assembled);
  });

  app.put("/api/cantiere-config", async (req, res) => {
    const cfg = req.body;
    if (!cfg || !cfg.id) return res.status(400).json({ error: "Configurazione cantiere non valida" });

    const { error: cfgErr } = await supabase.from("cantiere_config").upsert({
      id: cfg.id,
      area_code: cfg.areaCode,
      project_appalto: cfg.projectAppalto,
      location: cfg.location,
      name: cfg.name,
      use_site_code_format: cfg.useSiteCodeFormat,
      surfaces: cfg.surfaces || [],
    });
    if (cfgErr) return res.status(500).json({ error: cfgErr.message });

    // Scales: upsert then prune ones no longer present
    const scaleIds: string[] = (cfg.scales || []).map((s: any) => s.id);
    if (scaleIds.length > 0) {
      await supabase.from("scales").upsert(
        (cfg.scales || []).map((s: any) => ({
          id: s.id,
          cantiere_id: cfg.id,
          letter: s.letter,
          total_floors: s.totalFloors,
          units_per_floor: s.unitsPerFloor,
          include_interrato: !!s.includeInterrato,
          units_per_floor_by_floor: s.unitsPerFloorByFloor || {},
        }))
      );
      await supabase.from("scales").delete().eq("cantiere_id", cfg.id).not("id", "in", `(${scaleIds.join(",")})`);
    } else {
      await supabase.from("scales").delete().eq("cantiere_id", cfg.id);
    }

    // Units: upsert then prune ones no longer present (preserves FK from registered_clients for surviving units)
    const unitIds: string[] = (cfg.units || []).map((u: any) => u.id);
    if (unitIds.length > 0) {
      await supabase.from("units").upsert(
        (cfg.units || []).map((u: any) => ({
          id: u.id,
          cantiere_id: cfg.id,
          code: u.code,
          scale_letter: u.scaleLetter,
          floor_number: u.floorNumber,
          number_on_floor: u.numberOnFloor,
          position_on_floor: u.positionOnFloor ?? null,
          unit_category: u.unitCategory ?? null,
          client_name: u.clientName ?? null,
          associated_clients: u.associatedClients || [],
          total_mq: u.totalMq ?? null,
          balcony_mq: u.balconyMq ?? null,
          typology: u.typology ?? null,
          address: u.address ?? null,
          base_price: u.basePrice ?? null,
        }))
      );
      await supabase.from("units").delete().eq("cantiere_id", cfg.id).not("id", "in", `(${unitIds.join(",")})`);
    } else {
      await supabase.from("units").delete().eq("cantiere_id", cfg.id);
    }

    const assembled = await getCantiereConfigAssembled(cfg.id);
    res.json(assembled);
  });

  // REGISTERED CLIENTS (attivi) ENDPOINTS
  app.get("/api/clients", async (req, res) => {
    const { data, error } = await supabase.from("registered_clients").select("*").order("registration_date", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapRegisteredClient));
  });

  app.patch("/api/clients/:id", async (req, res) => {
    const { id } = req.params;
    const { type, nome, cognome, ragioneSociale, cfOrPiva, email, phone, associatedUnitId, associatedUnitCode } = req.body;
    if (!email || !cfOrPiva || !phone) {
      return res.status(400).json({ error: "Completare i campi obbligatori: Telefono, Codice Fiscale/P.IVA e Email." });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("registered_clients")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !existing) return res.status(404).json({ error: "Cliente non trovato" });

    const displayName = type === "PERSONA_GIURIDICA" ? ragioneSociale : `${nome} ${cognome || ""}`.trim();

    const { data: updated, error: updateErr } = await supabase
      .from("registered_clients")
      .update({
        type,
        nome: nome || ragioneSociale,
        cognome: cognome || null,
        ragione_sociale: ragioneSociale || null,
        cf_or_piva: String(cfOrPiva).toUpperCase(),
        email,
        phone,
        associated_unit_id: associatedUnitId || null,
        associated_unit_code: associatedUnitCode || null,
      })
      .eq("id", id)
      .select()
      .single();
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    if (existing.profile_id) {
      await supabase.from("profiles").update({ name: displayName, phone }).eq("id", existing.profile_id);
      if (email && email !== existing.email) {
        await supabase.auth.admin.updateUserById(existing.profile_id, { email });
      }
    }

    if (existing.associated_unit_id && existing.associated_unit_id !== associatedUnitId) {
      await supabase.from("units").update({ client_name: null }).eq("id", existing.associated_unit_id);
    }
    if (associatedUnitId) {
      await supabase.from("units").update({ client_name: displayName }).eq("id", associatedUnitId);
    }

    res.json(mapRegisteredClient(updated));
  });

  // ARCHIVED CLIENTS (storico post-rogito) ENDPOINTS
  app.get("/api/archived-clients", async (req, res) => {
    const { data, error } = await supabase.from("archived_clients").select("*").order("archived_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapArchivedClient));
  });

  app.post("/api/archived-clients", async (req, res) => {
    const rec = req.body;
    if (!rec || !rec.id || !rec.clientName) {
      return res.status(400).json({ error: "Dati archivio non validi" });
    }

    const { data, error } = await supabase
      .from("archived_clients")
      .insert({
        id: rec.id,
        client_name: rec.clientName,
        client_type: rec.clientType,
        tax_id: rec.taxId,
        phone: rec.phone,
        email: rec.email,
        unit_code: rec.unitCode,
        unit_typology: rec.unitTypology ?? null,
        cantiere_name: rec.cantiereName,
        archived_at: rec.archivedAt,
        deed_date: rec.deedDate,
        total_value: rec.totalValue,
        base_price: rec.basePrice,
        extras_total: rec.extrasTotal ?? 0,
        status: rec.status,
        notary_name: rec.notaryName ?? null,
        sha256: rec.sha256 ?? null,
        documents_count: rec.documentsCount ?? 0,
        notes: rec.notes ?? null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(mapArchivedClient(data));
  });

  app.delete("/api/archived-clients/:id", async (req, res) => {
    const { id } = req.params;
    const { error, count } = await supabase.from("archived_clients").delete({ count: "exact" }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    if (!count) return res.status(404).json({ error: "Record archivio non trovato" });
    res.json({ success: true, id });
  });

  // ADMIN: create a real, working login for a new client or employee
  app.post("/api/admin/create-client", async (req, res) => {
    const { type, nome, cognome, ragioneSociale, cfOrPiva, email, phone, associatedUnitId, associatedUnitCode } = req.body;
    if (!email || !cfOrPiva || !phone) {
      return res.status(400).json({ error: "Completare i campi obbligatori: Telefono, Codice Fiscale/P.IVA e Email." });
    }

    const tempPassword = generateTempPassword();
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (authErr || !created?.user) {
      return res.status(400).json({ error: "Errore creazione account: " + (authErr?.message || "sconosciuto") });
    }

    const displayName = type === "PERSONA_GIURIDICA" ? ragioneSociale : `${nome} ${cognome || ""}`.trim();

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: created.user.id,
      role: "CLIENTE",
      name: displayName,
      company: type === "PERSONA_GIURIDICA" ? ragioneSociale : "Acquirente Privato",
      phone,
    });
    if (profileErr) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return res.status(500).json({ error: profileErr.message });
    }

    const clientId = `cli-${created.user.id}`;
    const registrationDate = new Date().toLocaleDateString("it-IT");
    const { data: clientRow, error: clientErr } = await supabase
      .from("registered_clients")
      .insert({
        id: clientId,
        profile_id: created.user.id,
        type,
        nome: nome || ragioneSociale,
        cognome: cognome || null,
        ragione_sociale: ragioneSociale || null,
        cf_or_piva: String(cfOrPiva).toUpperCase(),
        email,
        phone,
        associated_unit_id: associatedUnitId || null,
        associated_unit_code: associatedUnitCode || null,
        registration_date: registrationDate,
      })
      .select()
      .single();
    if (clientErr) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return res.status(500).json({ error: clientErr.message });
    }

    if (associatedUnitId) {
      await supabase.from("units").update({ client_name: displayName }).eq("id", associatedUnitId);
    }

    res.status(201).json({ tempPassword, client: mapRegisteredClient(clientRow) });
  });

  app.post("/api/admin/create-employee", async (req, res) => {
    const { nome, cognome, email, role } = req.body;
    if (!email || !nome || !role) {
      return res.status(400).json({ error: "Completare i campi obbligatori." });
    }
    if (role !== "IMPRESA" && role !== "TECNICO") {
      return res.status(400).json({ error: "Ruolo non valido." });
    }

    const tempPassword = generateTempPassword();
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (authErr || !created?.user) {
      return res.status(400).json({ error: "Errore creazione account: " + (authErr?.message || "sconosciuto") });
    }

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: created.user.id,
      role,
      name: `${nome} ${cognome || ""}`.trim(),
      company: "COEBO S.r.l.",
    });
    if (profileErr) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return res.status(500).json({ error: profileErr.message });
    }

    res.status(201).json({ tempPassword, email });
  });

  // AI Technical Review endpoint for variation requests
  app.post("/api/technical-review", async (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not available
      const mockCosts: { [key: string]: number } = {
        "impianti": 450,
        "architettonica": 800,
        "default": 350
      };
      const catKey = (category || "").toLowerCase();
      const cost = mockCosts[catKey] || mockCosts.default;

      return res.json({
        feasibility: `[Simulazione] Modifica per '${title}' valutata positivamente. Dal punto di vista strutturale e normativo, l'intervento è realizzabile con i normali canoni di cantiere residenziale.`,
        isFeasible: true,
        materials: [
          "Fornitura e posa in opera materiali standard",
          "Manodopera specializzata",
          "Ripristino intonaco e tinteggiatura"
        ],
        estimatedCost: cost,
        estimatedDays: 2,
        notes: "Configura la chiave GEMINI_API_KEY in Settings > Secrets per abilitare le valutazioni reali dell'intelligenza artificiale di Google."
      });
    }

    try {
      const prompt = `Valuta la seguente richiesta di modifica/variante per un appartamento residenziale in costruzione per l'azienda COEBO S.r.l.:
Categoria: ${category || "Non specificata"}
Titolo della variante: ${title}
Descrizione richiesta dal cliente: ${description}

Fornisci un'analisi tecnica dettagliata per l'impresa costruttrice e il tecnico, con stima dei costi (in Euro), elenco dei materiali/lavorazioni ed eventuale impatto sui tempi di consegna del cantiere.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: `Sei l'Assistente Tecnico IA per COEBO S.r.l., azienda leader nel settore dell'edilizia residenziale a Bari.
Il tuo compito è analizzare le richieste di personalizzazione dei clienti (es. spostamento tramezzi, prese elettriche, modifiche idrauliche, finiture extra) ed elaborare studi di fattibilità tecnica rigorosi, realistici e in lingua italiana.
Assegna costi realistici basandoti sui listini edili standard italiani (es. tra 150€ e 5000€ a seconda della complessità).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feasibility: {
                type: Type.STRING,
                description: "Studio di fattibilità tecnica dettagliato e spiegato in italiano in modo chiaro sia per l'impresa che per il cliente."
              },
              isFeasible: {
                type: Type.BOOLEAN,
                description: "True se la modifica è fattibile dal punto di vista tecnico e strutturale, False se presenta criticità bloccanti."
              },
              materials: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista di lavorazioni e materiali necessari per eseguire la variante."
              },
              estimatedCost: {
                type: Type.NUMBER,
                description: "Costo stimato in Euro (es. 650). Inserire solo il valore numerico."
              },
              estimatedDays: {
                type: Type.NUMBER,
                description: "Giorni lavorativi stimati aggiuntivi o impatto sulla tempistica di cantiere."
              },
              notes: {
                type: Type.STRING,
                description: "Note importanti o raccomandazioni operative per il tecnico di cantiere (es. conformità norme impianti, scarichi)."
              }
            },
            required: ["feasibility", "isFeasible", "materials", "estimatedCost", "estimatedDays", "notes"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No text returned from Gemini model");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Errore durante l'elaborazione dell'assistente IA: " + error.message });
    }
  });

  // Serve static files or setup Vite in Dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`COEBO Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
