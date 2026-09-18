import React, { useState, useEffect, useRef } from "react";
import { UserRole, UserProfile, ProjectDocument, VariationRequest, ChatMessage, ProjectTimelinePhase, CantiereConfig, UnitConfig, MassiveCommunication } from "./types";
import { supabase } from "./lib/supabaseClient";
import UserProfileSwitcher from "./components/UserProfileSwitcher";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import DocumentRepositoryView from "./components/DocumentRepositoryView";
import VariationsView from "./components/VariationsView";
import CompanyInfoView from "./components/CompanyInfoView";
import GestioneView from "./components/GestioneView";
import HousesList from "./components/HousesList";
import CantiereConfigurator from "./components/CantiereConfigurator";
import OnboardingModal from "./components/OnboardingModal";
import ArchiveView from "./components/ArchiveView";
import AccountingView from "./components/AccountingView";
import MassiveCommunicationView from "./components/MassiveCommunicationView";
import MessagesView from "./components/MessagesView";
import ToastHost from "./components/ToastHost";
import {
  LayoutDashboard,
  FolderArchive,
  Calculator,
  MessageSquare,
  Sparkles,
  Building,
  Hammer,
  HelpCircle,
  Construction,
  LogOut,
  Settings,
  User,
  Phone,
  Briefcase,
  Mail,
  UserCheck,
  ShieldAlert,
  X,
  Users,
  Receipt,
  Menu,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Bell
} from "lucide-react";

async function fetchWithRetry(url: string, options?: RequestInit, retries = 5, delay = 1000): Promise<Response> {
  try {
    const headers = {
      Accept: "application/json",
      ...(options?.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      throw new Error(`Risposta server non valida per ${url} (status: ${res.status})`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw err;
  }
}

export default function App() {
  // Authentication state, driven by the real Supabase session (not localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean>(true);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Notification center: tracks changes to documents/variations/messages/communications
  // between polls, so both roles stay updated without a manual refresh.
  interface AppNotification {
    id: string;
    text: string;
    time: string;
    read: boolean;
  }
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState<boolean>(false);
  const notifSnapshotRef = useRef<{
    documents: Record<string, { version: number }>;
    variations: Record<string, { status: string }>;
    lastMessageTimestamp: string;
    communications: Record<string, true>;
  } | null>(null);

  const [activeRole, setActiveRole] = useState<UserRole>("CLIENTE");

  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [variations, setVariations] = useState<VariationRequest[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phases, setPhases] = useState<ProjectTimelinePhase[]>([]);
  const [massiveCommunications, setMassiveCommunications] = useState<MassiveCommunication[]>([]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem("coebo_active_tab");
    return saved || "dashboard";
  });

  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(() => {
    return localStorage.getItem("coebo_selected_house_id") || null;
  });

  const [cantiereConfig, setCantiereConfig] = useState<CantiereConfig>({
    id: "",
    areaCode: "",
    projectAppalto: "",
    location: "",
    name: "",
    useSiteCodeFormat: true,
    scales: [],
    units: [],
    surfaces: [],
  });

  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState<boolean>(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (selectedHouseId) {
      localStorage.setItem("coebo_selected_house_id", selectedHouseId);
    } else {
      localStorage.removeItem("coebo_selected_house_id");
    }
  }, [selectedHouseId]);

  useEffect(() => {
    localStorage.setItem("coebo_active_tab", activeTab);
  }, [activeTab]);

  // Track the Supabase Auth session and load the matching profile row
  useEffect(() => {
    let mounted = true;

    const applySession = async (session: import("@supabase/supabase-js").Session | null) => {
      if (!session) {
        if (!mounted) return;
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserId(null);
        setAuthLoading(false);
        return;
      }

      let profile: any = null;
      let error: any = null;
      try {
        const result = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        profile = result.data;
        error = result.error;
      } catch (err) {
        error = err;
      }
      if (!mounted) return;

      if (error || !profile) {
        console.error("Impossibile caricare il profilo utente (sessione non valida, disconnessione):", error?.message || error);
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserId(null);
        setAuthLoading(false);
        await supabase.auth.signOut();
        return;
      }

      setCurrentUser({
        role: profile.role,
        name: profile.name,
        company: profile.company || undefined,
        phone: profile.phone || undefined,
        avatar: profile.avatar || undefined,
        email: session.user.email || "",
      });
      setUserId(session.user.id);
      setActiveRole(profile.role);
      setOnboardingDone(!!profile.onboarding_done);
      setIsLoggedIn(true);
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const forceOnboarding = isLoggedIn && currentUser?.role === "CLIENTE" && !onboardingDone;

  // Compares freshly-fetched data against the last known snapshot and turns
  // any difference (new/updated document, new/updated variation, new message,
  // new communication) into a notification. First run after login just
  // records the baseline silently so pre-existing data isn't reported as "new".
  const diffAndNotify = (
    uid: string,
    newDocs: ProjectDocument[],
    newVariations: VariationRequest[],
    newMessages: ChatMessage[],
    newComms: MassiveCommunication[]
  ) => {
    const prev = notifSnapshotRef.current;
    const nowIso = new Date().toISOString();

    if (!prev) {
      notifSnapshotRef.current = {
        documents: Object.fromEntries(newDocs.map((d) => [d.id, { version: d.version }])),
        variations: Object.fromEntries(newVariations.map((v) => [v.id, { status: v.status }])),
        lastMessageTimestamp: newMessages.reduce((max, m) => (m.timestamp > max ? m.timestamp : max), ""),
        communications: Object.fromEntries(newComms.map((c) => [c.id, true as const])),
      };
      localStorage.setItem(`coebo_notif_snapshot_${uid}`, JSON.stringify(notifSnapshotRef.current));
      return;
    }

    const fresh: AppNotification[] = [];

    newDocs.forEach((d) => {
      const old = prev.documents[d.id];
      if (!old) {
        fresh.push({ id: `doc-new-${d.id}`, text: `Nuovo documento caricato: "${d.title}"`, time: nowIso, read: false });
      } else if (old.version !== d.version) {
        fresh.push({ id: `doc-upd-${d.id}-${d.version}`, text: `Documento aggiornato: "${d.title}" (v${d.version})`, time: nowIso, read: false });
      }
    });

    newVariations.forEach((v) => {
      const old = prev.variations[v.id];
      if (!old) {
        fresh.push({ id: `var-new-${v.id}`, text: `Nuova richiesta di variante: "${v.title}"`, time: nowIso, read: false });
      } else if (old.status !== v.status) {
        fresh.push({ id: `var-upd-${v.id}-${v.status}`, text: `Variante "${v.title}" aggiornata: ${v.status.replace("_", " ")}`, time: nowIso, read: false });
      }
    });

    newMessages
      .filter((m) => m.timestamp > prev.lastMessageTimestamp)
      .forEach((m) => {
        fresh.push({ id: `msg-${m.id}`, text: `Nuovo messaggio da ${m.senderName}: "${m.text.slice(0, 60)}"`, time: nowIso, read: false });
      });

    newComms.forEach((c) => {
      if (!prev.communications[c.id]) {
        fresh.push({ id: `comm-${c.id}`, text: `Nuova comunicazione: "${c.title}"`, time: nowIso, read: false });
      }
    });

    if (fresh.length > 0) {
      setNotifications((prevList) => {
        const merged = [...fresh, ...prevList].slice(0, 50);
        localStorage.setItem(`coebo_notifications_${uid}`, JSON.stringify(merged));
        return merged;
      });
    }

    notifSnapshotRef.current = {
      documents: Object.fromEntries(newDocs.map((d) => [d.id, { version: d.version }])),
      variations: Object.fromEntries(newVariations.map((v) => [v.id, { status: v.status }])),
      lastMessageTimestamp: newMessages.reduce((max, m) => (m.timestamp > max ? m.timestamp : max), prev.lastMessageTimestamp),
      communications: Object.fromEntries(newComms.map((c) => [c.id, true as const])),
    };
    localStorage.setItem(`coebo_notif_snapshot_${uid}`, JSON.stringify(notifSnapshotRef.current));
  };

  // Synchronize state with secure backend database, polling periodically so
  // both CLIENTE and IMPRESA/TECNICO see each other's changes without a manual refresh.
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    try {
      const storedSnap = localStorage.getItem(`coebo_notif_snapshot_${userId}`);
      notifSnapshotRef.current = storedSnap ? JSON.parse(storedSnap) : null;
      const storedNotifs = localStorage.getItem(`coebo_notifications_${userId}`);
      setNotifications(storedNotifs ? JSON.parse(storedNotifs) : []);
    } catch {
      notifSnapshotRef.current = null;
      setNotifications([]);
    }

    let cancelled = false;

    const loadLiveData = async () => {
      try {
        const [docsRes, varsRes, msgsRes, commsRes] = await Promise.all([
          fetchWithRetry("/api/documents"),
          fetchWithRetry("/api/variations"),
          fetchWithRetry("/api/messages"),
          fetchWithRetry("/api/communications"),
        ]);
        const [docsData, varsData, msgsData, commsData] = await Promise.all([
          docsRes.json(),
          varsRes.json(),
          msgsRes.json(),
          commsRes.json(),
        ]);
        if (cancelled) return;
        setDocuments(docsData);
        setVariations(varsData);
        setMessages(msgsData);
        setMassiveCommunications(commsData);
        diffAndNotify(userId, docsData, varsData, msgsData, commsData);
      } catch (err) {
        console.error("Error loading live data from server:", err);
      }
    };

    const loadPhasesAndConfig = () => {
      fetchWithRetry("/api/phases")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setPhases(data);
        })
        .catch((err) => console.error("Error loading phases from server:", err));

      fetchWithRetry("/api/cantiere-config")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setCantiereConfig(data);
        })
        .catch((err) => console.error("Error loading cantiere config from server:", err));
    };

    loadLiveData();
    loadPhasesAndConfig();
    const interval = setInterval(loadLiveData, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoggedIn, userId]);

  // Helper to resolve client's assigned unit
  const getClientUnitId = (profile?: UserProfile | null): string => {
    const p = profile || currentUser;
    const clientNameLower = (p?.name || "").toLowerCase();
    const unitCode = (p as any)?.unitCode;

    if (unitCode) {
      const matchByCode = cantiereConfig.units.find(
        (u) => u.code.toLowerCase() === unitCode.toLowerCase() || u.id === `apt-${unitCode}`
      );
      if (matchByCode) return matchByCode.id;
    }

    if (clientNameLower) {
      const matchByName = cantiereConfig.units.find(
        (u) =>
          (u.clientName && u.clientName.toLowerCase().includes(clientNameLower)) ||
          (u.clientName && clientNameLower.includes(u.clientName.toLowerCase()))
      );
      if (matchByName) return matchByName.id;
    }

    const defaultUnit = cantiereConfig.units.find((u) => u.id === "apt-A05" || u.code === "A05");
    return defaultUnit ? defaultUnit.id : (cantiereConfig.units[0]?.id || "apt-A01");
  };

  // Enforce role-based access: CLIENTE is restricted to their assigned apartment and cannot access Piattaforma Gestione Cantiere
  useEffect(() => {
    if (isLoggedIn && activeRole === "CLIENTE") {
      if (activeTab === "gestione" || activeTab === "archive") {
        setActiveTab("dashboard");
      }
      if (!selectedHouseId) {
        const clientUnit = getClientUnitId(currentUser);
        setSelectedHouseId(clientUnit);
      }
    }
  }, [isLoggedIn, activeRole, currentUser, selectedHouseId, activeTab, cantiereConfig]);

  const currentProfile = currentUser || {
    role: activeRole,
    name: "Caricamento...",
    email: "",
    phone: "",
  };

  // Global Handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSelectedHouseId(null);
    setActiveTab("dashboard");
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        company: updatedProfile.company,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile on server:", error.message);
    }
  };

  const handleAddDocument = (newDoc: ProjectDocument, file?: File) => {
    setDocuments((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === newDoc.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newDoc;
        return updated;
      }
      return [newDoc, ...prev];
    });

    // Save to secure backend database, uploading the real file if provided
    const formData = new FormData();
    formData.append("meta", JSON.stringify(newDoc));
    if (file) formData.append("file", file);

    fetch("/api/documents", {
      method: "POST",
      body: formData,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Errore nel salvataggio documento"))))
      .then((saved: ProjectDocument) => {
        setDocuments((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      })
      .catch((err) => console.error("Error saving document to server:", err));
  };

  const handleUpdateDocumentStatus = (id: string, status: "vigente" | "sostituito" | "attesa_approvazione") => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );

    // Save to secure backend database
    fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).catch((err) => console.error("Error updating document status on server:", err));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    // Delete from secure backend database
    fetch(`/api/documents/${id}`, {
      method: "DELETE"
    }).catch((err) => console.error("Error deleting document from server:", err));
  };

  const handleAddVariation = (newVar: VariationRequest) => {
    setVariations((prev) => [newVar, ...prev]);

    // Automatically send a system message to the chat channel alerting the team
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const alertMsg: ChatMessage = {
      id: `msg-alert-${Date.now()}`,
      channelId: newVar.category === "Impiantistica" ? "impianti" : newVar.category === "Architettonica" ? "architettura" : "extra",
      senderName: "COEBO Digital Partner",
      senderRole: "IMPRESA",
      text: `[Notifica di Sistema] È stata registrata una nuova richiesta di variante extra-capitolato in piattaforma:\n"${newVar.title}"\nSi prega di visionare la scheda tecnica per la valutazione economica.`,
      timestamp: nowStr,
      linkedVariationId: newVar.id,
    };
    setMessages((prev) => [...prev, alertMsg]);

    // Save to secure backend database
    fetch("/api/variations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVar)
    }).catch((err) => console.error("Error saving variation to server:", err));

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alertMsg)
    }).catch((err) => console.error("Error saving alert message to server:", err));
  };

  const handleUpdateVariationStatus = (
    id: string,
    status: "richiesta" | "in_valutazione" | "approvata" | "rifiutata" | "completata",
    technicalAssessment?: string,
    estimatedCost?: number,
    finalCost?: number,
    materials?: string[],
    days?: number
  ) => {
    let updatedVar: VariationRequest | undefined;
    const now = new Date();
    const formattedNow = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setVariations((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated: VariationRequest = { ...v, status };
          if (technicalAssessment !== undefined) updated.technicalAssessment = technicalAssessment;
          if (estimatedCost !== undefined) updated.estimatedCost = estimatedCost;
          if (finalCost !== undefined) updated.finalCost = finalCost;
          if (materials !== undefined) updated.materials = materials;
          if (days !== undefined) updated.timelineImpactDays = days;
          updatedVar = updated;
          return updated;
        }
        return v;
      })
    );

    // Update cantiere timeline phase states based on variant progress
    if (status === "approvata") {
      const targetVar = variations.find((v) => v.id === id);
      if (targetVar && targetVar.category === "Impiantistica") {
        setPhases((prev) => {
          const newPhases = prev.map((p) => (p.id === 2 ? { ...p, status: "in_corso" as const } : p));
          
          // Save phase status change to secure backend database
          fetch(`/api/phases/2`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_corso" })
          }).catch((err) => console.error("Error updating phase status on server:", err));
          
          return newPhases;
        });
      }
    }

    // Post system alert message
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const targetVar = variations.find((v) => v.id === id);
    const statusLabels: { [key: string]: string } = {
      approvata: "APPROVATO dal Cliente - Lavori autorizzati",
      rifiutata: "RIFIUTATO dal Cliente",
      in_valutazione: "VALUTATO tecnicamente dall'impresa",
      completata: "ULTIMATO in cantiere",
    };

    const notifyMsg: ChatMessage = {
      id: `msg-notify-${Date.now()}`,
      channelId: targetVar?.category === "Impiantistica" ? "impianti" : targetVar?.category === "Architettonica" ? "architettura" : "extra",
      senderName: "COEBO Digital Partner",
      senderRole: "IMPRESA",
      text: `[Notifica di Sistema] Lo stato della variante "${targetVar?.title || "Sconosciuta"}" è stato aggiornato a: \n**${statusLabels[status] || status}**.`,
      timestamp: nowStr,
      linkedVariationId: id,
    };
    setMessages((prev) => [...prev, notifyMsg]);

    // Save variation status change to secure backend database
    if (updatedVar) {
      fetch(`/api/variations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVar)
      }).catch((err) => console.error("Error updating variation on server:", err));
    }

    // Save notification message to secure backend database
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifyMsg)
    }).catch((err) => console.error("Error saving notification message to server:", err));
  };

  const handleUpdateVariationPayment = (
    id: string,
    updates: { isPaid?: boolean; balanceDue?: number; dueDate?: string }
  ) => {
    let updatedVar: VariationRequest | undefined;

    setVariations((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, ...updates };
          updatedVar = updated;
          return updated;
        }
        return v;
      })
    );

    if (updatedVar) {
      fetch(`/api/variations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      }).catch((err) => console.error("Error updating variation payment on server:", err));
    }
  };

  const handleUpdatePhaseStatus = (id: number, status: "completato" | "in_corso" | "da_iniziare") => {
    const completedDate = status === "completato" ? new Date().toISOString() : undefined;
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, completedDate } : p))
    );

    // Save to secure backend database
    fetch(`/api/phases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, completedDate })
    }).catch((err) => console.error("Error updating phase status on server:", err));
  };

  const handleSendMessage = (newMsg: ChatMessage) => {
    setMessages((prev) => [...prev, newMsg]);

    // Save message to secure backend database
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg)
    }).catch((err) => console.error("Error saving message to server:", err));
  };

  const persistCantiereConfig = (updated: CantiereConfig) => {
    fetch("/api/cantiere-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    }).catch((err) => console.error("Error saving cantiere config to server:", err));
  };

  const handleSaveCantiereConfig = (updated: CantiereConfig) => {
    setCantiereConfig(updated);
    persistCantiereConfig(updated);
  };

  const handleSaveUnitConfig = (updatedUnit: UnitConfig) => {
    setCantiereConfig((prev) => {
      const updatedUnits = prev.units.map((u) =>
        u.id === updatedUnit.id ? updatedUnit : u
      );
      const updatedConfig = { ...prev, units: updatedUnits };
      persistCantiereConfig(updatedConfig);
      return updatedConfig;
    });
  };

  const handleSendCommunication = (newComm: MassiveCommunication) => {
    setMassiveCommunications((prev) => [newComm, ...prev]);

    // Save to secure backend database
    fetch("/api/communications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComm)
    }).catch((err) => console.error("Error saving communication to server:", err));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Piattaforma Gestione Cantiere (HousesList) is strictly restricted to IMPRESA and TECNICO
  if (activeRole !== "CLIENTE" && !selectedHouseId && activeTab !== "archive" && activeTab !== "gestione") {
    return (
      <>
        <ToastHost />
        <HousesList
          onSelectHouse={(id) => {
            setSelectedHouseId(id);
            setActiveTab("dashboard");
          }}
          onLogout={handleLogout}
          userRole={activeRole}
          cantiereConfig={cantiereConfig}
          documents={documents}
          onAddDocument={handleAddDocument}
          onOpenConfigurator={() => setIsConfiguratorOpen(true)}
          onSaveCantiereConfig={handleSaveCantiereConfig}
          onSaveUnitConfig={handleSaveUnitConfig}
          onOpenArchive={() => {
            const defaultUnitId = cantiereConfig?.units[0]?.id || "apt-A01";
            setSelectedHouseId(defaultUnitId);
            setActiveTab("archive");
          }}
          onOpenGestione={() => {
            const defaultUnitId = cantiereConfig?.units[0]?.id || "apt-A01";
            setSelectedHouseId(defaultUnitId);
            setActiveTab("gestione");
          }}
          onOpenDocuments={() => {
            const defaultUnitId = cantiereConfig?.units[0]?.id || "apt-A01";
            setSelectedHouseId(defaultUnitId);
            setActiveTab("documents");
          }}
        />
        {isConfiguratorOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-5xl w-full my-auto">
              <CantiereConfigurator
                config={cantiereConfig}
                readOnly={activeRole === "CLIENTE"}
                onSaveConfig={handleSaveCantiereConfig}
                onClose={() => setIsConfiguratorOpen(false)}
                collapsible={false}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  const availableNavTabs = [
    { id: "dashboard", label: "Dashboard Cantiere", icon: LayoutDashboard },
    { id: "accounting", label: "Contabilità", icon: Receipt },
    { id: "variations", label: "Varianti & Extra", icon: Calculator },
    { id: "documents", label: "Documenti Cantiere", icon: FolderArchive },
    { id: "messages", label: "Messaggi Cantiere", icon: MessageSquare },
    { id: "communications", label: "Comunicazioni", icon: Megaphone },
    ...(activeRole !== "CLIENTE"
      ? [{ id: "archive", label: "Archivio Clienti", icon: ShieldAlert }]
      : []),
    ...(activeRole !== "IMPRESA" && activeRole !== "TECNICO"
      ? [{ id: "company-info", label: "Informazioni sull'azienda", icon: Building }]
      : []),
    ...(activeRole === "IMPRESA" || activeRole === "TECNICO"
      ? [{ id: "gestione", label: "Gestione", icon: Users }]
      : []),
  ];

  const currentNavTabObj = availableNavTabs.find((t) => t.id === activeTab) || availableNavTabs[0];
  const ActiveNavTabIcon = currentNavTabObj.icon;

  return (
    <div className="min-h-screen bg-[#0B0F17] bg-blueprint-grid flex flex-col font-sans antialiased text-slate-100 selection:bg-amber-500 selection:text-slate-950" id="app-root-layout">
      <ToastHost />
      {/* 2. Brand Header with Tab Selection & Logged-in User Profile */}
      <header className="bg-[#0D131F]/95 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]" id="app-main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          {/* Tier 1: Brand Logo, Torna ai Cantieri (Impresa & Tecnico only), Desktop Profile & Logout OR Mobile Menu Toggle */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
            {/* Left: Logo & Torna ai Cantieri */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="p-1.5 sm:p-2 bg-slate-900 border border-amber-500/40 rounded-xl shadow-[2px_2px_0px_0px_rgba(245,158,11,0.5)] shrink-0">
                <img src="/logo.png" alt="Logo COEBO" className="h-9 sm:h-11 w-auto object-contain" />
              </div>

              {activeRole !== "CLIENTE" && (
                <button
                  onClick={() => {
                    setSelectedHouseId(null);
                    setActiveTab("dashboard");
                  }}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-mono-tech font-bold text-amber-400 hover:text-slate-950 bg-slate-900 hover:bg-amber-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-amber-500/50 hover:border-amber-400 brutalist-shadow-sm shrink-0"
                  id="btn-torna-ai-cantieri"
                  title="Torna alla Piattaforma Gestione Cantiere"
                >
                  <span className="text-amber-500 font-black text-sm">&larr;</span>
                  <span className="hidden sm:inline">TORNA AI CANTIERI</span>
                  <span className="sm:hidden text-[10px]">CANTIERI</span>
                </button>
              )}

              {/* Mobile/Tablet active tab pill indicator when navbar is collapsed */}
              {isNavCollapsed && (
                <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-mono-tech font-bold truncate max-w-[120px] sm:max-w-xs">
                  <ActiveNavTabIcon className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">{currentNavTabObj.label}</span>
                </div>
              )}
            </div>

            {/* Right: Desktop Profile & Logout OR Mobile Toggle Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop Profile Badge & Logout (lg+) */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifPanel((p) => !p);
                      if (!showNotifPanel) setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    }}
                    className="relative p-2.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                    title="Notifiche"
                    id="header-notif-bell"
                  >
                    <Bell className="w-4 h-4 text-amber-400" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-slate-950">
                        {notifications.filter((n) => !n.read).length > 9 ? "9+" : notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </button>
                  {showNotifPanel && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                      <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-left">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Notifiche</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={() => {
                                setNotifications([]);
                                if (userId) localStorage.removeItem(`coebo_notifications_${userId}`);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              Cancella tutto
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">Nessuna notifica per ora</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {notifications.map((n) => (
                              <div key={n.id} className={`px-4 py-3 text-xs ${n.read ? "text-slate-500" : "text-slate-800 font-semibold bg-amber-50/60"}`}>
                                <p>{n.text}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(n.time).toLocaleString("it-IT")}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-amber-500/30 transition-all cursor-pointer text-left group brutalist-shadow-sm"
                  id="header-user-badge"
                  title="Modifica i tuoi dati personali"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs border border-amber-400 shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-mono-tech font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-tight flex items-center gap-1 whitespace-nowrap">
                      <span>{currentUser ? currentUser.name : currentProfile.name}</span>
                      <Settings className="w-3 h-3 text-amber-500 group-hover:rotate-45 transition-transform duration-200" />
                    </p>
                    <p className="text-[9px] font-mono-tech font-semibold text-amber-500 uppercase tracking-wider">
                      {activeRole} • PROFILO
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono-tech font-bold tracking-wide transition-all duration-150 flex items-center space-x-2 border border-rose-500/40 bg-rose-950/40 text-rose-400 hover:bg-rose-500 hover:text-slate-950 cursor-pointer brutalist-shadow-sm shrink-0"
                  id="logout-button"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>ESCI</span>
                </button>
              </div>

              {/* Mobile / Tablet: always-visible Notification Bell + Menu Toggle (< lg) */}
              <div className="lg:hidden relative shrink-0">
                <button
                  onClick={() => {
                    setShowNotifPanel((p) => !p);
                    if (!showNotifPanel) setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  }}
                  className="relative p-2.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                  title="Notifiche"
                  id="mobile-header-notif-bell"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-slate-950">
                      {notifications.filter((n) => !n.read).length > 9 ? "9+" : notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifPanel && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                    <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-left">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Notifiche</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => {
                              setNotifications([]);
                              if (userId) localStorage.removeItem(`coebo_notifications_${userId}`);
                            }}
                            className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            Cancella tutto
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">Nessuna notifica per ora</div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {notifications.map((n) => (
                            <div key={n.id} className={`px-4 py-3 text-xs ${n.read ? "text-slate-500" : "text-slate-800 font-semibold bg-amber-50/60"}`}>
                              <p>{n.text}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(n.time).toLocaleString("it-IT")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile / Tablet Menu Toggle Button (< lg) */}
              <button
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech font-black text-amber-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-amber-500/50 transition-all cursor-pointer brutalist-shadow-sm active:scale-95"
                id="btn-toggle-mobile-nav"
                title={isNavCollapsed ? "Espandi menu navbar" : "Riduci navbar a icona"}
                aria-label="Riduci o espandi navbar"
              >
                {isNavCollapsed ? (
                  <>
                    <Menu className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline text-[11px]">MENU</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline text-[11px]">CHIUDI</span>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tier 2: Navigation Tabs Bar (Full width on Desktop; Collapsible dropdown on Mobile/Tablet) */}
          <nav
            className={`${
              isNavCollapsed ? "hidden lg:flex" : "flex"
            } flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 pt-2.5 transition-all w-full`}
            id="navigation-tabs"
          >
            {/* Mobile/Tablet: profile summary card, tap to edit — comes first so it always reads as "who am I" before "where can I go" */}
            <div className="lg:hidden flex items-center gap-2 w-full">
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsNavCollapsed(true);
                }}
                className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-amber-500/30 transition-all cursor-pointer text-left group brutalist-shadow-sm"
                id="mobile-header-user-badge"
                title="Modifica i tuoi dati personali"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm border border-amber-400 shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentProfile.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-mono-tech font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-tight flex items-center gap-1 truncate">
                    <span className="truncate">{currentUser ? currentUser.name : currentProfile.name}</span>
                    <Settings className="w-3 h-3 text-amber-500 group-hover:rotate-45 transition-transform duration-200 shrink-0" />
                  </p>
                  <p className="text-[9px] font-mono-tech font-semibold text-amber-500 uppercase tracking-wider">
                    {activeRole} • PROFILO
                  </p>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="p-3 bg-rose-950/40 hover:bg-rose-500 text-rose-400 hover:text-slate-950 rounded-xl border border-rose-500/40 transition-all cursor-pointer brutalist-shadow-sm shrink-0"
                id="mobile-logout-button"
                title="Esci dal portale"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Nav tabs: uniform 2-column grid on mobile so every entry lines up, single row on desktop */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:flex lg:flex-wrap lg:items-center w-full lg:w-auto">
              {availableNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsNavCollapsed(true);
                    }}
                    className={`px-3 py-2 sm:px-3.5 rounded-xl text-xs font-mono-tech font-bold tracking-wide transition-all duration-150 flex items-center gap-2 border cursor-pointer lg:whitespace-nowrap ${
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-black brutalist-shadow-amber"
                        : "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-amber-400 hover:border-amber-500/40"
                    }`}
                    id={`nav-tab-${tab.id}`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                    <span className="leading-tight text-left">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* 3. Main Active Content Frame */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Render View Based on Active Tab */}
        {activeTab === "dashboard" && (
          <DashboardView 
            phases={phases} 
            documents={documents} 
            variations={variations} 
            userRole={activeRole} 
            cantiereConfig={cantiereConfig}
            selectedHouseId={selectedHouseId}
            onSaveCantiereConfig={handleSaveCantiereConfig}
            onSaveUnitConfig={handleSaveUnitConfig}
            onUpdateVariationStatus={handleUpdateVariationStatus}
            onUpdatePhaseStatus={handleUpdatePhaseStatus}
            onNavigate={setActiveTab}
            onAddDocument={handleAddDocument}
          />
        )}

        {activeTab === "accounting" && (
          <AccountingView
            userRole={activeRole}
            variations={variations}
            selectedHouseId={selectedHouseId}
            cantiereConfig={cantiereConfig}
            onNavigateToVariations={() => setActiveTab("variations")}
            onUpdateVariationPayment={handleUpdateVariationPayment}
          />
        )}

        {activeTab === "archive" && activeRole !== "CLIENTE" && (
          <ArchiveView
            userRole={activeRole}
            cantiereConfig={cantiereConfig}
            onNavigateToHouse={(houseId) => {
              setSelectedHouseId(houseId);
              setActiveTab("dashboard");
            }}
          />
        )}

        {activeTab === "documents" && (
          <DocumentRepositoryView
            documents={documents}
            userRole={activeRole}
            userName={currentProfile.name}
            onAddDocument={handleAddDocument}
            onUpdateDocumentStatus={handleUpdateDocumentStatus}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === "variations" && (
          <VariationsView
            variations={variations}
            userRole={activeRole}
            userName={currentProfile.name}
            onAddVariation={handleAddVariation}
            onUpdateVariationStatus={handleUpdateVariationStatus}
            onUpdateVariationPayment={handleUpdateVariationPayment}
          />
        )}

        {activeTab === "messages" && (
          <MessagesView
            messages={messages}
            documents={documents}
            userRole={activeRole}
            userName={currentProfile.name}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === "communications" && (
          <MassiveCommunicationView
            userRole={activeRole}
            userName={currentProfile.name}
            communications={massiveCommunications}
            onSendCommunication={handleSendCommunication}
          />
        )}

        {activeTab === "company-info" && (
          <CompanyInfoView />
        )}

        {activeTab === "gestione" && (activeRole === "IMPRESA" || activeRole === "TECNICO") && (
          <GestioneView
            userRole={activeRole}
            cantiereConfig={cantiereConfig}
            onOpenConfigurator={() => setIsConfiguratorOpen(true)}
            onSaveUnitConfig={handleSaveUnitConfig}
          />
        )}
      </main>

      {/* Cantiere Configurator Modal */}
      {isConfiguratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full my-auto">
            <CantiereConfigurator
              config={cantiereConfig}
              onSaveConfig={handleSaveCantiereConfig}
              onClose={() => setIsConfiguratorOpen(false)}
              collapsible={false}
            />
          </div>
        </div>
      )}

      {/* Mandatory Onboarding Legal Modal on First Access */}
      {forceOnboarding && currentUser && (
        <OnboardingModal
          user={currentUser}
          onCancel={() => {
            // Log out if user cancels mandatory onboarding
            handleLogout();
          }}
          onComplete={() => {
            setOnboardingDone(true);
          }}
        />
      )}

      {/* 4. Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-12 text-slate-400 text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-500">
              BINP4Venture (B4V) 2026 – Piattaforma di Gestione Cantiere
            </p>
            <p className="text-[10px] text-slate-400">
              Sviluppato in collaborazione con <span className="font-bold">COEBO S.r.l.</span> & <span className="font-bold">Politecnico di Bari - Oplà Lab</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-[10px] text-slate-400">
              Supervisore BINP: <span className="font-semibold text-slate-500">Vito Conversano</span> • RPA: <span className="font-semibold text-slate-500">Ing. F. Mongelli</span>
            </p>
          </div>
        </div>
      </footer>

      {/* 5. Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="profile-edit-modal">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden transform scale-100 transition-all">
            {/* Modal Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/15 rounded-xl text-amber-700 border border-amber-500/20">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Modifica Profilo PoC
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    Aggiorna i tuoi dati personali sulla piattaforma COEBO
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updated: UserProfile = {
                ...currentProfile,
                name: formData.get("name") as string,
                phone: formData.get("phone") as string,
                company: formData.get("company") as string,
              };
              handleUpdateProfile(updated);
              setIsProfileModalOpen(false);
            }} className="p-6 space-y-4">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={currentProfile.name}
                    className="w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Field (Disabled) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indirizzo Email (Immutabile)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    disabled
                    value={currentProfile.email}
                    className="w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200/80 rounded-xl cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Numero di Telefono</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={currentProfile.phone || ""}
                    placeholder="+39 333 1234567"
                    className="w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Company Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Azienda / Ente</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="company"
                    defaultValue={currentProfile.company || ""}
                    placeholder="Esempio: COEBO Costruzioni S.r.l."
                    className="w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Role Indicator */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div className="text-left leading-none">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wide">Permessi Profilo Attivo</span>
                  <span className="text-[11px] font-extrabold text-slate-700 block mt-1 uppercase">{activeRole}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-3xs transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Salva Modifiche</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
