// Railway (and some other hosts) automatically redact any HTTP response bytes
// that match the exact value of a configured environment variable, as a
// leak-prevention safeguard. That's great for real secrets, but it also
// corrupts the Supabase "anon" key -- which is *meant* to be public and
// embedded in the client-side JS bundle -- turning it into bullet characters
// wherever it appears in served files.
//
// Workaround: store the anon key base64-encoded (VITE_SUPABASE_ANON_KEY_B64),
// a string the host never sees in its original form, then decode it here and
// write it to .env.production.local right before `vite build` runs. Vite
// picks that file up automatically, so the *decoded* key ends up in the
// bundle without ever having been a literal, redactable env var value on
// the host.
const fs = require("fs");

const b64 = process.env.VITE_SUPABASE_ANON_KEY_B64;

if (b64) {
  const decoded = Buffer.from(b64, "base64").toString("utf-8");
  fs.writeFileSync(".env.production.local", `VITE_SUPABASE_ANON_KEY=${decoded}\n`, "utf-8");
  console.log("prepare-env: wrote VITE_SUPABASE_ANON_KEY to .env.production.local");
} else {
  console.log("prepare-env: VITE_SUPABASE_ANON_KEY_B64 not set, skipping (relying on VITE_SUPABASE_ANON_KEY if present)");
}
