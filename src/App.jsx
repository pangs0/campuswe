import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";
import Auth from "./Auth";

// ── DATA ──────────────────────────────────────────────────────────────────────
const USERS = [
  { n: "HAKAN.DEV", c: "#238636", city: "Istanbul 🇹🇷", karma: 1247, role: "Vizyoner" },
  { n: "SOFIA.UX", c: "#1f6feb", city: "Madrid 🇪🇸", karma: 892, role: "Uygulayıcı" },
  { n: "JAMES.BTC", c: "#a371f7", city: "New York 🇺🇸", karma: 2103, role: "Teknik Kurucu" },
  { n: "YUKI.AI", c: "#f0883e", city: "Tokyo 🇯🇵", karma: 3441, role: "AI Uzmanı" },
  { n: "AMARA.FIN", c: "#ff79c6", city: "Lagos 🇳🇬", karma: 678, role: "Fintech" },
  { n: "LARS.GRN", c: "#e3b341", city: "Oslo 🇳🇴", karma: 1560, role: "Greentech" },
];

const STARTUPS_DATA = [
  { id: 1, name: "NeoBank X", desc: "Next-gen student fintech", karma: 2840, stage: "SEED", tag: "FINTECH", tc: "bg", members: ["HA", "AM"], mc: ["#238636", "#ff79c6"], prog: 68, focus: false },
  { id: 2, name: "ClimateAI", desc: "AI carbon footprint tracker", karma: 1920, stage: "PRE-SEED", tag: "GREENTECH", tc: "bg", members: ["LA", "SO", "JA"], mc: ["#e3b341", "#1f6feb", "#a371f7"], prog: 42, focus: true },
  { id: 3, name: "MetaTutor", desc: "Metaverse adaptive learning", karma: 3150, stage: "SERIES A", tag: "EDTECH", tc: "bb", members: ["YU", "HA"], mc: ["#f0883e", "#238636"], prog: 85, focus: false },
  { id: 4, name: "HealthDAO", desc: "Decentralized health records", karma: 980, stage: "IDEA", tag: "HEALTHTECH", tc: "bo", members: ["AM"], mc: ["#ff79c6"], prog: 22, focus: false },
];

const CONTESTS_DATA = [
  { id: 1, title: "FinTech Challenge — MENA", desc: "Orta Doğu ve Afrika'daki bankasız nüfus için mobil ödeme çözümü geliştir.", prize: "5.000 KARMA + Yatırımcı Sunumu", teams: 24, days: "7 gün", tags: ["FINTECH", "MOBILE"], region: "MENA 🌍", diff: "ORTA", dc: "bo", ai: true, sponsor: null },
  { id: 2, title: "GreenTech Sprint — Avrupa", desc: "Üniversite kampüslerinde enerji tüketimini %30 azaltacak IoT tabanlı sistem.", prize: "8.000 KARMA + €2.000", teams: 18, days: "12 gün", tags: ["IOT", "GREEN"], region: "Avrupa 🇪🇺", diff: "ZOR", dc: "br", ai: false, sponsor: "Siemens" },
  { id: 3, title: "AI Crisis Logistics — Global", desc: "72 saatte doğal afet lojistiği için yapay zeka destekli koordinasyon platformu.", prize: "12.000 KARMA + Accelerator", teams: 31, days: "3 gün", tags: ["AI", "CRISIS"], region: "Global 🌐", diff: "ELİT", dc: "br", ai: true, sponsor: null },
];

const TICKER_ITEMS = [
  { t: "HAKAN.DEV 500 Karma kazandı 🚀", c: "#3fb950" },
  { t: "MetaTutor SERIES A kapattı!", c: "#e3b341" },
  { t: "Yeni yarışma: AI Crisis — 12.000 KARMA", c: "#f0883e" },
  { t: "SOFIA.UX MatchMaker ile partner buldu", c: "#58a6ff" },
  { t: "FinTech Challenge için son 7 gün!", c: "#f85149" },
  { t: "YUKI.AI 10.000 Karma milestone'a ulaştı ✨", c: "#a371f7" },
];

const ABILITIES = [
  { n: "KOD YAZ", icon: "💻", k: 25, c: "#58a6ff" },
  { n: "TASARIM", icon: "🎨", k: 20, c: "#ff79c6" },
  { n: "MENTORLUK", icon: "🧠", k: 30, c: "#a371f7" },
  { n: "ÇEVİRİ", icon: "🌍", k: 15, c: "#f0883e" },
];

const SKILLS = [
  { n: "React / TypeScript", v: 88, c: "#58a6ff" },
  { n: "UI/UX Tasarım", v: 72, c: "#ff79c6" },
  { n: "Girişimcilik", v: 65, c: "#f0883e" },
  { n: "AI / ML", v: 50, c: "#d2a8ff" },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────
const Av = ({ initials, color, size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Press Start 2P', monospace", fontSize: size * 0.25,
    color: "#fff", flexShrink: 0, border: "2px solid #161b22"
  }}>{initials}</div>
);

const Badge = ({ children, type = "bb" }) => {
  const styles = {
    bg: { background: "rgba(63,185,80,.1)", color: "#3fb950", borderColor: "rgba(63,185,80,.3)" },
    bb: { background: "rgba(88,166,255,.1)", color: "#58a6ff", borderColor: "rgba(88,166,255,.3)" },
    bo: { background: "rgba(240,136,62,.1)", color: "#f0883e", borderColor: "rgba(240,136,62,.3)" },
    bp: { background: "rgba(163,113,247,.1)", color: "#a371f7", borderColor: "rgba(163,113,247,.3)" },
    by: { background: "rgba(227,179,65,.1)", color: "#e3b341", borderColor: "rgba(227,179,65,.3)" },
    br: { background: "rgba(248,81,73,.1)", color: "#f85149", borderColor: "rgba(248,81,73,.3)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 7px",
      borderRadius: 20, fontFamily: "'Press Start 2P', monospace", fontSize: 5,
      border: "1px solid", whiteSpace: "nowrap", ...styles[type]
    }}>{children}</span>
  );
};

const XPBar = ({ value, max = 100, color }) => (
  <div style={{ height: 5, background: "#21262d", borderRadius: 3, overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 3, width: `${Math.min(100, (value / max) * 100)}%`,
      background: color || "linear-gradient(90deg,#1f6feb,#a371f7)",
      transition: "width .8s cubic-bezier(.34,1.56,.64,1)"
    }} />
  </div>
);

const KarmaToast = ({ amount, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 1300); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", top: 70, right: 20, zIndex: 9999,
      background: "#161b22", border: "1px solid #238636", borderRadius: 8,
      padding: "10px 18px", fontFamily: "'Press Start 2P', monospace",
      fontSize: 10, color: "#3fb950", boxShadow: "0 4px 20px rgba(35,134,54,.3)",
      animation: "karmaUp 1.3s ease forwards"
    }}>+{amount} KARMA</div>
  );
};

// ── PAGES ─────────────────────────────────────────────────────────────────────

// GLOBAL PLAZA — gerçek zamanlı mesajlar
const GlobalPlaza = ({ onKarmaEarn, user }) => {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [coffeeActive, setCoffeeActive] = useState(false);
  const [coffeeTimer, setCoffeeTimer] = useState(300);
  const [coffeeUser, setCoffeeUser] = useState(null);

  useEffect(() => {
    // Mevcut mesajları yükle
    const fetchMsgs = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);
      if (data) setMsgs(data);
    };
    fetchMsgs();

    // Gerçek zamanlı dinle
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages"
      }, (payload) => {
        setMsgs(m => [...m, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

const sendMsg = async () => {
  if (!input.trim()) return;
  const username = user?.email?.split("@")[0]?.toUpperCase() || "KULLANICI";
  console.log("Mesaj gönderiliyor:", { user_id: user.id, username, content: input });
  const { data, error } = await supabase.from("messages").insert({
    user_id: user.id,
    username,
    avatar_color: "#238636",
    city: "Türkiye 🇹🇷",
    content: input,
  });
  console.log("Sonuç:", data, "Hata:", error);
  setInput("");
};

  const startCoffee = () => {
    if (coffeeActive) return;
    const u = USERS[Math.floor(Math.random() * USERS.length)];
    setCoffeeUser(u); setCoffeeActive(true); setCoffeeTimer(300);
  };

  useEffect(() => {
    if (!coffeeActive) return;
    const t = setInterval(() => setCoffeeTimer(s => {
      if (s <= 1) { setCoffeeActive(false); setCoffeeUser(null); return 300; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [coffeeActive]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, marginBottom: 3 }}>🌍 GLOBAL PLAZA</div>
          <div style={{ fontSize: 11, color: "#7d8590" }}>Dünyanın dört bir yanından girişimcilerle bağlan</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3fb950" }} />
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#3fb950" }}>247 ONLINE</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
        <div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3fb950" }} />
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590" }}>CANLI MESAJLAR</span>
            </div>
            <div style={{ maxHeight: 260, overflowY: "auto", padding: 12 }}>
              {msgs.length === 0 && (
                <div style={{ textAlign: "center", color: "#484f58", fontFamily: "'Press Start 2P'", fontSize: 7, padding: 20 }}>
                  İlk mesajı sen yaz! 👋
                </div>
              )}
              {msgs.map(m => (
                <div key={m.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <Av initials={(m.username || "?").slice(0, 2)} color={m.avatar_color || "#238636"} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: m.avatar_color || "#238636" }}>{m.username}</span>
                      <span style={{ fontSize: 10, color: "#7d8590" }}>{m.city}</span>
                    </div>
                    <div style={{ background: "#21262d", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}>{m.content}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 10, borderTop: "1px solid #30363d", display: "flex", gap: 8 }}>
              <input
                style={{ flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "6px 10px", color: "#e6edf3", fontSize: 12, outline: "none" }}
                placeholder="Global Plaza'ya mesaj yaz..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
              />
              <button onClick={() => { console.log("BUTON TIKLANDI"); sendMsg(); }} style={{ background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "6px 14px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>GÖNDER</button>
            </div>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>☕</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#e3b341", marginBottom: 3 }}>KAHVE MOLASI</div>
                <div style={{ fontSize: 11, color: "#7d8590" }}>Günde 1 kez — rastgele biriyle 5 dak. networking</div>
              </div>
              <button onClick={startCoffee} style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "5px 12px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>
                {coffeeActive ? "AKTİF" : "BAŞLAT"}
              </button>
            </div>
            {coffeeActive && coffeeUser && (
              <div style={{ marginTop: 10, padding: 8, background: "#21262d", borderRadius: 6, border: "1px solid #e3b341", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>☕ <strong style={{ color: coffeeUser.c }}>{coffeeUser.n}</strong> ile networking başladı!</span>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: "#f85149" }}>
                  {Math.floor(coffeeTimer / 60)}:{String(coffeeTimer % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #30363d" }}>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590" }}>ONLINE</span>
          </div>
          {USERS.map((u, i) => (
            <div key={i} style={{ padding: "8px 12px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ position: "relative" }}>
                <Av initials={u.n.slice(0, 2)} color={u.c} size={28} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#3fb950", border: "2px solid #161b22" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: u.c, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.n}</div>
                <div style={{ fontSize: 10, color: "#7d8590" }}>{u.city}</div>
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#e3b341" }}>{u.karma.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChillZone = ({ onKarmaEarn }) => {
  const lounge = [
    { n: "SOFIA.UX", c: "#1f6feb", status: "Müzik dinliyor 🎵", av: true },
    { n: "LARS.GRN", c: "#e3b341", status: "Okuma yapıyor 📚", av: true },
    { n: "YUKI.AI", c: "#f0883e", status: "Focus modunda 🔴", av: false },
    { n: "AMARA.FIN", c: "#ff79c6", status: "Sohbete açık 💬", av: true },
  ];
  const events = [
    { time: "15:00", title: "AI Workshop", host: "YUKI.AI" },
    { time: "18:00", title: "Pitch Feedback", host: "JAMES.BTC" },
    { time: "20:00", title: "Global Networking", host: "CAMPUSWE" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, marginBottom: 3 }}>🌿 CHILL ZONE</div>
        <div style={{ fontSize: 11, color: "#7d8590" }}>Dinlen, sosyalleş, ilham al</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}>
          <div style={{ padding: "8px 14px", borderBottom: "1px solid #30363d" }}>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#3fb950" }}>🌿 LOUNGE</span>
          </div>
          {lounge.map((l, i) => (
            <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Av initials={l.n.slice(0, 2)} color={l.c} size={34} />
                {l.av && <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#3fb950", border: "2px solid #161b22" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: l.c, marginBottom: 2 }}>{l.n}</div>
                <div style={{ fontSize: 11, color: "#7d8590" }}>{l.status}</div>
              </div>
              <Badge type={l.av ? "bg" : "br"}>{l.av ? "AÇIK" : "MEŞGUL"}</Badge>
            </div>
          ))}
          <div style={{ padding: 10 }}>
            <button style={{ width: "100%", background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "7px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>+ MASAYA OTUR</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#f0883e", marginBottom: 10 }}>🕹️ ARCADE</div>
            <div style={{ background: "#21262d", borderRadius: 6, padding: 10, border: "1px solid #30363d" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6 }}>Startup Trivia</span>
                <Badge type="by">+50 KARMA</Badge>
              </div>
              <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8 }}>Girişim bilgi yarışması • 12 aktif</div>
              <button onClick={() => onKarmaEarn(50)} style={{ background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "5px 12px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>OYNA +50 KARMA</button>
            </div>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#a371f7", marginBottom: 10 }}>📅 BUGÜN</div>
            {events.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590", minWidth: 36 }}>{e.time}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12 }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: "#7d8590" }}>by {e.host}</div>
                </div>
                <button style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "3px 8px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 5, cursor: "pointer" }}>KATIL</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StartupGarage = () => {
  const [startups, setStartups] = useState(STARTUPS_DATA);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", sector: "" });

  const toggleFocus = (id) => {
    setStartups(s => s.map(st => st.id === id ? { ...st, focus: !st.focus } : st));
  };

  const createStartup = () => {
    if (!form.name.trim()) return;
    setStartups(s => [...s, {
      id: s.length + 1, name: form.name, desc: form.desc || "Yeni girişim",
      karma: 0, stage: "IDEA", tag: form.sector || "STARTUP",
      tc: "bp", members: ["HA"], mc: ["#238636"], prog: 5, focus: false
    }]);
    setShowModal(false);
    setForm({ name: "", desc: "", sector: "" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, marginBottom: 3 }}>🏗️ STARTUP GARAJLARI</div>
          <div style={{ fontSize: 11, color: "#7d8590" }}>{startups.length} aktif startup</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "6px 14px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>+ YENİ STARTUP</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {startups.map(s => (
          <div key={s.id} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 14, transition: "border-color .15s", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#8b949e"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7 }}>{s.name}</span>
                  <Badge type={s.tc}>{s.tag}</Badge>
                </div>
                <div style={{ fontSize: 11, color: "#7d8590" }}>{s.desc}</div>
              </div>
              <div onClick={() => toggleFocus(s.id)} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.focus ? "#f85149" : "#3fb950", boxShadow: `0 0 6px ${s.focus ? "#f85149" : "#3fb950"}` }} />
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: s.focus ? "#f85149" : "#3fb950" }}>{s.focus ? "DND" : "AÇIK"}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Badge type="bp">{s.stage}</Badge>
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: "#e3b341", marginLeft: "auto" }}>⭐ {s.karma.toLocaleString()} KARMA</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "#7d8590" }}>Milestone</span>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: "#7d8590" }}>{s.prog}%</span>
              </div>
              <XPBar value={s.prog} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex" }}>
                {s.members.map((m, i) => (
                  <div key={i} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                    <Av initials={m} color={s.mc[i]} size={24} />
                  </div>
                ))}
              </div>
              <button style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "3px 8px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 5, cursor: "pointer" }}>GÖRÜNTÜLE</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, background: "#161b22", border: "1px solid #f0883e", borderRadius: 8, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>💼</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#f0883e", marginBottom: 3 }}>YATIRIMCI KATI — PRO ERİŞİM</div>
            <div style={{ fontSize: 11, color: "#7d8590" }}>5.000+ Karma ile yatırımcılarla doğrudan bağlan</div>
          </div>
          <button style={{ background: "#21262d", border: "1px solid #f0883e", borderRadius: 6, padding: "5px 12px", color: "#f0883e", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>🔒 UNLOCK</button>
        </div>
      </div>
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 20, width: 340 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 9, marginBottom: 14 }}>YENİ STARTUP KUR</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <input style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "7px 10px", color: "#e6edf3", fontSize: 13, outline: "none" }} placeholder="Startup adı..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "7px 10px", color: "#e6edf3", fontSize: 13, outline: "none" }} placeholder="Kısa açıklama..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              <select style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "7px 10px", color: "#e6edf3", fontSize: 13, outline: "none" }} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                <option value="">Sektör seç...</option>
                {["FINTECH", "EDTECH", "HEALTHTECH", "GREENTECH", "AI/ML", "SAAS"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={createStartup} style={{ flex: 1, background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "7px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>OLUŞTUR</button>
              <button onClick={() => setShowModal(false)} style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "7px 14px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>İPTAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Contests = () => {
  const [activeTab, setActiveTab] = useState("aktif");
  const [joinModal, setJoinModal] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, marginBottom: 3 }}>🏆 YARIŞMALAR</div>
        <div style={{ fontSize: 11, color: "#7d8590" }}>AI destekli yarışmalara katıl, karma kazan, yatırım al</div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #30363d", marginBottom: 14 }}>
        {[["aktif", "Aktif"], ["gecmis", "Geçmiş"]].map(([k, v]) => (
          <div key={k} onClick={() => setActiveTab(k)} style={{ padding: "7px 14px", fontFamily: "'Press Start 2P'", fontSize: 6, color: activeTab === k ? "#e6edf3" : "#7d8590", borderBottom: activeTab === k ? "2px solid #f0883e" : "2px solid transparent", cursor: "pointer" }}>{v}</div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: 12 }}>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#a371f7" }}>🤖 AI MOTOR AKTİF</span>
        </div>
      </div>
      {activeTab === "aktif" && CONTESTS_DATA.map(c => (
        <div key={c.id} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7 }}>{c.title}</span>
                {c.ai && <Badge type="bp">🤖 AI GEN</Badge>}
                {c.sponsor && <Badge type="bb">🏢 {c.sponsor}</Badge>}
              </div>
              <div style={{ fontSize: 12, color: "#7d8590", marginBottom: 8, lineHeight: 1.6 }}>{c.desc}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {c.tags.map(t => <Badge key={t} type="bb">{t}</Badge>)}
                <Badge type={c.dc}>{c.diff}</Badge>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#7d8590" }}>📍 {c.region}</span>
                <span style={{ fontSize: 11, color: "#7d8590" }}>👥 {c.teams} takım</span>
                <span style={{ fontSize: 11, color: "#f85149" }}>⏱ {c.days} kaldı</span>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: "#e3b341" }}>🏆 {c.prize}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              <button onClick={() => setJoinModal(c)} style={{ background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "6px 12px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>KATIL</button>
              <button style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "6px 12px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>DETAY</button>
            </div>
          </div>
        </div>
      ))}
      {activeTab === "gecmis" && (
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}>
          {[{ title: "MedTech Hackathon", winner: "HAKAN.DEV & Team", karma: 5000, date: "2 hafta önce" },
            { title: "EduTech Sprint", winner: "SOFIA.UX & Team", karma: 3200, date: "1 ay önce" }].map((p, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i === 0 ? "1px solid #21262d" : "none", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#7d8590" }}>Kazanan: {p.winner}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#e3b341" }}>{p.karma.toLocaleString()} KARMA</div>
                  <div style={{ fontSize: 10, color: "#484f58" }}>{p.date}</div>
                </div>
              </div>
            ))}
        </div>
      )}
      {joinModal && (
        <div onClick={() => setJoinModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 20, width: 340 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 9, marginBottom: 8 }}>YARIŞMAYA KATIL</div>
            <div style={{ fontSize: 12, color: "#7d8590", marginBottom: 14 }}>{joinModal.title}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => setJoinModal(null)} style={{ flex: 1, background: "#238636", border: "1px solid #238636", borderRadius: 6, padding: "7px", color: "#fff", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>YENİ TAKIM KUR</button>
              <button onClick={() => setJoinModal(null)} style={{ flex: 1, background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "7px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>TAKIM BUL</button>
            </div>
            <button onClick={() => setJoinModal(null)} style={{ width: "100%", background: "transparent", border: "1px solid #30363d", borderRadius: 6, padding: "7px", color: "#7d8590", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>İPTAL</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = ({ karma, xp, onKarmaEarn, user, onLogout }) => {
  const username = user?.email?.split("@")[0]?.toUpperCase() || "KULLANICI";
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, marginBottom: 3 }}>👤 PROFİLİM</div>
        <div style={{ fontSize: 11, color: "#7d8590" }}>Yeteneklerini takas et, karma biriktir</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <Av initials={username.slice(0, 2)} color="#238636" size={64} />
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 9, margin: "10px 0 3px" }}>{username}</div>
            <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 6 }}>{user?.email}</div>
            <Badge type="bo">⚔️ VİZYONER</Badge>
            <div style={{ margin: "10px 0 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590" }}>LV 1</span>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590" }}>{xp}/100 XP</span>
              </div>
              <XPBar value={xp} />
            </div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: "#e3b341", marginTop: 8 }}>✨ {karma.toLocaleString()}</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590", marginTop: 2 }}>KARMA PUANI</div>
            <div style={{ borderTop: "1px solid #30363d", marginTop: 10, paddingTop: 10 }}>
              <button onClick={onLogout} style={{ width: "100%", background: "transparent", border: "1px solid #f85149", borderRadius: 6, padding: "6px", color: "#f85149", fontFamily: "'Press Start 2P'", fontSize: 6, cursor: "pointer" }}>
                ÇIKIŞ YAP
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 14 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590", marginBottom: 12 }}>BECERİLER</div>
            {SKILLS.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{s.n}</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: s.c }}>{s.v}</span>
                </div>
                <XPBar value={s.v} color={s.c} />
              </div>
            ))}
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 14 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590", marginBottom: 12 }}>⚡ YETENEK TAKAS ET → KARMA KAZAN</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ABILITIES.map(a => (
                <button key={a.n} onClick={() => onKarmaEarn(a.k)} style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "10px", color: "#e6edf3", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = a.c}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: a.c }}>{a.n}</div>
                    <div style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: "#e3b341", marginTop: 2 }}>+{a.k} KARMA</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 14 }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590", marginBottom: 12 }}>🏆 BAŞARIMLAR</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{ icon: "🚀", n: "First Launch", u: true }, { icon: "🤝", n: "Team Player", u: true }, { icon: "💰", n: "Seed Round", u: true }, { icon: "🦄", n: "Unicorn", u: false }, { icon: "🌍", n: "Global", u: false }].map((a, i) => (
                <div key={i} style={{ padding: "8px 10px", borderRadius: 6, textAlign: "center", border: `1px solid ${a.u ? "#238636" : "#30363d"}`, background: a.u ? "rgba(35,134,54,.1)" : "#21262d", opacity: a.u ? 1 : 0.4 }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{a.icon}</div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: a.u ? "#3fb950" : "#484f58" }}>{a.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("plaza");
  const [karma, setKarma] = useState(0);
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState(null);

useEffect(() => {
  supabase.auth.getSession().then(async ({ data }) => {
    const u = data.session?.user ?? null;
    setUser(u);
    if (u) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("karma, xp")
        .eq("id", u.id)
        .single();
      if (profile) {
        setKarma(profile.karma || 0);
        setXp(profile.xp || 0);
      }
    }
    setAuthLoading(false);
  });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setKarma(0);
    setXp(0);
  };

const earnKarma = async (amount) => {
  console.log("USER:", user, "USER ID:", user?.id);
  const newKarma = karma + amount;
  const newXp = Math.min(100, xp + 5);
  setKarma(newKarma);
  setXp(newXp);
  setToast(amount);
  setTimeout(() => setToast(null), 1400);
  if (user?.id) {
    const result = await supabase
      .from("profiles")
      .update({ karma: newKarma, xp: newXp })
      .eq("id", user.id);
    console.log("Supabase update sonucu:", result);
  }
};

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Press Start 2P'", color: "#7d8590", fontSize: 8 }}>
      YÜKLENİYOR...
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  const username = user?.email?.split("@")[0]?.toUpperCase() || "?";

  const navItems = [
    { id: "plaza", label: "GLOBAL PLAZA", count: "247" },
    { id: "chill", label: "CHILL ZONE", count: null },
    { id: "garage", label: "GARAJLAR", count: "18" },
    { id: "contests", label: "YARIŞMALAR", count: "3" },
    { id: "profile", label: "PROFİLİM", count: null },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'Inter', sans-serif" }}>
      {toast && <KarmaToast amount={toast} onDone={() => setToast(null)} />}

      <header style={{ height: 52, background: "#161b22", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", padding: "0 20px", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          {"CAMPUSWE".split("").map((c, i) => (
            <span key={i} style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: ["#3fb950","#58a6ff","#e3b341","#ff79c6","#f0883e","#d2a8ff","#3fb950","#58a6ff"][i] }}>{c}</span>
          ))}
        </div>
        <Badge type="bp">BETA</Badge>
        <input style={{ maxWidth: 240, flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "5px 10px", color: "#e6edf3", fontSize: 12, outline: "none" }} placeholder="Ara..." />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "4px 10px" }}>
            <span>✨</span>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: "#e3b341" }}>{karma.toLocaleString()}</span>
          </div>
          <Av initials={username.slice(0, 2)} color="#238636" size={28} />
        </div>
      </header>

      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", height: 28, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ padding: "0 12px", borderRight: "1px solid #30363d", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#f0883e" }}>LIVE</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ animation: "marquee 28s linear infinite", whiteSpace: "nowrap", fontFamily: "'Press Start 2P'", fontSize: 6, color: "#7d8590", display: "inline-block", paddingLeft: "100%" }}>
            {TICKER_ITEMS.map((item, i) => (
              <span key={i} style={{ marginRight: 48, color: item.c }}>◆ {item.t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 80px)" }}>
        <aside style={{ width: 200, background: "#161b22", borderRight: "1px solid #30363d", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", flexShrink: 0 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, color: page === n.id ? "#e6edf3" : "#7d8590", background: page === n.id ? "#21262d" : "transparent", border: `1px solid ${page === n.id ? "#30363d" : "transparent"}`, cursor: "pointer", fontFamily: "'Press Start 2P'", fontSize: 6, transition: "all .12s" }}
              onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.background = "#21262d"; }}
              onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.background = "transparent"; }}>
              {n.label}
              {n.count && <span style={{ marginLeft: "auto", background: "#21262d", border: "1px solid #30363d", borderRadius: 20, padding: "1px 6px", fontSize: 5 }}>{n.count}</span>}
            </div>
          ))}
          <div style={{ borderTop: "1px solid #30363d", margin: "8px 0" }} />
          <div style={{ background: "#21262d", borderRadius: 6, padding: 10, border: "1px solid #30363d" }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: "#a371f7", marginBottom: 5 }}>🤖 MATCHMAKER</div>
            <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 7 }}>3 eşleşme bulundu</div>
            <button style={{ width: "100%", background: "#30363d", border: "1px solid #30363d", borderRadius: 6, padding: "5px 8px", color: "#e6edf3", fontFamily: "'Press Start 2P'", fontSize: 5, cursor: "pointer" }}>GÖRÜNTÜLE</button>
          </div>
        </aside>

        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {page === "plaza" && <GlobalPlaza onKarmaEarn={earnKarma} user={user} />}
          {page === "chill" && <ChillZone onKarmaEarn={earnKarma} />}
          {page === "garage" && <StartupGarage />}
          {page === "contests" && <Contests />}
          {page === "profile" && <Profile karma={karma} xp={xp} onKarmaEarn={earnKarma} user={user} onLogout={logout} />}
        </main>
      </div>
    </div>
  );
}