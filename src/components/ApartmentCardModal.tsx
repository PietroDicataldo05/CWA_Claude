import React, { useState } from "react";
import { UnitConfig, UserRole, UnitTypology, CantiereConfig } from "../types";
import { showToast } from "../lib/toast";
import {
  Building,
  Layers,
  Home,
  User,
  Maximize2,
  MapPin,
  Euro,
  X,
  Edit3,
  Check,
  Building2,
  ShieldCheck,
  ArrowRight,
  FileText,
  Plus,
  UserPlus
} from "lucide-react";

interface ApartmentCardModalProps {
  unit: UnitConfig;
  cantiereConfig: CantiereConfig;
  userRole: UserRole;
  onClose: () => void;
  onSaveUnit?: (updatedUnit: UnitConfig) => void;
  onSelectAndNavigate?: (unitId: string) => void;
}

export default function ApartmentCardModal({
  unit,
  cantiereConfig,
  userRole,
  onClose,
  onSaveUnit,
  onSelectAndNavigate,
}: ApartmentCardModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Editable form state
  const [clientsList, setClientsList] = useState<string[]>(() => {
    if (unit.associatedClients && unit.associatedClients.length > 0) {
      return unit.associatedClients;
    }
    return unit.clientName ? [unit.clientName] : ["Elena Rossi"];
  });
  const [newClientInput, setNewClientInput] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const [totalMq, setTotalMq] = useState(unit.totalMq || 134);
  const [balconyMq, setBalconyMq] = useState(unit.balconyMq || 25);
  const [typology, setTypology] = useState<UnitTypology>(
    unit.typology || "Plurilocale"
  );
  const [address, setAddress] = useState(
    unit.address || `${cantiereConfig.location} — Via Roberto Da Bari 62`
  );
  const [basePrice, setBasePrice] = useState(unit.basePrice || 245000);

  const floorLabel =
    unit.floorNumber === 1
      ? "Primo Piano"
      : unit.floorNumber === 2
      ? "Secondo Piano"
      : unit.floorNumber === 3
      ? "Terzo Piano"
      : `${unit.floorNumber}° Piano`;

  const handleAddClient = () => {
    if (newClientInput.trim()) {
      const updated = [...clientsList, newClientInput.trim()];
      setClientsList(updated);
      setNewClientInput("");
      setShowAddInput(false);
      if (onSaveUnit) {
        onSaveUnit({
          ...unit,
          clientName: updated.join(" & "),
          associatedClients: updated,
          totalMq,
          balconyMq,
          typology,
          address,
          basePrice,
        });
      }
    }
  };

  const handleRemoveClient = (indexToRemove: number) => {
    if (clientsList.length <= 1) {
      showToast("L'immobile deve avere almeno un cliente o intestatario associato.", "error");
      return;
    }
    const updated = clientsList.filter((_, idx) => idx !== indexToRemove);
    setClientsList(updated);
    if (onSaveUnit) {
      onSaveUnit({
        ...unit,
        clientName: updated.join(" & "),
        associatedClients: updated,
        totalMq,
        balconyMq,
        typology,
        address,
        basePrice,
      });
    }
  };

  const handleSave = () => {
    if (onSaveUnit) {
      onSaveUnit({
        ...unit,
        clientName: clientsList.join(" & "),
        associatedClients: clientsList,
        totalMq,
        balconyMq,
        typology,
        address,
        basePrice,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-[#111827] w-full max-w-2xl rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[90vh] text-slate-100 brutalist-shadow-amber">
        {/* Header */}
        <div className="bg-[#0D121D] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md font-display border border-amber-400">
              {unit.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-black tracking-tight text-white">
                  Scheda Appartamento — Interno {unit.code}
                </h3>
                <span className="text-[10px] font-mono-tech font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {typology}
                </span>
              </div>
              <p className="text-xs font-mono-tech text-slate-400 mt-0.5">
                {cantiereConfig.name} • Scala {unit.scaleLetter} • {floorLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0B0F17]">
          {/* Top Banner for Cliente or Admin */}
          <div className="bg-[#111827] border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-mono-tech font-bold text-amber-400">
                  Specifiche Tecniche & Valori Contrattuali dell'Unità [BIM]
                </p>
                <p className="text-[11px] font-mono-tech text-slate-400 mt-0.5">
                  Scheda ufficiale cantiere registrata per l'assegnatario.
                </p>
              </div>
            </div>
            {(userRole === "IMPRESA" || userRole === "TECNICO") && (
              <button
                onClick={() => {
                  if (isEditing) handleSave();
                  else setIsEditing(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border ${
                  isEditing
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 font-black"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 font-black"
                }`}
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salva Scheda</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifica Dati</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scala & Piano */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 bg-slate-900 text-sky-400 rounded-lg border border-slate-800">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                  Ubicazione Edificio
                </span>
                <span className="block text-sm font-mono-tech font-black text-white mt-0.5">
                  Scala {unit.scaleLetter} — {floorLabel}
                </span>
                <span className="block text-[11px] font-mono-tech text-slate-400">
                  Piano N° {unit.floorNumber}
                </span>
              </div>
            </div>

            {/* Interno */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 bg-slate-900 text-amber-400 rounded-lg border border-slate-800">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                  Codice & Interno
                </span>
                <span className="block text-sm font-mono-tech font-black text-white mt-0.5">
                  Interno {unit.code}
                </span>
                <span className="block text-[11px] font-mono-tech text-slate-400">
                  Unità Posizione N° {unit.numberOnFloor} del Piano
                </span>
              </div>
            </div>

            {/* Cliente Associato e Co-intestatari */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg shrink-0 border border-slate-800">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                    Clienti / Intestatari Associati {clientsList.length > 1 && `(${clientsList.length} Co-intestatari)`}
                  </span>
                  {(userRole === "IMPRESA" || userRole === "TECNICO") && (
                    <button
                      type="button"
                      onClick={() => setShowAddInput(!showAddInput)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-md text-[10px] font-mono-tech font-black cursor-pointer shadow-sm transition-colors border border-emerald-300"
                      title="Aggiungi cliente co-intestatario"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Aggiungi Cliente</span>
                    </button>
                  )}
                </div>

                {showAddInput && (
                  <div className="flex items-center gap-2 pt-1 pb-2">
                    <input
                      type="text"
                      value={newClientInput}
                      onChange={(e) => setNewClientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddClient();
                        }
                      }}
                      placeholder="Nome e Cognome co-intestatario..."
                      className="flex-1 px-2.5 py-1 text-xs font-mono-tech font-bold border border-emerald-500 rounded-lg bg-[#0B0F17] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddClient}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-mono-tech font-black rounded-lg hover:bg-emerald-400 cursor-pointer border border-emerald-300"
                    >
                      Aggiungi
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {clientsList.map((client, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-[#0B0F17] border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono-tech font-black text-amber-300 shadow-sm"
                    >
                      <UserPlus className="w-3 h-3 text-emerald-400" />
                      <span>{client}</span>
                      {clientsList.length > 1 && (userRole === "IMPRESA" || userRole === "TECNICO") && (
                        <button
                          type="button"
                          onClick={() => handleRemoveClient(idx)}
                          className="ml-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Rimuovi co-intestatario"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tipologia di Locale */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 bg-slate-900 text-sky-400 rounded-lg border border-slate-800">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                  Tipologia di Locale
                </span>
                {isEditing ? (
                  <select
                    value={typology}
                    onChange={(e) =>
                      setTypology(e.target.value as UnitTypology)
                    }
                    className="w-full mt-1 px-2 py-1 text-xs font-mono-tech font-bold border border-slate-700 rounded-md bg-[#0B0F17] text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Monolocale" className="bg-slate-900 text-white">Monolocale</option>
                    <option value="Bilocale" className="bg-slate-900 text-white">Bilocale</option>
                    <option value="Trilocale" className="bg-slate-900 text-white">Trilocale</option>
                    <option value="Quadrilocale" className="bg-slate-900 text-white">Quadrilocale</option>
                    <option value="Plurilocale" className="bg-slate-900 text-white">Plurilocale</option>
                  </select>
                ) : (
                  <span className="block text-sm font-mono-tech font-black text-white mt-0.5">
                    {typology}
                  </span>
                )}
              </div>
            </div>

            {/* mq totali */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 bg-slate-900 text-amber-400 rounded-lg border border-slate-800">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                  Superficie Totale (mq)
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={totalMq}
                    onChange={(e) => setTotalMq(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1 text-xs font-mono-tech font-bold border border-slate-700 rounded-md bg-[#0B0F17] text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                ) : (
                  <span className="block text-sm font-mono-tech font-black text-white mt-0.5">
                    {totalMq} mq
                  </span>
                )}
              </div>
            </div>

            {/* mq dei balconi */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 bg-slate-900 text-amber-400 rounded-lg border border-slate-800">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                  Superficie Balconi / Terrazzi
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={balconyMq}
                    onChange={(e) => setBalconyMq(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1 text-xs font-mono-tech font-bold border border-slate-700 rounded-md bg-[#0B0F17] text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                ) : (
                  <span className="block text-sm font-mono-tech font-black text-white mt-0.5">
                    {balconyMq} mq
                  </span>
                )}
              </div>
            </div>

            {/* Via principale */}
            <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 flex items-start gap-3 md:col-span-2">
              <div className="p-2.5 bg-slate-900 text-rose-400 rounded-lg shrink-0 border border-slate-800">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400">
                  Via Principale & Indirizzo Immobile
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1 text-xs font-mono-tech font-bold border border-slate-700 rounded-md bg-[#0B0F17] text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                ) : (
                  <span className="block text-sm font-mono-tech font-black text-white mt-0.5">
                    {address}
                  </span>
                )}
              </div>
            </div>

            {/* Costo base dell'immobile */}
            <div className="bg-[#0D121D] text-white rounded-xl p-4 border border-amber-500/40 flex items-start gap-3 md:col-span-2">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-lg shrink-0 font-black border border-amber-300">
                <Euro className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-mono-tech font-bold uppercase tracking-wider text-amber-400">
                  Costo Base dell'Immobile (da Capitolato)
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1 text-xs font-mono-tech font-bold border border-slate-700 rounded-md bg-[#0B0F17] text-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                ) : (
                  <span className="block text-lg font-mono-tech font-black text-white mt-0.5">
                    € {basePrice.toLocaleString("it-IT")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#0D121D] border-t border-slate-800 flex items-center justify-between gap-3 font-mono-tech">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Chiudi
          </button>

          {onSelectAndNavigate && (
            <button
              onClick={() => onSelectAndNavigate(unit.id)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2 border border-amber-300"
            >
              <span>Accedi alla Dashboard per quest'Unità</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
