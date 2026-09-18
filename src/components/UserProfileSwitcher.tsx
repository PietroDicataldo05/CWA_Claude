import React from "react";
import { UserRole, UserProfile } from "../types";
import { Shield, User, Hammer, Mail, Phone, Building } from "lucide-react";

interface UserProfileSwitcherProps {
  currentProfile: UserProfile;
  allProfiles: { [key: string]: UserProfile };
  onProfileChange: (role: UserRole) => void;
}

export default function UserProfileSwitcher({
  currentProfile,
  allProfiles,
  onProfileChange,
}: UserProfileSwitcherProps) {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800" id="user-profile-switcher">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand & Current Active Identity */}
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 text-slate-900 p-2 rounded-lg font-bold tracking-wider text-sm flex items-center gap-1">
            <Building className="w-4 h-4" />
            <span>COEBO</span>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Portale Commessa Residenziale</h1>
            <p className="text-xs text-slate-400">
              Cantiere: <span className="text-amber-400 font-medium">Residenza Japigia (Bari)</span> • Int. 4
            </p>
          </div>
        </div>

        {/* Center: Interactive Role Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Visualizza come:</span>
          {(Object.keys(allProfiles) as UserRole[]).map((role) => {
            const profile = allProfiles[role];
            const isActive = currentProfile.role === role;

            return (
              <button
                key={role}
                onClick={() => onProfileChange(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-amber-500 text-slate-900 shadow-md scale-102"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                id={`role-btn-${role.toLowerCase()}`}
              >
                {role === "IMPRESA" && <Shield className="w-3.5 h-3.5" />}
                {role === "CLIENTE" && <User className="w-3.5 h-3.5" />}
                {role === "TECNICO" && <Hammer className="w-3.5 h-3.5" />}
                <span>{role === "IMPRESA" ? "Impresa" : role === "CLIENTE" ? "Cliente" : "Tecnico"}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Profile Detailed Contact Info */}
        <div className="flex items-center space-x-3 border-t border-slate-800 pt-2 md:border-t-0 md:pt-0">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-amber-500/50 shrink-0">
            {currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
              <span>{currentProfile.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-slate-800 text-amber-400 border border-amber-500/20">
                {currentProfile.role === "IMPRESA" && "Costruttore / Admin"}
                {currentProfile.role === "CLIENTE" && "Acquirente"}
                {currentProfile.role === "TECNICO" && "Direttore Lavori"}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" /> {currentProfile.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" /> {currentProfile.phone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
