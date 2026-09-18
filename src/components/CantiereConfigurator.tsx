import React, { useState } from "react";
import { CantiereConfig, ScaleConfig, UnitConfig, RoomSurface, ElevatorPosition } from "../types";
import {
  Building2,
  Layers,
  Plus,
  Trash2,
  RefreshCw,
  Hash,
  MapPin,
  Save,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  Sliders
} from "lucide-react";

interface CantiereConfiguratorProps {
  config: CantiereConfig;
  onSaveConfig: (newConfig: CantiereConfig) => void;
  onClose?: () => void;
  readOnly?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export default function CantiereConfigurator({
  config,
  onSaveConfig,
  onClose,
  readOnly = false,
  collapsible = true,
  defaultExpanded = true,
  className = ""
}: CantiereConfiguratorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [areaCode, setAreaCode] = useState(config.areaCode || "Area 1");
  const [projectAppalto, setProjectAppalto] = useState(config.projectAppalto || "Residenza San Pasquale");
  const [location, setLocation] = useState(config.location || "Bari");
  const [name, setName] = useState(config.name || "Area 1 – Residenza San Pasquale Bari");
  const [useSiteCodeFormat, setUseSiteCodeFormat] = useState(config.useSiteCodeFormat ?? true);

  const [scales, setScales] = useState<ScaleConfig[]>(config.scales || []);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const getPositionCode = (idx: number): { pos: ElevatorPosition; label: string } => {
    if (idx === 1) return { pos: "dx", label: "dx" };
    if (idx === 2) return { pos: "sx", label: "sx" };
    if (idx === 3) return { pos: "ct", label: "ct" };
    if (idx === 4) return { pos: "dx", label: "dx" };
    if (idx === 5) return { pos: "sx", label: "sx" };
    return { pos: "ct", label: "ct" };
  };

  const generateUnitsFromScales = (currentScales: ScaleConfig[], _siteCodeFormat: boolean): UnitConfig[] => {
    const existingUnitsMap = new Map((config.units || []).map((u) => [u.id, u]));
    const newUnits: UnitConfig[] = [];

    currentScales.forEach((scale) => {
      // Determine floors list
      const floors: number[] = [];
      if (scale.includeInterrato) {
        floors.push(-1);
      }
      for (let f = 1; f <= scale.totalFloors; f++) {
        floors.push(f);
      }

      floors.forEach((floor) => {
        const unitsOnThisFloor = scale.unitsPerFloorByFloor?.[floor] ?? scale.unitsPerFloor;
        const posCounts: Record<string, number> = {};

        for (let unitIdx = 1; unitIdx <= unitsOnThisFloor; unitIdx++) {
          const { pos, label } = getPositionCode(unitIdx);
          posCounts[label] = (posCounts[label] || 0) + 1;
          const posSuffix = posCounts[label] > 1 ? `-${posCounts[label]}` : "";
          
          // Formato identificativo standard: [Scala] [Piano] [Posizione] (es. A 1 dx, A -1 dx)
          const code = `${scale.letter} ${floor} ${label}${posSuffix}`;
          const id = `apt-${scale.letter}-${floor}-${unitIdx}`;
          const existing = existingUnitsMap.get(id);

          const defaultCategory = floor === -1 
            ? (unitIdx === 1 ? "Box Auto" : "Cantinola") 
            : "Appartamento";

          newUnits.push({
            id: id,
            code: code,
            scaleLetter: scale.letter,
            floorNumber: floor,
            numberOnFloor: unitIdx,
            positionOnFloor: pos,
            unitCategory: existing?.unitCategory || defaultCategory,
            clientName: existing?.clientName,
            associatedClients: existing?.associatedClients,
            totalMq: existing?.totalMq || (floor === -1 ? (unitIdx === 1 ? 22 : 12) : 90),
            balconyMq: existing?.balconyMq || (floor === -1 ? 0 : 15),
            typology: existing?.typology || (floor === -1 ? "Pertinenza" : "Trilocale"),
            address: existing?.address || `Via Roberto Da Bari 62 (${floor === -1 ? "Interrato" : "Piano " + floor}), Bari`,
            basePrice: existing?.basePrice || (floor === -1 ? 20000 : 200000),
          });
        }
      });
    });
    return newUnits;
  };

  const handleApplyPatternName = () => {
    const composed = `${areaCode.trim()} – ${projectAppalto.trim()} ${location.trim()}`.trim();
    setName(composed);
  };

  const handleAddScale = () => {
    const nextLetterCode = 65 + scales.length;
    const letter = String.fromCharCode(nextLetterCode);
    const newScale: ScaleConfig = {
      id: `scale-${letter.toLowerCase()}-${Date.now()}`,
      letter,
      totalFloors: 3,
      unitsPerFloor: 4
    };
    setScales([...scales, newScale]);
  };

  const handleRemoveScale = (scaleId: string) => {
    setScales(scales.filter((s) => s.id !== scaleId));
  };

  const handleUpdateScale = (scaleId: string, updates: Partial<ScaleConfig>) => {
    setScales(scales.map((s) => (s.id === scaleId ? { ...s, ...updates } : s)));
  };

  const handleApplyCodiceCantiere = (useCodeFormat: boolean) => {
    setUseSiteCodeFormat(useCodeFormat);
  };

  const handleSaveAll = () => {
    const units = generateUnitsFromScales(scales, useSiteCodeFormat);
    const updatedConfig: CantiereConfig = {
      ...config,
      areaCode,
      projectAppalto,
      location,
      name,
      useSiteCodeFormat,
      scales,
      units,
      surfaces: config.surfaces || []
    };
    onSaveConfig(updatedConfig);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4500);
    if (onClose) onClose();
  };

  return (
    <div className={`bg-[#111827] rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden w-full animate-fade-in text-slate-100 font-sans brutalist-shadow-amber ${className}`}>
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 p-3.5 px-5 font-mono-tech font-black text-xs shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Struttura Cantiere salvata con successo! Scale, piani e codice interni aggiornati.</span>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-white hover:text-emerald-200 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0D121D] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black tracking-tight text-white">Struttura Dinamica del Cantiere [BIM]</h2>
            <p className="text-xs font-mono-tech text-slate-400 mt-0.5">
              Configurazione nome cantiere, scale, piani e codice interni delle unità abitative
            </p>
          </div>
        </div>
        {collapsible ? (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              id="btn-nascondi-struttura-cantiere"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono-tech font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-amber-300 shadow-md"
              title={isExpanded ? "Nascondi Struttura" : "Mostra Struttura"}
            >
              <Sliders className="w-4 h-4" />
              <span>{isExpanded ? "Nascondi Struttura" : "Mostra Struttura"}</span>
            </button>
          </div>
        ) : onClose ? (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {readOnly ? "Chiudi" : "Annulla"}
            </button>
          </div>
        ) : null}
      </div>

      {isExpanded && (
        <>
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-[#0B0F17]">
        {/* Sezione 1: Nomenclatura del Cantiere */}
        <div className="bg-[#111827] rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono-tech font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Nomenclatura & Codifica Cantiere</span>
            </h3>
            <span className="text-[10px] font-mono-tech font-extrabold bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-500/30 uppercase">
              {readOnly ? "Modalità Consultazione" : "Modificabile Manualmente"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono-tech font-bold text-slate-300 uppercase">Area d'intervento</label>
              <input
                type="text"
                value={areaCode}
                disabled={readOnly}
                onChange={(e) => setAreaCode(e.target.value)}
                placeholder="es. Area 1"
                className="w-full mt-1 px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono-tech font-bold text-slate-300 uppercase">Progetto / Appalto</label>
              <input
                type="text"
                value={projectAppalto}
                disabled={readOnly}
                onChange={(e) => setProjectAppalto(e.target.value)}
                placeholder="es. Residenza San Pasquale"
                className="w-full mt-1 px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono-tech font-bold text-slate-300 uppercase">Luogo</label>
              <input
                type="text"
                value={location}
                disabled={readOnly}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="es. Bari"
                className="w-full mt-1 px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs font-mono-tech font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-80"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            {!readOnly && (
              <button
                type="button"
                onClick={handleApplyPatternName}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Genera Pattern: Area [X] – [Progetto] [Luogo]</span>
              </button>
            )}
            <div className="flex-1">
              <label className="text-[10px] font-mono-tech font-extrabold text-slate-300 uppercase block">
                Denominazione Cantiere
              </label>
              <input
                type="text"
                value={name}
                disabled={readOnly}
                onChange={(e) => setName(e.target.value)}
                placeholder="Area 1 – Residenza San Pasquale Bari"
                className="w-full mt-1 px-3 py-2 bg-[#0B0F17] border border-amber-500/40 rounded-lg text-sm font-mono-tech font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Sezione 2: Configurazione tramite Pulsanti Dinamici */}
        <div className="bg-[#111827] rounded-xl p-5 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div>
              <h3 className="text-xs font-mono-tech font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Struttura Immobile (Scale, Piani & Interni)</span>
              </h3>
              <p className="text-[11px] font-mono-tech text-slate-400 mt-0.5">
                {readOnly ? "Ripartizione delle scale, piani ed interni dell'edificio" : "Pulsanti dinamici per definire le scale ed i piani dell'edificio"}
              </p>
            </div>

            {/* Pulsante dedicato: Applicazione Codice Cantiere */}
            <div className="flex items-center gap-2 bg-[#0D121D] p-1 rounded-xl border border-slate-800 shadow-sm">
              <span className="text-[10px] font-mono-tech font-extrabold text-slate-300 uppercase px-2 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                Codice Cantiere:
              </span>
              {!readOnly ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyCodiceCantiere(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-extrabold transition-all cursor-pointer ${
                      useSiteCodeFormat
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Formato A01, A02...
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCodiceCantiere(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-extrabold transition-all cursor-pointer ${
                      !useSiteCodeFormat
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Formato A1, A2...
                  </button>
                </>
              ) : (
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-mono-tech font-black text-xs rounded-lg">
                  {useSiteCodeFormat ? "Formato A01, A02..." : "Formato A1, A2..."}
                </span>
              )}
            </div>
          </div>

          {/* Scale e Piani List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tech font-bold text-slate-200">
                Scale Configurate ({scales.length})
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddScale}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono-tech font-black rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Scala</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scales.map((scale) => (
                <div
                  key={scale.id}
                  className="bg-[#0D121D] p-4 rounded-xl border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono-tech border border-amber-400">
                        {scale.letter}
                      </span>
                      <span className="text-xs font-mono-tech font-bold text-white">
                        Scala {scale.letter}
                      </span>
                    </div>
                    {!readOnly && scales.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScale(scale.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded transition-colors cursor-pointer"
                        title="Elimina Scala"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Piani Totali
                      </label>
                      <div className="flex items-center gap-2">
                        {!readOnly ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateScale(scale.id, {
                                  totalFloors: Math.max(1, scale.totalFloors - 1)
                                })
                              }
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 font-black rounded text-white flex items-center justify-center cursor-pointer border border-slate-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={scale.totalFloors}
                              onChange={(e) =>
                                handleUpdateScale(scale.id, {
                                  totalFloors: e.target.value === "" ? 1 : Math.max(1, Number(e.target.value))
                                })
                              }
                              className="font-mono-tech font-black text-amber-400 w-12 text-center text-sm bg-slate-900 border border-slate-700 rounded py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateScale(scale.id, {
                                  totalFloors: scale.totalFloors + 1
                                })
                              }
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 font-black rounded text-white flex items-center justify-center cursor-pointer border border-slate-700"
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <span className="font-mono-tech font-black text-amber-400 text-sm">
                            {scale.totalFloors} {scale.totalFloors === 1 ? "Piano" : "Piani"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Interni Standard / Piano
                      </label>
                      <div className="flex items-center gap-2">
                        {!readOnly ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateScale(scale.id, {
                                  unitsPerFloor: Math.max(1, scale.unitsPerFloor - 1)
                                })
                              }
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 font-black rounded text-white flex items-center justify-center cursor-pointer border border-slate-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={scale.unitsPerFloor}
                              onChange={(e) =>
                                handleUpdateScale(scale.id, {
                                  unitsPerFloor: e.target.value === "" ? 1 : Math.max(1, Number(e.target.value))
                                })
                              }
                              className="font-mono-tech font-black text-amber-400 w-12 text-center text-sm bg-slate-900 border border-slate-700 rounded py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateScale(scale.id, {
                                  unitsPerFloor: scale.unitsPerFloor + 1
                                })
                              }
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 font-black rounded text-white flex items-center justify-center cursor-pointer border border-slate-700"
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <span className="font-mono-tech font-black text-amber-400 text-sm">
                            {scale.unitsPerFloor} unità/piano
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option for Piano Interrato (-1) */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <label className={`inline-flex items-center gap-2 text-xs font-mono-tech text-amber-300 font-bold ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={!!scale.includeInterrato}
                        onChange={(e) =>
                          handleUpdateScale(scale.id, {
                            includeInterrato: e.target.checked
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-4 h-4 disabled:opacity-75"
                      />
                      <span>Includi Piano Interrato (-1) [Box Auto & Cantinole]</span>
                    </label>
                  </div>

                  {/* Customization per floor */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-mono-tech font-bold text-slate-400 uppercase block">
                      Ripartizione Interni Piano per Piano:
                    </span>
                    <div className="grid grid-cols-1 gap-2 text-[11px] font-mono-tech max-h-52 overflow-y-auto pr-1">
                      {scale.includeInterrato && (
                        <div className="flex items-center justify-between p-2 px-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold">Piano -1 (Interrato):</span>
                          {!readOnly ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = scale.unitsPerFloorByFloor?.["-1"] ?? 2;
                                  const updated = { ...(scale.unitsPerFloorByFloor || {}), "-1": Math.max(1, cur - 1) };
                                  handleUpdateScale(scale.id, { unitsPerFloorByFloor: updated });
                                }}
                                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors cursor-pointer border border-slate-700"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={scale.unitsPerFloorByFloor?.["-1"] ?? 2}
                                onChange={(e) => {
                                  const v = e.target.value === "" ? 1 : Math.max(1, Number(e.target.value));
                                  const updated = { ...(scale.unitsPerFloorByFloor || {}), "-1": v };
                                  handleUpdateScale(scale.id, { unitsPerFloorByFloor: updated });
                                }}
                                className="w-10 text-center font-bold text-white bg-slate-800 border border-slate-700 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = scale.unitsPerFloorByFloor?.["-1"] ?? 2;
                                  const updated = { ...(scale.unitsPerFloorByFloor || {}), "-1": cur + 1 };
                                  handleUpdateScale(scale.id, { unitsPerFloorByFloor: updated });
                                }}
                                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors cursor-pointer border border-slate-700"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="text-white font-bold">{scale.unitsPerFloorByFloor?.["-1"] ?? 2} unità</span>
                          )}
                        </div>
                      )}
                      {Array.from({ length: scale.totalFloors }).map((_, fIdx) => {
                        const floorNum = fIdx + 1;
                        const floorUnits = scale.unitsPerFloorByFloor?.[floorNum] ?? scale.unitsPerFloor;
                        return (
                          <div key={floorNum} className="flex items-center justify-between p-2 px-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-300 font-bold">Piano {floorNum}:</span>
                            {!readOnly ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...(scale.unitsPerFloorByFloor || {}), [floorNum]: Math.max(1, floorUnits - 1) };
                                    handleUpdateScale(scale.id, { unitsPerFloorByFloor: updated });
                                  }}
                                  className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors cursor-pointer border border-slate-700"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={floorUnits}
                                  onChange={(e) => {
                                    const v = e.target.value === "" ? 1 : Math.max(1, Number(e.target.value));
                                    const updated = { ...(scale.unitsPerFloorByFloor || {}), [floorNum]: v };
                                    handleUpdateScale(scale.id, { unitsPerFloorByFloor: updated });
                                  }}
                                  className="w-10 text-center font-bold text-white bg-slate-800 border border-slate-700 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...(scale.unitsPerFloorByFloor || {}), [floorNum]: floorUnits + 1 };
                                    handleUpdateScale(scale.id, { unitsPerFloorByFloor: updated });
                                  }}
                                  className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors cursor-pointer border border-slate-700"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="text-white font-bold">{floorUnits} unità</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] font-mono-tech text-slate-300 border-t border-slate-800">
                    Totale Interni Scala {scale.letter}:{" "}
                    <span className="font-extrabold text-amber-400">
                      {(generateUnitsFromScales([scale], false)).length} unità
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-[#0D121D] p-4 border-t border-slate-800 flex items-center justify-end gap-3 font-mono-tech">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {readOnly ? "Chiudi" : "Annulla"}
          </button>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Salva Struttura Cantiere</span>
          </button>
        )}
      </div>
    </>
  )}
</div>
  );
}
