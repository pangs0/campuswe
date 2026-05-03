import { useState, useEffect, useRef } from "react";
import "./App.css";
import { supabase } from "./supabase";
import Auth from "./Auth";

// ── PIXEL CURSOR ──────────────────────────────────────────────────────────────
const PixelCursor = () => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const [enabled, setEnabled] = useState(true);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) { setEnabled(false); return; }
    document.body.classList.add("pixel-cursor-on");
    return () => document.body.classList.remove("pixel-cursor-on");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my, dx = mx, dy = my;
    let raf = 0, lastT = performance.now();

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      const el = e.target;
      setHovering(!!(el?.closest?.('a, button, input, textarea, [role="button"], .cw-btn')));
    };
    const onLeave = () => { if (cursorRef.current) cursorRef.current.style.opacity = "0"; if (dotRef.current) dotRef.current.style.opacity = "0"; };
    const onEnter = () => { if (cursorRef.current) cursorRef.current.style.opacity = "1"; if (dotRef.current) dotRef.current.style.opacity = "1"; };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(50, now - lastT); lastT = now;
      const snap = 2;
      cx += (mx - cx) * Math.min(1, dt / 30); cy += (my - cy) * Math.min(1, dt / 30);
      dx += (mx - dx) * Math.min(1, dt / 180); dy += (my - dy) * Math.min(1, dt / 180);
      const sx = Math.round(cx / snap) * snap, sy = Math.round(cy / snap) * snap;
      const ddx = Math.round(dx / snap) * snap, ddy = Math.round(dy / snap) * snap;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-50%)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${ddx}px,${ddy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave); document.removeEventListener("mouseenter", onEnter); cancelAnimationFrame(raf); };
  }, [enabled]);

  if (!enabled) return null;
  const acc = "var(--accent)";
  const size = hovering ? 28 : 22;
  const arm = hovering ? 10 : 8;
  const thick = 2;

  return (
    <>
      <div ref={cursorRef} aria-hidden style={{ position:"fixed", left:0, top:0, width:size, height:size, pointerEvents:"none", zIndex:9999, mixBlendMode:"difference", willChange:"transform", transition:"width 0.1s steps(3),height 0.1s steps(3)" }}>
        <span style={{ position:"absolute", left:0, top:"50%", width:arm, height:thick, background:acc, transform:"translateY(-50%)" }} />
        <span style={{ position:"absolute", right:0, top:"50%", width:arm, height:thick, background:acc, transform:"translateY(-50%)" }} />
        <span style={{ position:"absolute", left:"50%", top:0, width:thick, height:arm, background:acc, transform:"translateX(-50%)" }} />
        <span style={{ position:"absolute", left:"50%", bottom:0, width:thick, height:arm, background:acc, transform:"translateX(-50%)" }} />
        {hovering && [{ l:0,t:0 },{ r:0,t:0 },{ l:0,b:0 },{ r:0,b:0 }].map((c,i) => (
          <span key={i} style={{ position:"absolute", left:c.l, right:c.r, top:c.t, bottom:c.b, width:5, height:5,
            borderLeft: c.l===0 ? `${thick}px solid ${acc}` : "none", borderRight: c.r===0 ? `${thick}px solid ${acc}` : "none",
            borderTop: c.t===0 ? `${thick}px solid ${acc}` : "none", borderBottom: c.b===0 ? `${thick}px solid ${acc}` : "none" }} />
        ))}
      </div>
      <div ref={dotRef} aria-hidden style={{ position:"fixed", left:0, top:0, width:6, height:6, background:acc, pointerEvents:"none", zIndex:9998, mixBlendMode:"difference", willChange:"transform", boxShadow:`0 0 0 2px rgba(167,139,250,0.25)` }} />
    </>
  );
};

// ── PIXEL ICON ────────────────────────────────────────────────────────────────
const GLYPHS = {
  crown: ["a.a.a.a.a","a.a.a.a.a","aaaaaaaaa","aaaaaaaaa",".aaaaaaa.",".aaaaaaa.",".aa...aa.",".aa...aa."],
  smile: ["..aaaaa...",".a.....a.","a..a.a..a","a.......a","a.a...a.a","a..aaa..a",".a.....a.","..aaaaa.."],
  spark: ["....a....","...aaa...","....a....","a.aaaaa.a","..aaaaa..","....a....","...aaa...","....a...."],
  chart: [".......a.",".....a.a.","...a.a.a.",".a.a.a.a.",".a.a.a.a.",".a.a.a.a.",".a.a.a.a.","aaaaaaaa."],
  flame: ["....a....","...aa....","..a.a....","..a.aa...",".aa..aa..",".a....a..",".aa..aa..","..aaaa..."],
  heart: [".aa.aa...","aaaaaaa..","aaaaaaa..","aaaaaaa..",".aaaaa...","..aaa....","...a.....","........"],
  check: [".......a.","......aa.",".....aa..","a...aa...","aa.aa.....",".aaa.....","..a......","........"],
  arrowR:["....a....","....aa...","....aaa..","aaaaaaaa.","aaaaaaaa.","....aaa..","....aa...","....a...."],
  plant: ["...a.....","..aaa....","...a.aa..","...aaa...","aa.a.....",".aaa.....","...a.....","aaaaa...."],
  star:  ["...a.....","...a.....","aaaaaaa..","...a.....","..aaa....","..aaa....",".a...a...","a.....a.."],
  globe: ["..aaaaa..","..aaaaa..",".aaa.aaa.","aaa.a.aaa","aaa.a.aaa",".aaa.aaa.","..aaaaa..","..aaaaa.."],
};

const PixelIcon = ({ name, size = 4, color = "var(--accent)" }) => {
  const rows = GLYPHS[name];
  if (!rows) return null;
  const h = rows.length, w = rows[0].length;
  return (
    <svg width={w*size} height={h*size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" style={{ display:"block" }}>
      {rows.map((row, y) => [...row].map((ch, x) => ch === "a" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null))}
    </svg>
  );
};

// ── CORNER TICKS ──────────────────────────────────────────────────────────────
const CT = () => (
  <>
    {[{t:-2,l:-2},{t:-2,r:-2},{b:-2,l:-2},{b:-2,r:-2}].map((s,i) => (
      <span key={i} style={{ position:"absolute", width:7, height:7, background:"var(--accent)", top:s.t, left:s.l, right:s.r, bottom:s.b }} />
    ))}
  </>
);

// ── XP BAR ────────────────────────────────────────────────────────────────────
const XPBar = ({ value, max = 100 }) => (
  <div className="xp-track">
    <div className="xp-fill" style={{ width: `${Math.min(100,(value/max)*100)}%` }} />
  </div>
);

// ── KARMA TOAST ───────────────────────────────────────────────────────────────
const KarmaToast = ({ amount, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 1300); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed", top:70, right:20, zIndex:9998,
      background:"var(--panel)", border:"1px solid var(--accent)", padding:"10px 18px",
      fontFamily:"var(--font-display)", fontSize:10, color:"var(--accent)",
      boxShadow:"0 0 24px rgba(167,139,250,0.3)",
      animation:"karmaUp 1.3s ease forwards"
    }}>+{amount} KARMA ✦</div>
  );
};

// ── TICKER ────────────────────────────────────────────────────────────────────
const TICKER = [
  { t:"HAKAN.DEV 500 Karma kazandı", c:"var(--accent)" },
  { t:"MetaTutor SERIES A kapattı!", c:"var(--accent-2)" },
  { t:"Yeni yarışma: AI Crisis — 12.000 KARMA", c:"var(--accent)" },
  { t:"SOFIA.UX MatchMaker ile partner buldu", c:"rgba(236,232,217,0.6)" },
  { t:"FinTech Challenge için son 7 gün!", c:"var(--red)" },
  { t:"YUKI.AI 10.000 Karma milestone'a ulaştı ✦", c:"var(--accent)" },
];

// ── AVATAR ────────────────────────────────────────────────────────────────────
const Av = ({ initials, color = "var(--accent)", size = 28, glow = false }) => (
  <div style={{
    width:size, height:size, background:color, borderRadius:"50%",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"var(--font-display)", fontSize:size*0.24, color:"#0a0a0f",
    flexShrink:0, border:"2px solid var(--bg)",
    boxShadow: glow ? `0 0 12px ${color}` : "none",
    transition:"box-shadow 0.3s"
  }}>{initials}</div>
);

// ── BADGE ─────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "var(--accent)" }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", padding:"2px 8px",
    border:`1px solid ${color}`, background:`${color}18`,
    fontFamily:"var(--font-display)", fontSize:6,
    color, whiteSpace:"nowrap", letterSpacing:"0.06em"
  }}>{children}</span>
);

// ── DATA ──────────────────────────────────────────────────────────────────────
const ONLINE_USERS = [
  { n:"HAKAN.DEV", c:"#a78bfa", city:"Istanbul 🇹🇷", karma:1247, x:52, y:38 },
  { n:"SOFIA.UX",  c:"#f0c040", city:"Madrid 🇪🇸",   karma:892,  x:44, y:37 },
  { n:"JAMES.BTC", c:"#3fb950", city:"New York 🇺🇸",  karma:2103, x:22, y:36 },
  { n:"YUKI.AI",   c:"#f0883e", city:"Tokyo 🇯🇵",     karma:3441, x:80, y:37 },
  { n:"AMARA.FIN", c:"#f85149", city:"Lagos 🇳🇬",     karma:678,  x:48, y:55 },
  { n:"LARS.GRN",  c:"#58a6ff", city:"Oslo 🇳🇴",      karma:1560, x:49, y:28 },
  { n:"PRIYA.AI",  c:"#c084fc", city:"Mumbai 🇮🇳",    karma:2200, x:65, y:45 },
  { n:"CARLOS.FIN",c:"#a78bfa", city:"São Paulo 🇧🇷", karma:990,  x:30, y:62 },
];

const STARTUPS = [
  { id:1, name:"NeoBank X",  desc:"Next-gen student fintech",    karma:2840, stage:"SEED",     tag:"FINTECH",    members:["HA","AM"], mc:["#a78bfa","#f85149"], prog:68, focus:false },
  { id:2, name:"ClimateAI",  desc:"AI carbon footprint tracker", karma:1920, stage:"PRE-SEED", tag:"GREENTECH",  members:["LA","SO","JA"], mc:["#3fb950","#f0883e","#58a6ff"], prog:42, focus:true },
  { id:3, name:"MetaTutor",  desc:"Metaverse adaptive learning", karma:3150, stage:"SERIES A", tag:"EDTECH",     members:["YU","HA"], mc:["#f0c040","#a78bfa"], prog:85, focus:false },
  { id:4, name:"HealthDAO",  desc:"Decentralized health records",karma:980,  stage:"IDEA",     tag:"HEALTHTECH", members:["AM"], mc:["#f85149"], prog:22, focus:false },
];

const CONTESTS = [
  { id:1, title:"FinTech Challenge — MENA",      desc:"Orta Doğu ve Afrika'daki bankasız nüfus için mobil ödeme çözümü.", prize:"5.000 KARMA + Yatırımcı", teams:24, days:"7 gün",  tags:["FINTECH","MOBILE"], region:"MENA 🌍",    diff:"ORTA", ai:true,  sponsor:null },
  { id:2, title:"GreenTech Sprint — Avrupa",     desc:"Kampüslerde enerji tüketimini %30 azaltacak IoT tabanlı sistem.", prize:"8.000 KARMA + €2.000",     teams:18, days:"12 gün", tags:["IOT","GREEN"],    region:"Avrupa 🇪🇺",  diff:"ZOR",  ai:false, sponsor:"Siemens" },
  { id:3, title:"AI Crisis Logistics — Global",  desc:"72 saatte doğal afet lojistiği için yapay zeka koordinasyon.",   prize:"12.000 KARMA + Accelerator",teams:31, days:"3 gün",  tags:["AI","CRISIS"],    region:"Global 🌐",   diff:"ELİT", ai:true,  sponsor:null },
];

const EVENTS = [
  { time:"15:00", title:"AI Workshop",       host:"YUKI.AI",    color:"#a78bfa" },
  { time:"18:00", title:"Pitch Feedback",    host:"JAMES.BTC",  color:"#f0883e" },
  { time:"20:00", title:"Global Networking", host:"CAMPUSWE",   color:"#3fb950" },
  { time:"22:00", title:"Hackathon Kickoff", host:"CAMPUSWE",   color:"#f0c040" },
];

const MY_PROJECTS = [
  { name:"NeoBank X", stage:"SEED",     prog:68 },
  { name:"HealthDAO", stage:"IDEA",     prog:22 },
];

const ABILITIES = [
  { n:"KOD YAZ",  icon:"💻", k:25 },
  { n:"TASARIM",  icon:"🎨", k:20 },
  { n:"MENTÖRLÜK",icon:"🧠", k:30 },
  { n:"ÇEVİRİ",  icon:"🌍", k:15 },
];

const SKILLS = [
  { n:"React / TypeScript", v:88 },
  { n:"UI/UX Tasarım",      v:72 },
  { n:"Girişimcilik",       v:65 },
  { n:"AI / ML",            v:50 },
];

// ── WORLD MAP ─────────────────────────────────────────────────────────────────
const WorldMap = () => {
  const [hovered, setHovered] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p+1) % ONLINE_USERS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position:"relative", height:260, background:"linear-gradient(180deg,#050a14 0%,#0a1628 50%,#050a14 100%)", border:"1px solid var(--line-2)", overflow:"hidden" }}>
      {/* Grid */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }}>
        {Array.from({length:14},(_,i) => <line key={i} x1={`${i*7.14}%`} y1="0" x2={`${i*7.14}%`} y2="100%" stroke="var(--accent)" strokeWidth="0.5"/>)}
        {Array.from({length:9},(_,i) => <line key={i} x1="0" y1={`${i*12.5}%`} x2="100%" y2={`${i*12.5}%`} stroke="var(--accent)" strokeWidth="0.5"/>)}
      </svg>
      {/* Continent silhouettes */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.13 }} viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
        <path d="M 120 80 L 200 70 L 240 90 L 260 130 L 230 170 L 200 200 L 170 220 L 140 200 L 120 170 L 100 140 Z" fill="var(--accent)" />
        <path d="M 220 240 L 260 230 L 290 260 L 300 320 L 280 380 L 250 400 L 220 370 L 200 320 L 210 270 Z" fill="var(--accent)" />
        <path d="M 430 60 L 490 55 L 520 75 L 510 110 L 480 125 L 450 115 L 430 95 Z" fill="var(--accent)" />
        <path d="M 440 140 L 500 130 L 530 160 L 540 220 L 520 290 L 490 330 L 460 320 L 440 280 L 430 220 L 435 170 Z" fill="var(--accent)" />
        <path d="M 530 50 L 700 40 L 780 70 L 800 120 L 760 160 L 700 170 L 640 150 L 580 140 L 540 110 Z" fill="var(--accent)" />
        <path d="M 730 280 L 800 270 L 830 300 L 820 340 L 790 360 L 750 350 L 730 320 Z" fill="var(--accent)" />
      </svg>
      {/* Connection lines */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.12 }}>
        {ONLINE_USERS.slice(0,5).map((u,i) => ONLINE_USERS.slice(i+1,i+3).map((u2,j) => (
          <line key={`${i}-${j}`} x1={`${u.x}%`} y1={`${u.y}%`} x2={`${u2.x}%`} y2={`${u2.y}%`} stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="4,4"/>
        )))}
      </svg>
      {/* User dots */}
      {ONLINE_USERS.map((u,i) => (
        <div key={i} style={{ position:"absolute", left:`${u.x}%`, top:`${u.y}%`, transform:"translate(-50%,-50%)", zIndex:10, cursor:"pointer" }}
          onMouseEnter={() => setHovered(u)} onMouseLeave={() => setHovered(null)}>
          {pulse === i && <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:`2px solid ${u.c}`, animation:"ping-out 1.5s ease-out forwards", opacity:0 }} />}
          <div style={{ width:11, height:11, borderRadius:"50%", background:u.c, border:"2px solid var(--bg)", boxShadow:`0 0 8px ${u.c}`, transition:"transform 0.2s", transform:hovered===u?"scale(1.6)":"scale(1)" }} />
          {hovered === u && (
            <div style={{ position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)", background:"var(--panel)", border:`1px solid ${u.c}`, padding:"7px 12px", whiteSpace:"nowrap", zIndex:20, boxShadow:`0 4px 16px ${u.c}44` }}>
              <div className="pixel-xs" style={{ color:u.c, marginBottom:3 }}>{u.n}</div>
              <div style={{ fontSize:10, color:"var(--fg-faint)" }}>{u.city}</div>
              <div className="pixel-xs" style={{ color:"var(--accent-2)", marginTop:3 }}>⭐ {u.karma.toLocaleString()}</div>
            </div>
          )}
        </div>
      ))}
      {/* Stats */}
      <div style={{ position:"absolute", bottom:10, left:12, display:"flex", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 6px var(--green)", animation:"pulse-subtle 2s infinite" }} />
          <span className="pixel-xs" style={{ color:"var(--green)" }}>247 ONLINE</span>
        </div>
        <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>42 ÜLKE</span>
        <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>18 STARTUP</span>
      </div>
      <div style={{ position:"absolute", top:10, left:12 }}>
        <span className="pixel-xs" style={{ color:"var(--accent)", textShadow:"0 0 10px var(--accent)" }}>◆ GLOBAL PLAZA — CANLI</span>
      </div>
    </div>
  );
};

// ── GLOBAL PLAZA PAGE ─────────────────────────────────────────────────────────
const GlobalPlaza = ({ user, onKarmaEarn }) => {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [coffeeActive, setCoffeeActive] = useState(false);
  const [coffeeTimer, setCoffeeTimer] = useState(300);
  const [coffeeUser, setCoffeeUser] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at",{ascending:true}).limit(50);
      if (data) setMsgs(data);
    };
    load();
    const ch = supabase.channel("messages").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},(p) => setMsgs(m => [...m, p.new])).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const username = user?.email?.split("@")[0]?.toUpperCase() || "KULLANICI";
    await supabase.from("messages").insert({ user_id:user.id, username, avatar_color:"#a78bfa", city:"Türkiye 🇹🇷", content:input });
    setInput("");
  };

  const startCoffee = () => {
    if (coffeeActive) return;
    const u = ONLINE_USERS[Math.floor(Math.random()*ONLINE_USERS.length)];
    setCoffeeUser(u); setCoffeeActive(true); setCoffeeTimer(300);
  };

  useEffect(() => {
    if (!coffeeActive) return;
    const t = setInterval(() => setCoffeeTimer(s => { if(s<=1){setCoffeeActive(false);setCoffeeUser(null);return 300;}return s-1; }),1000);
    return () => clearInterval(t);
  }, [coffeeActive]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <WorldMap />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 210px", gap:14 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Chat */}
          <div className="cw-card" style={{ padding:0 }}>
            <div style={{ padding:"8px 14px", borderBottom:"1px solid var(--line-2)", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 5px var(--green)" }} />
              <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>CANLI MESAJLAR</span>
              <span className="pixel-xs" style={{ marginLeft:"auto", color:"var(--accent)" }}>REALTIME ◆</span>
            </div>
            <div style={{ maxHeight:220, overflowY:"auto", padding:14 }}>
              {msgs.length === 0 && (
                <div style={{ textAlign:"center", padding:24 }}>
                  <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>[ İlk mesajı sen yaz! ]</span>
                </div>
              )}
              {msgs.map(m => (
                <div key={m.id} style={{ display:"flex", gap:10, marginBottom:14, animation:"fade-up 0.3s ease" }}>
                  <Av initials={(m.username||"?").slice(0,2)} color={m.avatar_color||"#a78bfa"} size={30} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, marginBottom:4, alignItems:"baseline" }}>
                      <span className="pixel-xs" style={{ color:m.avatar_color||"var(--accent)" }}>{m.username}</span>
                      <span style={{ fontSize:10, color:"var(--fg-faint)" }}>{m.city}</span>
                    </div>
                    <div style={{ background:"var(--bg-2)", padding:"7px 10px", fontSize:12, color:"var(--fg-dim)", borderLeft:`2px solid ${m.avatar_color||"var(--accent)"}` }}>{m.content}</div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div style={{ padding:10, borderTop:"1px solid var(--line-2)", display:"flex", gap:8 }}>
              <input className="cw-input" placeholder="Global Plaza'ya mesaj yaz..." value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendMsg()} />
              <button className="cw-btn cw-btn-primary" onClick={sendMsg} style={{ padding:"8px 14px", fontSize:7, flexShrink:0 }}>▶ GÖNDER</button>
            </div>
          </div>
          {/* Coffee */}
          <div className="cw-card" style={{ padding:14, background:"linear-gradient(135deg,var(--panel),#120f00)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:20 }}>☕</span>
              <div style={{ flex:1 }}>
                <div className="pixel-xs" style={{ color:"var(--accent-2)", marginBottom:3 }}>KAHVE MOLASI</div>
                <div style={{ fontSize:11, color:"var(--fg-faint)" }}>Rastgele biriyle 5 dak. networking</div>
              </div>
              <button className="cw-btn cw-btn-ghost" onClick={startCoffee} style={{ fontSize:7, padding:"6px 12px", borderColor:"var(--accent-2)", color:"var(--accent-2)" }}>
                {coffeeActive ? "AKTİF" : "BAŞLAT"}
              </button>
            </div>
            {coffeeActive && coffeeUser && (
              <div style={{ marginTop:10, padding:10, border:"1px solid var(--accent-2)", background:"rgba(240,192,64,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", animation:"fade-up 0.3s ease" }}>
                <span style={{ fontSize:12, color:"var(--fg-dim)" }}>☕ <strong style={{ color:coffeeUser.c }}>{coffeeUser.n}</strong> ile networking!</span>
                <span className="pixel-sm" style={{ color:"var(--red)" }}>{Math.floor(coffeeTimer/60)}:{String(coffeeTimer%60).padStart(2,"0")}</span>
              </div>
            )}
          </div>
        </div>
        {/* Online */}
        <div className="cw-card" style={{ overflow:"hidden" }}>
          <div style={{ padding:"7px 12px", borderBottom:"1px solid var(--line-2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>ONLINE</span>
            <span className="pixel-xs" style={{ color:"var(--green)" }}>● {ONLINE_USERS.length}</span>
          </div>
          {ONLINE_USERS.map((u,i) => (
            <div key={i} style={{ padding:"7px 10px", borderBottom:"1px solid var(--line-2)", display:"flex", alignItems:"center", gap:8, cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-2)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ position:"relative" }}>
                <Av initials={u.n.slice(0,2)} color={u.c} size={24} />
                <div style={{ position:"absolute", bottom:0, right:0, width:6, height:6, borderRadius:"50%", background:"var(--green)", border:"2px solid var(--panel)" }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="pixel-xs" style={{ color:u.c, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.n}</div>
                <div style={{ fontSize:9, color:"var(--fg-faint)" }}>{u.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── CHILL ZONE ────────────────────────────────────────────────────────────────
const ChillZone = ({ onKarmaEarn }) => {
  const LOUNGE = [
    { n:"SOFIA.UX",  c:"#f0883e", status:"Müzik dinliyor 🎵", av:true },
    { n:"LARS.GRN",  c:"#3fb950", status:"Okuma yapıyor 📚",  av:true },
    { n:"YUKI.AI",   c:"#f0c040", status:"Focus modunda 🔴",   av:false },
    { n:"AMARA.FIN", c:"#f85149", status:"Sohbete açık 💬",    av:true },
  ];
  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <span className="eyebrow">chill zone</span>
        <div className="pixel-sm" style={{ marginTop:8 }}>Dinlen, sosyalleş, ilham al.</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div className="cw-card">
          <div style={{ padding:"8px 14px", borderBottom:"1px solid var(--line-2)" }}>
            <span className="pixel-xs" style={{ color:"var(--green)" }}>◆ LOUNGE</span>
          </div>
          {LOUNGE.map((l,i) => (
            <div key={i} style={{ padding:"10px 14px", borderBottom:"1px solid var(--line-2)", display:"flex", alignItems:"center", gap:10, transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-2)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ position:"relative" }}>
                <Av initials={l.n.slice(0,2)} color={l.c} size={32} />
                {l.av && <div style={{ position:"absolute", bottom:0, right:0, width:7, height:7, borderRadius:"50%", background:"var(--green)", border:"2px solid var(--panel)" }} />}
              </div>
              <div style={{ flex:1 }}>
                <div className="pixel-xs" style={{ color:l.c, marginBottom:2 }}>{l.n}</div>
                <div style={{ fontSize:11, color:"var(--fg-faint)" }}>{l.status}</div>
              </div>
              <Badge color={l.av?"var(--green)":"var(--red)"}>{l.av?"AÇIK":"MEŞGUL"}</Badge>
            </div>
          ))}
          <div style={{ padding:10 }}>
            <button className="cw-btn cw-btn-ghost" style={{ width:"100%", justifyContent:"center", fontSize:7, borderColor:"var(--accent)", color:"var(--accent)" }}>+ MASAYA OTUR</button>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="cw-card" style={{ padding:14 }}>
            <div className="pixel-xs" style={{ color:"var(--accent-2)", marginBottom:10 }}>◆ ARCADE</div>
            <div style={{ background:"var(--bg-2)", padding:12, border:"1px solid var(--line-2)", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span className="pixel-xs">Startup Trivia</span>
                <Badge color="var(--accent-2)">+50 KARMA</Badge>
              </div>
              <div style={{ fontSize:11, color:"var(--fg-faint)", marginBottom:8 }}>Girişim bilgi yarışması · 12 aktif</div>
              <button className="cw-btn cw-btn-primary" onClick={() => onKarmaEarn(50)} style={{ fontSize:7, padding:"6px 12px" }}>▶ OYNA</button>
            </div>
          </div>
          <div className="cw-card" style={{ padding:14 }}>
            <div className="pixel-xs" style={{ color:"var(--accent)", marginBottom:10 }}>◆ BUGÜN</div>
            {EVENTS.map((e,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, padding:"6px 10px", background:"var(--bg-2)", borderLeft:`3px solid ${e.color}` }}>
                <span className="pixel-xs" style={{ color:"var(--fg-faint)", minWidth:38 }}>{e.time}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:"var(--fg)" }}>{e.title}</div>
                  <div style={{ fontSize:10, color:"var(--fg-faint)" }}>by {e.host}</div>
                </div>
                <button className="cw-btn cw-btn-ghost" style={{ fontSize:5, padding:"3px 7px", borderColor:e.color, color:e.color }}>KATIL</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── GARAGE ────────────────────────────────────────────────────────────────────
const Garage = () => {
  const [startups, setStartups] = useState(STARTUPS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:"", desc:"", sector:"" });
  const [focus, setFocus] = useState({ 1:false, 2:true, 3:false, 4:false });

  const toggleFocus = (id) => setFocus(f => ({ ...f, [id]:!f[id] }));

  const create = () => {
    if (!form.name.trim()) return;
    const id = startups.length + 1;
    setStartups(s => [...s, { id, name:form.name, desc:form.desc||"Yeni girişim", karma:0, stage:"IDEA", tag:form.sector||"STARTUP", members:["HA"], mc:["#a78bfa"], prog:5, focus:false }]);
    setFocus(f => ({ ...f, [id]:false }));
    setModal(false); setForm({ name:"", desc:"", sector:"" });
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <span className="eyebrow">startup garajları</span>
          <div className="pixel-sm" style={{ marginTop:6 }}>{startups.length} aktif girişim</div>
        </div>
        <button className="cw-btn cw-btn-primary" onClick={() => setModal(true)} style={{ fontSize:7 }}>+ YENİ STARTUP</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        {startups.map(s => (
          <div key={s.id} className="cw-card" style={{ padding:14, position:"relative", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.boxShadow="0 0 16px rgba(167,139,250,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--line-2)"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:8 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <span className="pixel-xs" style={{ color:"var(--fg)" }}>{s.name}</span>
                  <Badge color="var(--accent)">{s.tag}</Badge>
                </div>
                <div style={{ fontSize:11, color:"var(--fg-faint)" }}>{s.desc}</div>
              </div>
              <div onClick={() => toggleFocus(s.id)} style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer", flexShrink:0 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:focus[s.id]?"var(--red)":"var(--green)", boxShadow:`0 0 6px ${focus[s.id]?"var(--red)":"var(--green)"}` }} />
                <span className="pixel-xs" style={{ color:focus[s.id]?"var(--red)":"var(--green)" }}>{focus[s.id]?"DND":"AÇIK"}</span>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <Badge color="var(--accent)">{s.stage}</Badge>
              <span className="pixel-xs" style={{ color:"var(--accent-2)", marginLeft:"auto" }}>⭐ {s.karma.toLocaleString()}</span>
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:9, color:"var(--fg-faint)" }}>Milestone</span>
                <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>{s.prog}%</span>
              </div>
              <XPBar value={s.prog} />
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex" }}>
                {s.members.map((m,i) => <div key={i} style={{ marginLeft:i>0?-6:0 }}><Av initials={m} color={s.mc[i]||"#a78bfa"} size={22} /></div>)}
              </div>
              <button className="cw-btn cw-btn-ghost" style={{ fontSize:5, padding:"3px 8px", borderColor:"var(--accent)", color:"var(--accent)" }}>GÖRÜNTÜLE ›</button>
            </div>
          </div>
        ))}
      </div>

      {/* Investor floor */}
      <div className="cw-card" style={{ padding:14, border:"1px solid var(--accent)", background:"linear-gradient(135deg,var(--panel),#0f0800)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:22 }}>💼</span>
          <div style={{ flex:1 }}>
            <div className="pixel-xs" style={{ color:"var(--accent-2)", marginBottom:3 }}>YATIRIMCI KATI — PRO ERİŞİM</div>
            <div style={{ fontSize:11, color:"var(--fg-faint)" }}>5.000+ Karma ile yatırımcılarla doğrudan bağlan</div>
          </div>
          <button className="cw-btn cw-btn-ghost" style={{ fontSize:7, borderColor:"var(--accent-2)", color:"var(--accent-2)" }}>🔒 UNLOCK</button>
        </div>
      </div>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div onClick={e => e.stopPropagation()} className="cw-card" style={{ padding:24, width:360, border:"1px solid var(--accent)", position:"relative", animation:"popIn 0.2s ease", boxShadow:"0 0 32px rgba(167,139,250,0.2)" }}>
            <CT />
            <div className="pixel-sm" style={{ color:"var(--accent)", marginBottom:16 }}>YENİ STARTUP KUR</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              <input className="cw-input" placeholder="Startup adı..." value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} />
              <input className="cw-input" placeholder="Kısa açıklama..." value={form.desc} onChange={e => setForm(f => ({...f,desc:e.target.value}))} />
              <select className="cw-input" value={form.sector} onChange={e => setForm(f => ({...f,sector:e.target.value}))}>
                <option value="">Sektör seç...</option>
                {["FINTECH","EDTECH","HEALTHTECH","GREENTECH","AI/ML","SAAS"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="cw-btn cw-btn-primary" onClick={create} style={{ flex:1, justifyContent:"center", fontSize:7 }}>▶ OLUŞTUR</button>
              <button className="cw-btn cw-btn-ghost" onClick={() => setModal(false)} style={{ fontSize:7 }}>İPTAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CONTESTS ──────────────────────────────────────────────────────────────────
const ContestsPage = () => {
  const [tab, setTab] = useState("aktif");
  const [join, setJoin] = useState(null);
  const diffColor = { KOLAY:"var(--green)", ORTA:"var(--accent-2)", ZOR:"var(--accent)", ELİT:"var(--red)" };

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <span className="eyebrow">yarışmalar</span>
        <div className="pixel-sm" style={{ marginTop:6 }}>AI destekli yarışmalara katıl, karma kazan, yatırım al.</div>
      </div>
      <div style={{ display:"flex", borderBottom:"1px solid var(--line-2)", marginBottom:16 }}>
        {[["aktif","Aktif"],["gecmis","Geçmiş"]].map(([k,v]) => (
          <div key={k} onClick={() => setTab(k)} style={{ padding:"8px 16px", fontFamily:"var(--font-display)", fontSize:7, color:tab===k?"var(--accent)":"var(--fg-faint)", borderBottom:tab===k?"2px solid var(--accent)":"2px solid transparent", cursor:"pointer" }}>{v}</div>
        ))}
        <span className="pixel-xs" style={{ marginLeft:"auto", alignSelf:"center", color:"var(--accent)", paddingRight:4 }}>◆ AI MOTOR AKTİF</span>
      </div>

      {tab === "aktif" && CONTESTS.map(c => (
        <div key={c.id} className="cw-card" style={{ padding:16, marginBottom:12, transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.boxShadow="0 0 16px rgba(167,139,250,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--line-2)"; e.currentTarget.style.boxShadow="none"; }}>
          <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                <span className="pixel-xs" style={{ color:"var(--fg)" }}>{c.title}</span>
                {c.ai && <Badge color="var(--accent)">🤖 AI GEN</Badge>}
                {c.sponsor && <Badge color="var(--blue)">🏢 {c.sponsor}</Badge>}
              </div>
              <div style={{ fontSize:12, color:"var(--fg-faint)", marginBottom:10, lineHeight:1.6 }}>{c.desc}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                {c.tags.map(t => <Badge key={t} color="var(--accent)">{t}</Badge>)}
                <Badge color={diffColor[c.diff]||"var(--accent)"}>{c.diff}</Badge>
              </div>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:"var(--fg-faint)" }}>📍 {c.region}</span>
                <span style={{ fontSize:11, color:"var(--fg-faint)" }}>👥 {c.teams} takım</span>
                <span style={{ fontSize:11, color:"var(--red)" }}>⏱ {c.days} kaldı</span>
                <span className="pixel-xs" style={{ color:"var(--accent-2)" }}>🏆 {c.prize}</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7, flexShrink:0 }}>
              <button className="cw-btn cw-btn-primary" onClick={() => setJoin(c)} style={{ fontSize:7, padding:"8px 14px" }}>KATIL</button>
              <button className="cw-btn cw-btn-ghost" style={{ fontSize:7, padding:"8px 14px" }}>DETAY</button>
            </div>
          </div>
        </div>
      ))}

      {tab === "gecmis" && (
        <div className="cw-card">
          {[{title:"MedTech Hackathon",winner:"HAKAN.DEV & Team",karma:5000,date:"2 hafta önce"},{title:"EduTech Sprint",winner:"SOFIA.UX & Team",karma:3200,date:"1 ay önce"}].map((p,i) => (
            <div key={i} style={{ padding:"12px 16px", borderBottom:i===0?"1px solid var(--line-2)":"none", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:18 }}>🏆</span>
              <div style={{ flex:1 }}>
                <div className="pixel-xs" style={{ marginBottom:2 }}>{p.title}</div>
                <div style={{ fontSize:11, color:"var(--fg-faint)" }}>Kazanan: {p.winner}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="pixel-xs" style={{ color:"var(--accent-2)" }}>{p.karma.toLocaleString()} KARMA</div>
                <div style={{ fontSize:10, color:"var(--fg-faint)", marginTop:2 }}>{p.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {join && (
        <div onClick={() => setJoin(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div onClick={e => e.stopPropagation()} className="cw-card" style={{ padding:24, width:360, border:"1px solid var(--accent)", position:"relative", animation:"popIn 0.2s ease", boxShadow:"0 0 32px rgba(167,139,250,0.2)" }}>
            <CT />
            <div className="pixel-sm" style={{ color:"var(--accent)", marginBottom:6 }}>YARIŞMAYA KATIL</div>
            <div style={{ fontSize:12, color:"var(--fg-faint)", marginBottom:16 }}>{join.title}</div>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <button className="cw-btn cw-btn-primary" onClick={() => setJoin(null)} style={{ flex:1, justifyContent:"center", fontSize:7 }}>YENİ TAKIM KUR</button>
              <button className="cw-btn cw-btn-ghost" onClick={() => setJoin(null)} style={{ flex:1, justifyContent:"center", fontSize:7 }}>TAKIM BUL</button>
            </div>
            <button className="cw-btn cw-btn-ghost" onClick={() => setJoin(null)} style={{ width:"100%", justifyContent:"center", fontSize:7 }}>İPTAL</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── PROFILE ───────────────────────────────────────────────────────────────────
const ProfilePage = ({ karma, xp, onKarmaEarn, user, onLogout }) => {
  const username = user?.email?.split("@")[0]?.toUpperCase() || "KULLANICI";
  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <span className="eyebrow">profilim</span>
        <div className="pixel-sm" style={{ marginTop:6 }}>Yeteneklerini takas et, karma biriktir.</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:14 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="cw-card" style={{ padding:18, textAlign:"center", border:"1px solid var(--accent)", boxShadow:"0 0 24px rgba(167,139,250,0.1)", position:"relative" }}>
            <CT />
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <Av initials={username.slice(0,2)} color="var(--accent)" size={56} glow />
            </div>
            <div className="pixel-sm" style={{ color:"var(--accent)", marginBottom:3 }}>{username}</div>
            <div style={{ fontSize:10, color:"var(--fg-faint)", marginBottom:10 }}>{user?.email}</div>
            <Badge color="var(--accent-2)">⚔️ VİZYONER</Badge>
            <div style={{ margin:"12px 0 4px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>LV 1</span>
                <span className="pixel-xs" style={{ color:"var(--fg-faint)" }}>{xp}/100 XP</span>
              </div>
              <XPBar value={xp} />
            </div>
            <div className="pixel-sm" style={{ color:"var(--accent-2)", marginTop:10, fontSize:14, textShadow:"0 0 10px var(--accent-2)" }}>✦ {karma.toLocaleString()}</div>
            <div className="pixel-xs" style={{ color:"var(--fg-faint)", marginTop:2 }}>KARMA PUANI</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, margin:"12px 0 0", paddingTop:12, borderTop:"1px solid var(--line-2)" }}>
              {[["12","YARIŞ"],["3","START"],["247","K/GÜN"]].map(([n,l]) => (
                <div key={l}>
                  <div className="pixel-xs" style={{ color:"var(--accent)" }}>{n}</div>
                  <div style={{ fontSize:7, color:"var(--fg-faint)", marginTop:2, letterSpacing:"0.08em" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--line-2)" }}>
              <button className="cw-btn cw-btn-ghost" onClick={onLogout} style={{ width:"100%", justifyContent:"center", fontSize:6, borderColor:"var(--red)", color:"var(--red)" }}>ÇIKIŞ YAP</button>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="cw-card" style={{ padding:16 }}>
            <div className="pixel-xs" style={{ color:"var(--fg-faint)", marginBottom:14 }}>◆ BECERİLER</div>
            {SKILLS.map((s,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"var(--fg-dim)" }}>{s.n}</span>
                  <span className="pixel-xs" style={{ color:"var(--accent)" }}>{s.v}</span>
                </div>
                <XPBar value={s.v} />
              </div>
            ))}
          </div>

          <div className="cw-card" style={{ padding:16 }}>
            <div className="pixel-xs" style={{ color:"var(--fg-faint)", marginBottom:14 }}>◆ YETENEK TAKAS ET → KARMA KAZAN</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {ABILITIES.map(a => (
                <button key={a.n} onClick={() => onKarmaEarn(a.k)} className="cw-btn cw-btn-ghost"
                  style={{ justifyContent:"flex-start", padding:"10px 12px", fontSize:6, gap:10, transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.boxShadow="0 0 10px rgba(167,139,250,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--line-2)"; e.currentTarget.style.boxShadow="none"; }}>
                  <span style={{ fontSize:16 }}>{a.icon}</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ color:"var(--accent)", fontFamily:"var(--font-display)", fontSize:6 }}>{a.n}</div>
                    <div style={{ color:"var(--accent-2)", fontFamily:"var(--font-display)", fontSize:5, marginTop:2 }}>+{a.k} KARMA</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="cw-card" style={{ padding:16 }}>
            <div className="pixel-xs" style={{ color:"var(--fg-faint)", marginBottom:14 }}>◆ BAŞARIMLAR</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[{icon:"🚀",n:"First Launch",u:true},{icon:"🤝",n:"Team Player",u:true},{icon:"💰",n:"Seed Round",u:true},{icon:"🦄",n:"Unicorn",u:false},{icon:"🌍",n:"Global",u:false},{icon:"⭐",n:"Top 10",u:false}].map((a,i) => (
                <div key={i} style={{ padding:"8px 10px", textAlign:"center", border:`1px solid ${a.u?"var(--accent)":"var(--line-2)"}`, background:a.u?"rgba(167,139,250,0.08)":"transparent", opacity:a.u?1:0.35, transition:"all 0.2s" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{a.icon}</div>
                  <div className="pixel-xs" style={{ color:a.u?"var(--accent)":"var(--fg-faint)", fontSize:5 }}>{a.n}</div>
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
        const { data: profile } = await supabase.from("profiles").select("karma,xp").eq("id", u.id).single();
        if (profile) { setKarma(profile.karma||0); setXp(profile.xp||0); }
      }
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_,session) => setUser(session?.user??null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); setUser(null); setKarma(0); setXp(0); };

  const earnKarma = async (amount) => {
    const nk = karma + amount, nx = Math.min(100, xp + 5);
    setKarma(nk); setXp(nx); setToast(amount);
    setTimeout(() => setToast(null), 1400);
    if (user?.id) await supabase.from("profiles").update({ karma:nk, xp:nx }).eq("id", user.id);
  };

  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div className="pixel-sm" style={{ color:"var(--accent)", animation:"bob 1s ease-in-out infinite" }}>◆</div>
      <div className="pixel-xs" style={{ color:"var(--fg-faint)" }}>YÜKLENİYOR...</div>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  const username = user?.email?.split("@")[0]?.toUpperCase() || "?";

  const NAV = [
    { id:"plaza",    label:"GLOBAL PLAZA", icon:"🌍", count:"247" },
    { id:"chill",    label:"CHILL ZONE",   icon:"🌿", count:null },
    { id:"garage",   label:"GARAJLAR",     icon:"🏗️", count:"18" },
    { id:"contests", label:"YARIŞMALAR",   icon:"🏆", count:"3" },
    { id:"profile",  label:"PROFİLİM",     icon:"👤", count:null },
  ];

  return (
    <>
      <PixelCursor />
      {toast && <KarmaToast amount={toast} onDone={() => setToast(null)} />}

      {/* HEADER */}
      <header style={{ height:52, background:"rgba(10,10,15,0.88)", borderBottom:"1px solid var(--line-2)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", display:"flex", alignItems:"center", padding:"0 20px", gap:16, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div className="anim-bob" style={{ display:"inline-block" }}>
            <PixelIcon name="crown" size={3} />
          </div>
          <span className="pixel" style={{ fontSize:11, color:"var(--accent)", letterSpacing:"0.04em" }}>CAMPUSWE</span>
        </div>
        <div style={{ width:2, height:16, background:"var(--line-2)", flexShrink:0 }} />
        <input className="cw-input" placeholder="startup, kullanıcı veya beceri ara..." style={{ maxWidth:220, fontSize:11, height:30, padding:"0 10px" }} />
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", cursor:"pointer" }}>
            <div style={{ width:30, height:30, background:"var(--panel)", border:"1px solid var(--line-2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🔔</div>
            <div style={{ position:"absolute", top:-3, right:-3, width:13, height:13, background:"var(--red)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:5, color:"#fff", border:"2px solid var(--bg)" }}>3</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--panel)", border:"1px solid var(--accent)", padding:"4px 10px", boxShadow:"0 0 8px rgba(167,139,250,0.15)" }}>
            <span style={{ fontSize:11 }}>✦</span>
            <span className="pixel-xs" style={{ color:"var(--accent-2)" }}>{karma.toLocaleString()}</span>
          </div>
          <Av initials={username.slice(0,2)} color="var(--accent)" size={28} glow />
        </div>
      </header>

      {/* TICKER */}
      <div style={{ background:"rgba(10,10,15,0.7)", borderBottom:"1px solid var(--line-2)", height:26, overflow:"hidden", display:"flex", alignItems:"center" }}>
        <div style={{ padding:"0 12px", borderRight:"1px solid var(--line-2)", flexShrink:0 }}>
          <span className="pixel-xs" style={{ color:"var(--accent)", animation:"blink 1s infinite" }}>◆ LIVE</span>
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ display:"inline-block", animation:"marquee 26s linear infinite", whiteSpace:"nowrap", paddingLeft:"100%" }}>
            {[...TICKER,...TICKER].map((item,i) => (
              <span key={i} className="pixel-xs" style={{ marginRight:48, color:item.c }}>◆ {item.t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 78px)" }}>
        {/* SIDEBAR */}
        <aside style={{ width:214, background:"rgba(10,10,15,0.7)", borderRight:"1px solid var(--line-2)", backdropFilter:"blur(8px)", padding:"12px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto", flexShrink:0 }}>

          {/* Main nav */}
          {NAV.map(n => (
            <div key={n.id} onClick={() => setPage(n.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", color:page===n.id?"var(--accent)":"var(--fg-faint)", background:page===n.id?"rgba(167,139,250,0.08)":"transparent", border:`1px solid ${page===n.id?"rgba(167,139,250,0.3)":"transparent"}`, cursor:"pointer", transition:"all 0.15s", boxShadow:page===n.id?"0 0 8px rgba(167,139,250,0.1)":"none" }}
              onMouseEnter={e => { if(page!==n.id) e.currentTarget.style.background="var(--bg-2)"; }}
              onMouseLeave={e => { if(page!==n.id) e.currentTarget.style.background="transparent"; }}>
              <span>{n.icon}</span>
              <span className="pixel-xs" style={{ flex:1, color:"inherit" }}>{n.label}</span>
              {n.count && <span className="pixel-xs" style={{ background:"var(--bg-2)", border:"1px solid var(--line-2)", padding:"1px 5px", color:"var(--accent)" }}>{n.count}</span>}
            </div>
          ))}

          <div style={{ borderTop:"1px solid var(--line-2)", margin:"8px 0" }} />

          {/* My projects */}
          <div className="pixel-xs" style={{ padding:"4px 10px 6px", color:"var(--fg-faint)" }}>GİRİŞİMLERİM</div>
          {MY_PROJECTS.map((p,i) => (
            <div key={i} onClick={() => setPage("garage")} style={{ padding:"6px 10px", cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-2)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span className="pixel-xs" style={{ color:"var(--fg-dim)" }}>{p.name}</span>
                <span className="pixel-xs" style={{ color:"var(--accent)", fontSize:5 }}>{p.stage}</span>
              </div>
              <div style={{ height:2, background:"var(--line-2)" }}>
                <div style={{ height:"100%", width:`${p.prog}%`, background:"var(--accent)" }} />
              </div>
            </div>
          ))}
          <div onClick={() => setPage("garage")} style={{ padding:"4px 10px", cursor:"pointer" }}>
            <span className="pixel-xs" style={{ color:"var(--accent)", fontSize:5 }}>+ Yeni Girişim Başlat</span>
          </div>

          <div style={{ borderTop:"1px solid var(--line-2)", margin:"8px 0" }} />

          {/* Events */}
          <div className="pixel-xs" style={{ padding:"4px 10px 6px", color:"var(--fg-faint)" }}>ETKİNLİKLER</div>
          {EVENTS.slice(0,2).map((e,i) => (
            <div key={i} style={{ padding:"5px 10px", display:"flex", alignItems:"center", gap:8, cursor:"pointer", borderRadius:0, transition:"background 0.15s" }}
              onMouseEnter={ev => ev.currentTarget.style.background="var(--bg-2)"}
              onMouseLeave={ev => ev.currentTarget.style.background="transparent"}>
              <div style={{ width:3, height:28, background:e.color, flexShrink:0 }} />
              <div>
                <div className="pixel-xs" style={{ color:"var(--fg-dim)", fontSize:6 }}>{e.title}</div>
                <div style={{ fontSize:9, color:"var(--fg-faint)" }}>{e.time} · {e.host}</div>
              </div>
            </div>
          ))}
          <div onClick={() => setPage("chill")} style={{ padding:"4px 10px", cursor:"pointer" }}>
            <span className="pixel-xs" style={{ color:"var(--accent)", fontSize:5 }}>Tümünü gör ›</span>
          </div>

          <div style={{ borderTop:"1px solid var(--line-2)", margin:"8px 0" }} />

          {/* MatchMaker */}
          <div style={{ background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.2)", padding:10, margin:"0 0 4px" }}>
            <div className="pixel-xs" style={{ color:"var(--accent)", marginBottom:6 }}>🤖 MATCHMAKER AI</div>
            <div style={{ fontSize:11, color:"var(--fg-faint)", marginBottom:8 }}>3 yeni eşleşme bulundu</div>
            <button className="cw-btn cw-btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:5, padding:"6px 8px" }}>GÖRÜNTÜLE</button>
          </div>

          {/* XP bottom */}
          <div style={{ marginTop:"auto", padding:"8px 10px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span className="pixel-xs" style={{ color:"var(--fg-faint)", fontSize:5 }}>{username}</span>
              <span className="pixel-xs" style={{ color:"var(--accent)", fontSize:5 }}>{xp} XP</span>
            </div>
            <XPBar value={xp} />
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, overflowY:"auto", padding:20 }}>
          {/* Page header */}
          <div style={{ marginBottom:16, paddingBottom:12, borderBottom:"1px solid var(--line-2)", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>{NAV.find(n => n.id===page)?.icon}</span>
            <span className="pixel-sm" style={{ color:"var(--accent)" }}>{NAV.find(n => n.id===page)?.label}</span>
            {NAV.find(n => n.id===page)?.count && <Badge color="var(--accent)">{NAV.find(n => n.id===page)?.count} AKTİF</Badge>}
          </div>

          {page === "plaza"    && <GlobalPlaza user={user} onKarmaEarn={earnKarma} />}
          {page === "chill"    && <ChillZone onKarmaEarn={earnKarma} />}
          {page === "garage"   && <Garage />}
          {page === "contests" && <ContestsPage />}
          {page === "profile"  && <ProfilePage karma={karma} xp={xp} onKarmaEarn={earnKarma} user={user} onLogout={logout} />}
        </main>
      </div>
    </>
  );
}