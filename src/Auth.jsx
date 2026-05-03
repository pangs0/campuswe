import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", username: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (error) throw error;
        await supabase.from("profiles").insert({ id: data.user.id, username: form.username, city: form.city, karma: 0, xp: 0 });
        onLogin(data.user);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 380, background: "var(--panel)", border: "1px solid var(--line-2)", padding: 36, position: "relative" }}>
        {/* Corner ticks */}
        {[{t:-2,l:-2},{t:-2,r:-2},{b:-2,l:-2},{b:-2,r:-2}].map((s,i) => (
          <span key={i} style={{ position:"absolute", width:7, height:7, background:"var(--accent)", top:s.t, left:s.l, right:s.r, bottom:s.b }} />
        ))}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="pixel" style={{ fontSize: 16, color: "var(--accent)", marginBottom: 6, animation: "bob 2s ease-in-out infinite" }}>
            CAMPUSWE
          </div>
          <div style={{ fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            girişimci evreni · beta
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line-2)", marginBottom: 24 }}>
          {[["login", "GİRİŞ"], ["register", "KAYIT"]].map(([k, v]) => (
            <button key={k} onClick={() => { setMode(k); setError(""); }} style={{
              flex: 1, padding: "10px", background: "transparent", border: "none",
              borderBottom: mode === k ? `2px solid var(--accent)` : "2px solid transparent",
              color: mode === k ? "var(--accent)" : "var(--fg-faint)",
              fontFamily: "var(--font-display)", fontSize: 8,
              letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.15s"
            }}>{v}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "register" && (
            <>
              <input className="cw-input" placeholder="Kullanıcı adı (örn: HAKAN.DEV)"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              <input className="cw-input" placeholder="Şehir (örn: Istanbul 🇹🇷)"
                value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </>
          )}
          <input className="cw-input" placeholder="E-posta" type="email"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="cw-input" placeholder="Şifre" type="password"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handle()} />

          {error && (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 7, color: "var(--red)", padding: "8px 12px", border: "1px solid var(--red)", background: "rgba(248,81,73,0.08)" }}>
              {error}
            </div>
          )}

          <button onClick={handle} disabled={loading} className="cw-btn cw-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : mode === "login" ? "▶ GİRİŞ YAP" : "▶ HESAP OLUŞTUR"}
          </button>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.08em" }}>
          ücretsiz başla · kart yok · günde ~2 dk
        </div>
      </div>
    </div>
  );
}