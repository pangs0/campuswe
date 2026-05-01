import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", username: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        await supabase.from("profiles").insert({
          id: data.user.id,
          username: form.username,
          city: form.city,
          karma: 0,
          xp: 0,
        });
        onLogin(data.user);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const inp = {
    background: "#0d1117", border: "1px solid #30363d", borderRadius: 6,
    padding: "8px 12px", color: "#e6edf3", fontSize: 13, width: "100%", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 32, width: 360 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 8 }}>
          {"CAMPUSWE".split("").map((c, i) => (
            <span key={i} style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: ["#3fb950","#58a6ff","#e3b341","#ff79c6","#f0883e","#d2a8ff","#3fb950","#58a6ff"][i] }}>{c}</span>
          ))}
        </div>
        <div style={{ textAlign: "center", fontFamily: "'Press Start 2P'", fontSize: 7, color: "#7d8590", marginBottom: 24 }}>
          Girişimci Evreni
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #30363d", marginBottom: 20 }}>
          {[["login", "GİRİŞ"], ["register", "KAYIT"]].map(([k, v]) => (
            <div key={k} onClick={() => { setMode(k); setError(""); }} style={{ flex: 1, textAlign: "center", padding: "8px", fontFamily: "'Press Start 2P'", fontSize: 7, color: mode === k ? "#e6edf3" : "#7d8590", borderBottom: mode === k ? "2px solid #f0883e" : "2px solid transparent", cursor: "pointer" }}>{v}</div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "register" && (
            <>
              <input style={inp} placeholder="Kullanıcı adı (örn: HAKAN.DEV)" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              <input style={inp} placeholder="Şehir (örn: Istanbul 🇹🇷)" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </>
          )}
          <input style={inp} placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input style={inp} placeholder="Şifre" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} />

          {error && <div style={{ fontSize: 11, color: "#f85149", fontFamily: "'Press Start 2P'" }}>{error}</div>}

          <button onClick={handle} disabled={loading} style={{ background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "10px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 8, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : mode === "login" ? "GİRİŞ YAP" : "HESAP OLUŞTUR"}
          </button>
        </div>
      </div>
    </div>
  );
}