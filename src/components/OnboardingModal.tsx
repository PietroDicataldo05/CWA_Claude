import React, { useState } from "react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabaseClient";
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface OnboardingModalProps {
  user: UserProfile;
  onComplete: (newPassword?: string) => void;
  onCancel?: () => void;
}

export default function OnboardingModal({ user, onComplete, onCancel }: OnboardingModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Legal Checkboxes
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Modal to display full legal document
  const [viewingDoc, setViewingDoc] = useState<"privacy" | "cookie" | "terms" | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isPasswordValid = oldPassword.trim().length > 0 && newPassword.length >= 6 && newPassword === confirmPassword;
  const isAllAccepted = privacyAccepted && cookieAccepted && termsAccepted && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAccepted || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    if (pwError) {
      setSubmitError("Errore durante l'aggiornamento della password: " + pwError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from("profiles").update({ onboarding_done: true }).eq("id", userData.user.id);
    }

    setIsSubmitting(false);
    onComplete(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Primo Accesso Obbligatorio
              </span>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                Onboarding & Attivazione Cliente
              </h2>
              <p className="text-xs text-slate-300">
                Benvenuto, <span className="text-amber-400 font-bold">{user.name}</span>. Completa la configurazione iniziale per accedere.
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          
          {/* Step 1: Mandatory Password Change */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>1. Cambio Password Obbligatorio (Primo Accesso)</span>
            </div>
            <p className="text-xs text-slate-500">
              Per motivi di sicurezza, imposta una nuova password personale in sostituzione di quella temporanea fornita in fase di registrazione.
            </p>

            <div className="space-y-3 pt-1">
              {/* Vecchia Password / Password Temporanea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Vecchia Password (Password Temporanea)</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Inserisci la vecchia password ricevuta"
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Nuova Password (min. 6 caratteri)</label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Scegli nuova password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Conferma Nuova Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ripeti nuova password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {(oldPassword.length > 0 || newPassword.length > 0) && (
              <div className="text-[11px] font-semibold">
                {oldPassword.trim().length === 0 ? (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Inserisci la vecchia password temporanea.
                  </span>
                ) : newPassword.length < 6 ? (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> La nuova password deve contenere almeno 6 caratteri.
                  </span>
                ) : newPassword !== confirmPassword ? (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Le due nuove password non coincidono.
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Vecchia e nuova password inserite correttamente.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Mandatory Legal Acceptance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>2. Accettazione Documentazione Legale (Obbligatoria)</span>
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Tutti i campi obbligatori
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Spunta le tre checkbox obbligatorie sottostanti per confermare la presa visione dei documenti legali e l'attivazione dei servizi di commessa digitale.
            </p>

            <div className="space-y-2.5">
              
              {/* Checkbox 1: Privacy Policy */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  privacyAccepted
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  id="chk-privacy"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <label htmlFor="chk-privacy" className="font-bold block cursor-pointer">
                    Informativa sulla Privacy <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    "Dichiaro di aver letto la Privacy Policy" e acconsento al trattamento dei dati personali ai sensi del Regolamento Europeo GDPR 2016/679.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDoc("privacy")}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Leggi</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Checkbox 2: Cookie Policy */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  cookieAccepted
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  id="chk-cookie"
                  checked={cookieAccepted}
                  onChange={(e) => setCookieAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <label htmlFor="chk-cookie" className="font-bold block cursor-pointer">
                    Cookie Policy <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    "Dichiaro di aver letto la Cookie Policy" e accetto l'uso dei cookie tecnici necessari al corretto funzionamento della piattaforma.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDoc("cookie")}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Leggi</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Checkbox 3: Termini e Condizioni */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  termsAccepted
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  id="chk-terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <label htmlFor="chk-terms" className="font-bold block cursor-pointer">
                    Termini e Condizioni di Servizio <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    "Accetto i termini e condizioni di servizio" relativi alla gestione delle varianti in cantiere, approvazioni e comunicazioni formali.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDoc("terms")}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Leggi</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            {submitError && (
              <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mb-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={!isAllAccepted || isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                isAllAccepted && !isSubmitting
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
              }`}
            >
              <span>{isSubmitting ? "Attivazione in corso..." : "Completa Attivazione Account e Accedi"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isAllAccepted && (
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Spunta tutte e 3 le checkbox e inserisci una password valida per abilitare il pulsante.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Viewer Modal for Legal Text */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                {viewingDoc === "privacy" && "Informativa sulla Privacy (GDPR)"}
                {viewingDoc === "cookie" && "Cookie Policy Piattaforma"}
                {viewingDoc === "terms" && "Termini e Condizioni di Servizio"}
              </h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto text-xs text-slate-600 space-y-3 pr-1 leading-relaxed">
              {viewingDoc === "privacy" && (
                <>
                  <p className="font-bold text-slate-800">1. Titolare del Trattamento</p>
                  <p>COEBO S.r.l. con sede in Bari, Titolare del trattamento dei dati personali forniti nel portale di commessa digitale.</p>
                  <p className="font-bold text-slate-800">2. Finalità del Trattamento</p>
                  <p>I dati raccolti (nome, cognome, codice fiscale, email, numero di telefono, dettagli immobile) sono trattati esclusivamente per l'esecuzione del contratto di vendita, la gestione delle personalizzazioni di cantiere e la messaggistica ufficiale.</p>
                  <p className="font-bold text-slate-800">3. Diritti dell'Interessato</p>
                  <p>In ogni momento l'utente può richiedere l'accesso, la rettifica o la cancellazione dei dati personali ai sensi degli artt. 15-22 del GDPR.</p>
                </>
              )}

              {viewingDoc === "cookie" && (
                <>
                  <p className="font-bold text-slate-800">1. Tipologia di Cookie Utilizzati</p>
                  <p>La piattaforma COEBO utilizza unicamente cookie tecnici e di sessione strettamente necessari al funzionamento del portale (es. mantenimento della sessione di login, salvataggio preferenze di cantiere).</p>
                  <p className="font-bold text-slate-800">2. Cookie di Terze Parti</p>
                  <p>Non vengono impiegati cookie di profilazione o tracciamento pubblicitario di terze parti.</p>
                </>
              )}

              {viewingDoc === "terms" && (
                <>
                  <p className="font-bold text-slate-800">1. Oggetto del Servizio</p>
                  <p>Il portale COEBO consente agli acquirenti di monitorare lo stato di avanzamento del cantiere, consultare la documentazione ufficiale ed inviare richieste di variante extra-capitolato.</p>
                  <p className="font-bold text-slate-800">2. Valore Legale delle Richieste</p>
                  <p>Le richieste di variazione e la relativa approvazione dei preventivi effettuate all'interno del portale hanno valore contrattuale vincolante tra acquirente e impresa costruttrice.</p>
                  <p className="font-bold text-slate-800">3. Responsabilità del Cliente</p>
                  <p>L'acquirente è tenuto alla custodia riservata delle proprie credenziali di accesso al portale.</p>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  if (viewingDoc === "privacy") setPrivacyAccepted(true);
                  if (viewingDoc === "cookie") setCookieAccepted(true);
                  if (viewingDoc === "terms") setTermsAccepted(true);
                  setViewingDoc(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Accetta & Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
