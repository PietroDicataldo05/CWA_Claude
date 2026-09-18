import React, { useState, useEffect } from "react";
import {
  UserPlus,
  UserMinus,
  Briefcase,
  UserX,
  X,
  CheckCircle,
  Mail,
  User,
  ShieldCheck,
  Building2,
  Sliders,
  Phone,
  FileText,
  Building,
  Home,
  Check,
  Search,
  UserCheck,
  Pencil,
  MessageCircle,
  Send
} from "lucide-react";
import { UserRole, CantiereConfig, UnitConfig } from "../types";
import { showToast } from "../lib/toast";

// Strips a phone number down to digits only, as required by wa.me links.
function toWaPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

function buildCredentialsMessage(name: string, email: string, password: string): string {
  return `Gentile ${name},\n\nLe sue credenziali di accesso al portale digitale COEBO sono:\n\nEmail: ${email}\nPassword provvisoria: ${password}\n\nAl primo accesso le verrà chiesto di impostare una nuova password personale.\n\nCordiali saluti,\nCOEBO S.r.l.`;
}

interface GestioneViewProps {
  userRole: UserRole;
  cantiereConfig?: CantiereConfig;
  onOpenConfigurator?: () => void;
  onSaveUnitConfig?: (updatedUnit: UnitConfig) => void;
}

export type ClientType = "PERSONA_FISICA" | "PERSONA_GIURIDICA";

export interface RegisteredClient {
  id: string;
  type: ClientType;
  nome: string;
  cognome?: string;
  ragioneSociale?: string;
  cfOrPiva: string;
  email: string;
  phone: string;
  associatedUnitId?: string;
  associatedUnitCode?: string;
  registrationDate: string;
}

export default function GestioneView({
  userRole,
  cantiereConfig,
  onOpenConfigurator,
  onSaveUnitConfig,
}: GestioneViewProps) {
  if (userRole === "CLIENTE") {
    return (
      <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto mt-12 brutalist-shadow-amber">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-mono-tech font-bold text-white uppercase tracking-wider">Accesso Riservato</h3>
        <p className="text-xs font-mono-tech text-slate-400 leading-relaxed">
          La sezione &ldquo;Gestione Cantiere&rdquo; e l&apos;amministrazione delle unità abitative sono riservate esclusivamente alla Direzione Lavori e all&apos;Impresa Costruttrice.
        </p>
      </div>
    );
  }

  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [showEmployeeSuccessPopup, setShowEmployeeSuccessPopup] = useState(false);

  // Client Registration Form State
  const [clientType, setClientType] = useState<ClientType>("PERSONA_FISICA");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [cfOrPiva, setCfOrPiva] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");

  const [registeredClients, setRegisteredClients] = useState<RegisteredClient[]>([]);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  const [clientFormError, setClientFormError] = useState("");

  const [createdClientInfo, setCreatedClientInfo] = useState<RegisteredClient | null>(null);
  const [tempPassword, setTempPassword] = useState("");

  // Edit Existing Client Form State
  const [editingClient, setEditingClient] = useState<RegisteredClient | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editCognome, setEditCognome] = useState("");
  const [editRagioneSociale, setEditRagioneSociale] = useState("");
  const [editCfOrPiva, setEditCfOrPiva] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editUnitId, setEditUnitId] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Employee Form State
  const [empNome, setEmpNome] = useState("");
  const [empCognome, setEmpCognome] = useState("");
  const [empCf, setEmpCf] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState<"IMPRESA" | "TECNICO">("TECNICO");
  const [empTempPassword, setEmpTempPassword] = useState("");
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
  const [employeeFormError, setEmployeeFormError] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Errore nel recupero clienti"))))
      .then((data: RegisteredClient[]) => setRegisteredClients(data))
      .catch((err) => console.error("Error loading registered clients:", err));
  }, []);

  const unitsList = cantiereConfig?.units || [];

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfOrPiva.trim() || !email.trim() || !phone.trim()) {
      showToast("Completare i campi obbligatori: Telefono, Codice Fiscale/P.IVA e Email.", "error");
      return;
    }

    setIsSubmittingClient(true);
    setClientFormError("");

    const assignedUnit = unitsList.find((u) => u.id === selectedUnitId);

    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: clientType,
          nome,
          cognome,
          ragioneSociale,
          cfOrPiva: cfOrPiva.toUpperCase(),
          email,
          phone,
          associatedUnitId: assignedUnit?.id,
          associatedUnitCode: assignedUnit?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante la creazione del cliente.");

      setRegisteredClients((prev) => [data.client, ...prev]);
      setCreatedClientInfo(data.client);
      setTempPassword(data.tempPassword);
      setShowAddClientForm(false);
      setShowSuccessPopup(true);
    } catch (err: any) {
      setClientFormError(err.message || "Errore durante la creazione del cliente.");
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const openEditClient = (client: RegisteredClient) => {
    setEditingClient(client);
    setEditNome(client.nome || "");
    setEditCognome(client.cognome || "");
    setEditRagioneSociale(client.ragioneSociale || "");
    setEditCfOrPiva(client.cfOrPiva || "");
    setEditEmail(client.email || "");
    setEditPhone(client.phone || "");
    setEditUnitId(client.associatedUnitId || "");
    setEditError("");
  };

  const closeEditClient = () => {
    setEditingClient(null);
    setEditError("");
  };

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editCfOrPiva.trim() || !editEmail.trim() || !editPhone.trim()) {
      setEditError("Completare i campi obbligatori: Telefono, Codice Fiscale/P.IVA e Email.");
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    const assignedUnit = unitsList.find((u) => u.id === editUnitId);

    try {
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editingClient.type,
          nome: editNome,
          cognome: editCognome,
          ragioneSociale: editRagioneSociale,
          cfOrPiva: editCfOrPiva.toUpperCase(),
          email: editEmail,
          phone: editPhone,
          associatedUnitId: assignedUnit?.id,
          associatedUnitCode: assignedUnit?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante l'aggiornamento del cliente.");

      setRegisteredClients((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      closeEditClient();
      showToast("Dati cliente aggiornati con successo.", "success");
    } catch (err: any) {
      setEditError(err.message || "Errore durante l'aggiornamento del cliente.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    // Reset form
    setNome("");
    setCognome("");
    setRagioneSociale("");
    setCfOrPiva("");
    setEmail("");
    setPhone("");
    setSelectedUnitId("");
    setTempPassword("");
    setCreatedClientInfo(null);
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEmployee(true);
    setEmployeeFormError("");

    try {
      const res = await fetch("/api/admin/create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: empNome, cognome: empCognome, email: empEmail, role: empRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante la creazione dell'impiegato.");

      setEmpTempPassword(data.tempPassword);
      setShowAddEmployeeForm(false);
      setShowEmployeeSuccessPopup(true);
    } catch (err: any) {
      setEmployeeFormError(err.message || "Errore durante la creazione dell'impiegato.");
    } finally {
      setIsSubmittingEmployee(false);
    }
  };

  const closeEmployeeSuccessPopup = () => {
    setShowEmployeeSuccessPopup(false);
    setEmpNome("");
    setEmpCognome("");
    setEmpCf("");
    setEmpEmail("");
    setEmpRole("TECNICO");
    setEmpTempPassword("");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="gestione-view-container">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Pannello di Gestione</h2>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Ruolo: {userRole}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Onboarding Clienti, Associazione Appartamenti e Strumenti di Amministrazione
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Registrazione Nuovo Cliente (Abilitata sia per IMPRESA che per TECNICO) */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200/80 p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900">Registrazione & Associazione Cliente</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registra Persona Fisica o Giuridica, assegna l'appartamento e genera le credenziali
            </p>
          </div>
          <button
            className="w-full mt-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            id="btn-aggiungi-cliente"
            onClick={() => setShowAddClientForm(true)}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registra Nuovo Cliente</span>
          </button>
        </div>

        {userRole === "IMPRESA" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Nuovo Impiegato</h3>
              <p className="text-xs text-slate-500 mt-1">Aggiungi un nuovo membro del team operativo</p>
            </div>
            <button
              className="w-full mt-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              id="btn-aggiungi-impiegato"
              onClick={() => setShowAddEmployeeForm(true)}
            >
              <Briefcase className="w-4 h-4" />
              <span>Aggiungi Impiegato</span>
            </button>
          </div>
        )}
      </div>

      {/* Lista Clienti Registrati */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">Anagrafica Clienti & Associazione Unità</h3>
          </div>
          <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {registeredClients.length} Registrati
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tipologia</th>
                <th className="py-3 px-4">Nome / Ragione Sociale</th>
                <th className="py-3 px-4">Codice Fiscale / P.IVA</th>
                <th className="py-3 px-4">Numero di Telefono</th>
                <th className="py-3 px-4">Email Ufficiale</th>
                <th className="py-3 px-4">Appartamento Associato</th>
                <th className="py-3 px-4">Data Reg.</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registeredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        client.type === "PERSONA_FISICA"
                          ? "bg-sky-100 text-sky-800 border border-sky-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {client.type === "PERSONA_FISICA" ? "Persona Fisica" : "Persona Giuridica"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {client.type === "PERSONA_FISICA"
                      ? `${client.nome} ${client.cognome || ""}`
                      : client.ragioneSociale || client.nome}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                    {client.cfOrPiva}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {client.associatedUnitCode ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-lg text-xs border border-amber-300">
                        <Home className="w-3.5 h-3.5 text-amber-700" />
                        Interno {client.associatedUnitCode}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Non associato</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-medium">{client.registrationDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditClient(client)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                      title="Modifica dati cliente"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClientForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">
                    Registrazione e Onboarding Nuovo Cliente
                  </h3>
                  <p className="text-xs text-slate-300">
                    Abilitata per {userRole === "IMPRESA" ? "Amministratore (Impresa)" : "Tecnico di Cantiere"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClientForm(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddClientSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Tipologia Cliente Selector */}
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  Tipologia Cliente <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setClientType("PERSONA_FISICA")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer ${
                      clientType === "PERSONA_FISICA"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>PERSONA FISICA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientType("PERSONA_GIURIDICA")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer ${
                      clientType === "PERSONA_GIURIDICA"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>PERSONA GIURIDICA</span>
                  </button>
                </div>
              </div>

              {/* Name Fields based on Type */}
              {clientType === "PERSONA_FISICA" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nome <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="Es. Mario"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cognome <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cognome}
                      onChange={(e) => setCognome(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="Es. Rossi"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ragione Sociale <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ragioneSociale}
                    onChange={(e) => setRagioneSociale(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Es. Edilizia Futura S.r.l."
                  />
                </div>
              )}

              {/* Mandatory Fields Section Header */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Campi Obbligatori per Attivazione e Invio Credenziali</span>
              </div>

              {/* Codice Fiscale / P.IVA (Mandatory) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>{clientType === "PERSONA_FISICA" ? "Codice Fiscale" : "Partita IVA / Codice Fiscale"}</span>
                  <span className="text-rose-500 font-extrabold text-[10px]">* Campo Obbligatorio</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={cfOrPiva}
                    onChange={(e) => setCfOrPiva(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder={clientType === "PERSONA_FISICA" ? "RSSMRA80A01H501U" : "IT01234567890"}
                    maxLength={16}
                  />
                </div>
              </div>

              {/* Numero di Telefono (Mandatory) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Numero di Telefono</span>
                  <span className="text-rose-500 font-extrabold text-[10px]">* Campo Obbligatorio</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="+39 340 1234567"
                  />
                </div>
              </div>

              {/* Indirizzo Email (Mandatory) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Indirizzo E-mail</span>
                  <span className="text-rose-500 font-extrabold text-[10px]">* Campo Obbligatorio</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="cliente@email.it"
                  />
                </div>
              </div>

              {/* Associazione Appartamento */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-600" />
                  <span>Associazione Diretta Appartamento</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Seleziona l'unità abitativa da associare a questo cliente per consentire l'accesso immediato alla sua area personale.
                </p>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Nessuna Associazione (Assegna in seguito) --</option>
                  {unitsList.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Interno {unit.code} • Scala {unit.scaleLetter} • Piano {unit.floorNumber} {unit.clientName ? `(Attuale: ${unit.clientName})` : "(Libero)"}
                    </option>
                  ))}
                </select>
              </div>

              {clientFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {clientFormError}
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddClientForm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingClient ? "Registrazione in corso..." : "Registra & Associa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500 text-slate-950 rounded-xl font-black">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">Modifica Dati Cliente</h3>
                  <p className="text-xs text-slate-300">Correggi eventuali errori di digitazione nei dati registrati</p>
                </div>
              </div>
              <button
                onClick={closeEditClient}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {editingClient.type === "PERSONA_FISICA" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome</label>
                    <input
                      type="text"
                      required
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cognome</label>
                    <input
                      type="text"
                      required
                      value={editCognome}
                      onChange={(e) => setEditCognome(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ragione Sociale</label>
                  <input
                    type="text"
                    required
                    value={editRagioneSociale}
                    onChange={(e) => setEditRagioneSociale(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {editingClient.type === "PERSONA_FISICA" ? "Codice Fiscale" : "Partita IVA / Codice Fiscale"}
                </label>
                <input
                  type="text"
                  required
                  value={editCfOrPiva}
                  onChange={(e) => setEditCfOrPiva(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  maxLength={16}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Numero di Telefono</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Indirizzo E-mail</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <p className="text-[10px] text-slate-400">Se cambi l'email, il cliente dovrà usare la nuova email per accedere al portale.</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-600" />
                  <span>Appartamento Associato</span>
                </label>
                <select
                  value={editUnitId}
                  onChange={(e) => setEditUnitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Nessuna Associazione --</option>
                  {unitsList.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Interno {unit.code} • Scala {unit.scaleLetter} • Piano {unit.floorNumber} {unit.clientName ? `(Attuale: ${unit.clientName})` : "(Libero)"}
                    </option>
                  ))}
                </select>
              </div>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {editError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeEditClient}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingEdit ? "Salvataggio..." : "Salva Modifiche"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && createdClientInfo && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-200 animate-fade-in relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>

            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Cliente Registrato con Successo!</h3>
              <p className="text-xs text-slate-500 mt-1">
                L'account è stato creato e l'appartamento è stato correttamente associato.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 border border-slate-200/80 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-bold">Cliente:</span>
                <span className="font-black text-slate-900">
                  {createdClientInfo.type === "PERSONA_FISICA"
                    ? `${createdClientInfo.nome} ${createdClientInfo.cognome}`
                    : createdClientInfo.ragioneSociale}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-bold">CF / P.IVA:</span>
                <span className="font-mono font-bold text-slate-800">{createdClientInfo.cfOrPiva}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-bold">Telefono:</span>
                <span className="font-semibold text-slate-800">{createdClientInfo.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-bold">E-mail:</span>
                <span className="font-semibold text-slate-800">{createdClientInfo.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-bold">Appartamento:</span>
                <span className="font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {createdClientInfo.associatedUnitCode
                    ? `Interno ${createdClientInfo.associatedUnitCode}`
                    : "Nessuno"}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 font-bold block mb-1">Password Provvisoria per il Cliente:</span>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-emerald-700 font-black text-sm flex items-center justify-between">
                  <span>{tempPassword}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Generata</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-slate-500 font-bold text-left">
                Invia subito le credenziali al cliente:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`mailto:${createdClientInfo.email}?subject=${encodeURIComponent("Credenziali di accesso al portale COEBO")}&body=${encodeURIComponent(
                    buildCredentialsMessage(
                      createdClientInfo.type === "PERSONA_FISICA"
                        ? `${createdClientInfo.nome} ${createdClientInfo.cognome || ""}`.trim()
                        : createdClientInfo.ragioneSociale || createdClientInfo.nome,
                      createdClientInfo.email,
                      tempPassword
                    )
                  )}`}
                  className="px-3 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invia via Email</span>
                </a>
                <a
                  href={`https://wa.me/${toWaPhone(createdClientInfo.phone)}?text=${encodeURIComponent(
                    buildCredentialsMessage(
                      createdClientInfo.type === "PERSONA_FISICA"
                        ? `${createdClientInfo.nome} ${createdClientInfo.cognome || ""}`.trim()
                        : createdClientInfo.ragioneSociale || createdClientInfo.nome,
                      createdClientInfo.email,
                      tempPassword
                    )
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Invia via WhatsApp</span>
                </a>
              </div>
            </div>

            <button
              onClick={closeSuccessPopup}
              className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
            >
              Chiudi e Torna al Pannello
            </button>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500 text-slate-950 rounded-xl font-black">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">Registrazione Nuovo Impiegato</h3>
                  <p className="text-xs text-slate-300">Aggiungi un membro del team operativo COEBO</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEmployeeForm(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome</label>
                  <input
                    type="text"
                    required
                    value={empNome}
                    onChange={(e) => setEmpNome(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Mario"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cognome</label>
                  <input
                    type="text"
                    required
                    value={empCognome}
                    onChange={(e) => setEmpCognome(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Rossi"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Codice Fiscale</label>
                <input
                  type="text"
                  required
                  value={empCf}
                  onChange={(e) => setEmpCf(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="RSSMRA80A01H501U"
                  maxLength={16}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Indirizzo Email</label>
                <input
                  type="email"
                  required
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="mario.rossi@email.it"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ruolo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEmpRole("IMPRESA")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer ${
                      empRole === "IMPRESA"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Impresa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmpRole("TECNICO")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer ${
                      empRole === "TECNICO"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Tecnico</span>
                  </button>
                </div>
              </div>

              {employeeFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {employeeFormError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeForm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmployee}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingEmployee ? "Creazione in corso..." : "Conferma"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Success Popup */}
      {showEmployeeSuccessPopup && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200 animate-fade-in relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>

            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Impiegato Registrato con Successo!</h3>
              <p className="text-xs text-slate-500 mt-1">Le credenziali di accesso sono state generate.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 border border-slate-200/80 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-bold">Email Registrata:</span>
                <span className="font-semibold text-slate-800">{empEmail}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 font-bold block mb-1">Password Provvisoria:</span>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-indigo-700 font-black text-sm flex items-center justify-between">
                  <span>{empTempPassword}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Generata</span>
                </div>
              </div>
            </div>

            <a
              href={`mailto:${empEmail}?subject=${encodeURIComponent("Credenziali di accesso al portale COEBO")}&body=${encodeURIComponent(
                buildCredentialsMessage(`${empNome} ${empCognome}`.trim(), empEmail, empTempPassword)
              )}`}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invia Credenziali via Email</span>
            </a>

            <button
              onClick={closeEmployeeSuccessPopup}
              className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
            >
              Chiudi e Torna al Pannello
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

