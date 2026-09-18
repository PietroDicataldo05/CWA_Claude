import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Lock,
  Mail,
  User,
  Building,
  Hammer,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
} from "lucide-react";

const DEMO_PROFILES = [
  {
    role: "CLIENTE",
    label: "Cliente (Acquirente Interno 4)",
    name: "Elena De Michele",
    email: "elena.demichele99@gmail.com",
    password: "elena123",
    icon: User,
    iconWrapClass: "p-2 bg-amber-500/10 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors",
    pwClass: "text-[10px] text-slate-500 font-mono group-hover:text-amber-500 transition-colors",
  },
  {
    role: "IMPRESA",
    label: "Impresa (COEBO S.r.l.)",
    name: "Amministratore COEBO",
    email: "vito.conversano@binp.it",
    password: "vito123",
    icon: Building,
    iconWrapClass: "p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-400 group-hover:text-slate-950 transition-colors",
    pwClass: "text-[10px] text-slate-500 font-mono group-hover:text-indigo-400 transition-colors",
  },
  {
    role: "TECNICO",
    label: "Direzione Lavori & RPA (Tecnico)",
    name: "Ing. F. Mongelli",
    email: "ing.mongellifrancesco@gmail.com",
    password: "francesco123",
    icon: Hammer,
    iconWrapClass: "p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors",
    pwClass: "text-[10px] text-slate-500 font-mono group-hover:text-emerald-400 transition-colors",
  },
] as const;

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const doSignIn = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail.toLowerCase().trim(),
      password: loginPassword,
    });

    if (signInError) {
      setIsLoading(false);
      if (signInError.message.toLowerCase().includes("invalid login credentials")) {
        setError("Email o password non corrette.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    setSuccessMsg(`Accesso riuscito! Benvenuto.`);
    // App.tsx's onAuthStateChange listener picks up the new session automatically.
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSignIn(email, password);
  };

  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    doSignIn(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login-container">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-slate-800/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center space-y-4">
        <div className="inline-flex p-3 bg-slate-950 border border-amber-500/40 rounded-2xl shadow-xl shadow-amber-500/10">
          <img src="/logo.png" alt="Logo COEBO" className="h-14 sm:h-16 w-auto object-contain" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] tracking-wider uppercase font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Piattaforma di Commessa Digitale
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight font-display pt-2">
            COEBO S.r.l.
          </h2>
          <p className="text-xs text-slate-400">
            Portale di Gestione Layout, Documenti & Varianti Cantiere
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-950/40 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-slate-800/80 shadow-2xl shadow-black/40 space-y-6">
          <div className="text-center pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500">Accesso al Portale</h3>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Indirizzo Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="es. nome@dominio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chiave d'Accesso (Password)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Inserisci password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Autenticazione in corso...</span>
                </>
              ) : (
                <>
                  <span>Entra nel Portale</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-950/20 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Profili Demo Preimpostati
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DEMO_PROFILES.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(p.email, p.password)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all group text-left cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={p.iconWrapClass}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">{p.label}</span>
                    </div>
                  </div>
                  <span className={p.pwClass}>
                    pw: {p.password}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] text-slate-500 leading-normal">
          BINP4Venture (B4V) • Politecnico di Bari - Oplà Lab<br />
          Sviluppato per la digitalizzazione delle varianti extra-capitolato.
        </p>
      </div>
    </div>
  );
}
