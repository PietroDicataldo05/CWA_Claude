import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ProjectDocument, UserRole } from "../types";
import {
  Send,
  MessageSquare,
  Paperclip,
  FileText,
  X,
  Hammer,
  Building,
  User,
  Wrench,
  Layers,
  ShieldAlert,
  Info,
} from "lucide-react";

interface MessagesViewProps {
  messages: ChatMessage[];
  documents: ProjectDocument[];
  userRole: UserRole;
  userName: string;
  onSendMessage: (msg: ChatMessage) => void;
}

const CHANNELS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "generale", label: "Generale", icon: MessageSquare },
  { id: "architettura", label: "Architettonica", icon: Layers },
  { id: "impianti", label: "Impianti", icon: Wrench },
  { id: "extra", label: "Finiture & Extra", icon: ShieldAlert },
];

const ROLE_STYLE: Record<UserRole, { badge: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  CLIENTE: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: User, label: "Cliente" },
  IMPRESA: { badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30", icon: Building, label: "Impresa" },
  TECNICO: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: Hammer, label: "Tecnico" },
};

export default function MessagesView({
  messages,
  documents,
  userRole,
  userName,
  onSendMessage,
}: MessagesViewProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("generale");
  const [text, setText] = useState("");
  const [isDocPickerOpen, setIsDocPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages.filter((m) => m.channelId === selectedChannel);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [channelMessages.length, selectedChannel]);

  const buildBaseMessage = (): Omit<ChatMessage, "id" | "text"> => {
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").substring(0, 16);
    return {
      channelId: selectedChannel,
      senderName: userName,
      senderRole: userRole,
      timestamp,
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSendMessage({
      id: `msg-${Date.now()}`,
      ...buildBaseMessage(),
      text: text.trim(),
    });
    setText("");
  };

  const handleShareDocument = (doc: ProjectDocument) => {
    onSendMessage({
      id: `msg-${Date.now()}`,
      ...buildBaseMessage(),
      text: `📎 Ha condiviso il documento: "${doc.title}"`,
      linkedDocId: doc.id,
    });
    setIsDocPickerOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto font-sans" id="messages-view-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#0F172A] to-[#1E293B] border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white brutalist-shadow-amber">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <MessageSquare className="w-40 h-40 text-amber-500" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-mono-tech font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Canale di Comunicazione Strutturata</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">
            Messaggi Cliente &harr; Impresa
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl font-mono-tech">
            Canale ufficiale di messaggistica per il cantiere, in sostituzione di e-mail e telefonate informali. Puoi anche condividere direttamente i documenti di progetto.
          </p>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          const isActive = selectedChannel === ch.id;
          const count = messages.filter((m) => m.channelId === ch.id).length;
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono-tech font-bold tracking-wide transition-all flex items-center gap-1.5 border cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black brutalist-shadow-amber"
                  : "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-amber-400 hover:border-amber-500/40"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
              <span>{ch.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 rounded-full ${isActive ? "bg-slate-950/20" : "bg-slate-800"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chat Panel */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {channelMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-2">
              <MessageSquare className="w-10 h-10 text-slate-700" />
              <p className="text-xs font-mono-tech">
                Nessun messaggio in questo canale. Scrivi il primo per avviare la conversazione.
              </p>
            </div>
          ) : (
            channelMessages.map((msg) => {
              const isOwn = msg.senderRole === userRole && msg.senderName === userName;
              const roleStyle = ROLE_STYLE[msg.senderRole] || ROLE_STYLE.IMPRESA;
              const RoleIcon = roleStyle.icon;
              const linkedDoc = msg.linkedDocId ? documents.find((d) => d.id === msg.linkedDocId) : undefined;

              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className={`text-[10px] font-mono-tech font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-1 ${roleStyle.badge}`}>
                        <RoleIcon className="w-3 h-3" />
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono-tech">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                        isOwn
                          ? "bg-amber-500 text-slate-950 font-semibold rounded-tr-sm"
                          : "bg-[#0B0F17] border border-slate-800 text-slate-200 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {linkedDoc && (
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-mono-tech font-bold ${
                          isOwn
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-slate-900 border-slate-800 text-slate-300"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{linkedDoc.title}</span>
                        <span className="text-[9px] text-slate-500 uppercase shrink-0">v{linkedDoc.version}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* Document Picker */}
        {isDocPickerOpen && (
          <div className="border-t border-slate-800 bg-[#0B0F17] p-3 max-h-48 overflow-y-auto space-y-1.5">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-mono-tech font-bold text-slate-400 uppercase">
                Seleziona un documento da condividere
              </span>
              <button
                type="button"
                onClick={() => setIsDocPickerOpen(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {documents.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono-tech px-1">Nessun documento disponibile.</p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleShareDocument(doc)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-200 truncate flex-1">{doc.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono-tech uppercase shrink-0">v{doc.version}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Compose Box */}
        <form onSubmit={handleSend} className="border-t border-slate-800 p-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDocPickerOpen((v) => !v)}
            title="Condividi un documento di progetto"
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isDocPickerOpen
                ? "bg-amber-500 text-slate-950 border-amber-400"
                : "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Scrivi un messaggio nel canale "${CHANNELS.find((c) => c.id === selectedChannel)?.label}"...`}
            className="flex-1 px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono-tech px-1">
        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Tutti i messaggi sono salvati nello storico ufficiale di commessa e visibili a impresa, cliente e tecnico coinvolti nel cantiere.</span>
      </div>
    </div>
  );
}
