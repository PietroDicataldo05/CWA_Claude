import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { ToastItem, dismissToast, subscribeToast } from "../lib/toast";

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToast(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-fade-in font-mono-tech text-xs font-bold ${
            t.type === "success"
              ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/95 border-rose-500/40 text-rose-300"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="flex-1 leading-relaxed">{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-current opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
