const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// The original section:
//             {/* Logo details */}
//             <div className="flex items-center space-x-3">
//               <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl border border-amber-500/20">
//                 <Construction className="w-5 h-5 text-amber-600" />
//               </div>
//               <div>
//                 <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-400">
//                   Piattaforma Cantiere Digitale
//                 </span>
//                 <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none mt-1">
//                   COEBO S.r.l. & PIRP Japigia
//                 </h2>
//               </div>
//             </div>

const original = `            {/* Logo details */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl border border-amber-500/20">
                <Construction className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-400">
                  Piattaforma Cantiere Digitale
                </span>
                <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none mt-1">
                  COEBO S.r.l. & PIRP Japigia
                </h2>
              </div>
            </div>`;

const replacement = `            {/* Logo details */}
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo COEBO" className="h-12 w-auto" />
            </div>`;

if (content.includes(original)) {
    content = content.replace(original, replacement);
    fs.writeFileSync(path, content);
    console.log("Updated successfully");
} else {
    console.log("Could not find the original section");
}
