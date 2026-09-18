import React, { useState } from "react";
import { UnitConfig, CantiereConfig, UnitTypology, ElevatorPosition } from "../types";
import {
  X,
  Save,
  CheckCircle2,
  Building,
  User,
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Search,
  MapPin,
  Filter,
  Check
} from "lucide-react";

interface QuickUnitsBatchEditorModalProps {
  config: CantiereConfig;
  onSaveUnits: (updatedUnits: UnitConfig[]) => void;
  onClose: () => void;
}

const TYPOLOGIES: UnitTypology[] = ["Monolocale", "Bilocale", "Trilocale", "Quadrilocale", "Plurilocale"];
const CATEGORIES = ["Appartamento", "Box Auto", "Cantinola"] as const;

export default function QuickUnitsBatchEditorModal({
  config,
  onSaveUnits,
  onClose,
}: QuickUnitsBatchEditorModalProps) {
  const [units, setUnits] = useState<UnitConfig[]>(() => {
    return JSON.parse(JSON.stringify(config.units || []));
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScale, setSelectedScale] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [bulkAddress] = useState(config.location ? `Via Roberto Da Bari 62, ${config.location}` : "Via Roberto Da Bari 62, Bari");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUnitChange = (index: number, field: keyof UnitConfig, value: any) => {
    const updated = [...units];
    const target = { ...updated[index], [field]: value };

    // Auto update code format if scale, floor, or position changed
    if (field === "scaleLetter" || field === "floorNumber" || field === "positionOnFloor") {
      const pos = target.positionOnFloor || "dx";
      target.code = `${target.scaleLetter || "A"} ${target.floorNumber} ${pos}`;
    }

    updated[index] = target;
    setUnits(updated);
  };

  const handleRemoveUnit = (id: string) => {
    setUnits(units.filter((u) => u.id !== id));
    showToast("Unità rimossa dalla tabella");
  };

  const handleAddUnit = () => {
    const newId = `apt-custom-${Date.now()}`;
    const nextNum = units.length + 1;
    const pos: ElevatorPosition = (nextNum % 3 === 1 ? "dx" : nextNum % 3 === 2 ? "sx" : "ct");
    const newUnit: UnitConfig = {
      id: newId,
      code: `A 1 ${pos}`,
      scaleLetter: "A",
      floorNumber: 1,
      numberOnFloor: nextNum,
      positionOnFloor: pos,
      unitCategory: "Appartamento",
      typology: "Trilocale",
      totalMq: 90,
      balconyMq: 15,
      clientName: "",
      address: bulkAddress,
      basePrice: 200000,
    };
    setUnits([...units, newUnit]);
    showToast("✨ Nuova unità aggiunta in fondo alla tabella!");
  };

  const handleQuickSave = () => {
    onSaveUnits(units);
    showToast("✅ Modifiche salvate con successo! Gli interni sono stati aggiornati.");
  };

  const handleSaveAndClose = () => {
    onSaveUnits(units);
    onClose();
  };

  // Filtered units
  const filteredUnits = units.filter((u) => {
    const matchScale = selectedScale === "all" || u.scaleLetter === selectedScale;
    const matchCat = selectedCategory === "all" || u.unitCategory === selectedCategory;
    const matchQuery =
      searchTerm === "" ||
      (u.code && u.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.clientName && u.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.address && u.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchScale && matchCat && matchQuery;
  });

  // Unique scales
  const scalesList = Array.from(new Set(units.map((u) => u.scaleLetter))).sort();

  // Metrics
  const assignedCount = units.filter((u) => u.clientName && u.clientName.trim() !== "").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-[#111827] rounded-2xl border border-amber-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] brutalist-shadow-amber">
        
        {/* Header */}
        <div className="bg-[#0D121D] text-white p-4 sm:p-5 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono-tech font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md border border-amber-400">
                  TABELLARE IMPRESA
                </span>
                <span className="text-xs font-mono-tech text-slate-400">
                  {units.length} Interni Totali • {assignedCount} Assegnati
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-black tracking-tight text-white mt-0.5">
                Modifica Veloce Tabellare Interni ({config.name})
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 px-6 py-2.5 text-xs font-mono-tech font-black flex items-center justify-between gap-2 shrink-0 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Toolbar & Filters */}
        <div className="bg-slate-900 border-b border-slate-800 p-3.5 px-6 space-y-3 shrink-0 font-mono-tech">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca interno o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0B0F17] text-xs border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-500"
                />
              </div>

              {/* Scale Filter */}
              <select
                value={selectedScale}
                onChange={(e) => setSelectedScale(e.target.value)}
                className="px-3 py-1.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all" className="bg-slate-900 text-white">Tutte le Scale ({units.length})</option>
                {scalesList.map((sc) => (
                  <option key={sc} value={sc} className="bg-slate-900 text-white">Scala {sc}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all" className="bg-slate-900 text-white">Tutte le Categorie</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                ))}
              </select>
            </div>

            {/* Bulk Actions Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleAddUnit}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl border border-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>+ Nuovo Interno</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0F17]">
          <div className="border border-slate-800 rounded-xl overflow-x-auto shadow-xl bg-[#111827]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-900 text-amber-400 text-[11px] uppercase font-mono-tech font-black tracking-wider border-b border-slate-800">
                  <th className="py-3 px-3.5 border-r border-slate-800 w-[130px]">Codice Interno</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[110px]">Scala / Piano</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[110px]" title="Posizione rispetto all'ascensore: Dx (destra), Sx (sinistra), Ct (centrale)">Pos. Ascensore</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[130px]">Categoria</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[125px]">Tipologia</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[125px]">Mq stanze Interne</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[125px]" title="Superficie stanze esterne (Balconi / Terrazzi)">Mq stanze Esterne</th>
                  <th className="py-3 px-3 border-r border-slate-800 min-w-[180px]">Cliente Assegnato</th>
                  <th className="py-3 px-3 border-r border-slate-800 min-w-[170px]">Indirizzo / Ubicazione</th>
                  <th className="py-3 px-3 border-r border-slate-800 w-[120px]">Prezzo (€)</th>
                  <th className="py-3 px-2 text-center w-[50px]">Rimuovi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs font-mono-tech">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500 font-mono-tech">
                      Nessun interno trovato con i filtri selezionati.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => {
                    const originalIdx = units.findIndex((u) => u.id === unit.id);
                    return (
                      <tr key={unit.id} className="hover:bg-slate-800/60 transition-colors">
                        {/* Codice Interno */}
                        <td className="py-2 px-3 border-r border-slate-800 bg-slate-900/50">
                          <input
                            type="text"
                            value={unit.code || ""}
                            onChange={(e) => handleUnitChange(originalIdx, "code", e.target.value)}
                            className="w-full px-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="es. A 1 dx"
                          />
                        </td>

                        {/* Scala / Piano */}
                        <td className="py-2 px-2.5 border-r border-slate-800 text-slate-300 font-bold">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">Sc.</span>
                            <input
                              type="text"
                              value={unit.scaleLetter || "A"}
                              onChange={(e) => handleUnitChange(originalIdx, "scaleLetter", e.target.value.toUpperCase())}
                              className="w-8 px-1 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-center text-white"
                            />
                            <span className="text-[10px] text-slate-500">P.</span>
                            <input
                              type="number"
                              value={unit.floorNumber}
                              onChange={(e) => handleUnitChange(originalIdx, "floorNumber", Number(e.target.value))}
                              className="w-10 px-1 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-center text-white"
                            />
                          </div>
                        </td>

                        {/* Pos. Ascensore (dx, sx, ct) */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <select
                            value={unit.positionOnFloor || "dx"}
                            onChange={(e) => handleUnitChange(originalIdx, "positionOnFloor", e.target.value as ElevatorPosition)}
                            className="w-full px-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="dx" className="bg-slate-900 text-white">dx (Destra)</option>
                            <option value="sx" className="bg-slate-900 text-white">sx (Sinistra)</option>
                            <option value="ct" className="bg-slate-900 text-white">ct (Centrale)</option>
                          </select>
                        </td>

                        {/* Categoria */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <select
                            value={unit.unitCategory || "Appartamento"}
                            onChange={(e) => handleUnitChange(originalIdx, "unitCategory", e.target.value)}
                            className="w-full px-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                            ))}
                          </select>
                        </td>

                        {/* Tipologia */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <select
                            value={unit.typology || "Trilocale"}
                            onChange={(e) => handleUnitChange(originalIdx, "typology", e.target.value as UnitTypology)}
                            className="w-full px-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {TYPOLOGIES.map((t) => (
                              <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                            ))}
                          </select>
                        </td>

                        {/* Mq Stanze */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <div className="relative">
                            <input
                              type="number"
                              value={unit.totalMq || ""}
                              onChange={(e) => handleUnitChange(originalIdx, "totalMq", e.target.value ? Number(e.target.value) : 0)}
                              placeholder="90"
                              className="w-full px-2 py-1 pr-6 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold pointer-events-none">mq</span>
                          </div>
                        </td>

                        {/* Mq Balconi */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <div className="relative">
                            <input
                              type="number"
                              value={unit.balconyMq || ""}
                              onChange={(e) => handleUnitChange(originalIdx, "balconyMq", e.target.value ? Number(e.target.value) : 0)}
                              placeholder="15"
                              className="w-full px-2 py-1 pr-6 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold pointer-events-none">mq</span>
                          </div>
                        </td>

                        {/* Cliente Assegnato */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <div className="relative">
                            <User className="w-3 h-3 text-amber-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={unit.clientName || ""}
                              onChange={(e) => handleUnitChange(originalIdx, "clientName", e.target.value)}
                              placeholder="Nome Cliente..."
                              className="w-full pl-6 pr-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-600"
                            />
                          </div>
                        </td>

                        {/* Indirizzo / Ubicazione */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <div className="relative">
                            <MapPin className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={unit.address || ""}
                              onChange={(e) => handleUnitChange(originalIdx, "address", e.target.value)}
                              placeholder="Indirizzo cantiere..."
                              className="w-full pl-6 pr-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-600"
                            />
                          </div>
                        </td>

                        {/* Prezzo Base */}
                        <td className="py-2 px-2.5 border-r border-slate-800">
                          <input
                            type="number"
                            step="1000"
                            value={unit.basePrice || ""}
                            onChange={(e) => handleUnitChange(originalIdx, "basePrice", e.target.value ? Number(e.target.value) : 0)}
                            placeholder="200000"
                            className="w-full px-2 py-1 bg-[#0B0F17] border border-slate-700 rounded text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </td>

                        {/* Remove Row */}
                        <td className="py-2 px-1 text-center">
                          <button
                            onClick={() => handleRemoveUnit(unit.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title="Elimina questa riga"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0D121D] border-t border-slate-800 p-4 px-6 flex items-center justify-between shrink-0 font-mono-tech">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            Chiudi
          </button>

          <button
            onClick={handleSaveAndClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md border border-amber-300"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Salva</span>
          </button>
        </div>

      </div>
    </div>
  );
}
