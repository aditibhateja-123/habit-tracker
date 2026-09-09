import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Home, Droplets, Activity, ListChecks, BarChart3, Sun, Moon, Sprout, Flame,
  ChevronLeft, ChevronRight, Plus, Trash2, Check, MessageCircle, Send, X, Bot, ShieldAlert,
} from "lucide-react";

/* ---------------------------------- data ---------------------------------- */

const CONDITIONS = {
  general: {
    label: "General cycle health",
    symptomsExtra: [],
    tips: [
      "Tracking for two or three cycles is usually enough to learn your personal pattern.",
      "Iron-rich foods can help on heavier flow days.",
      "Gentle movement often eases cramps better than resting completely still.",
    ],
  },
  pcos: {
    label: "PCOS / PCOD",
    symptomsExtra: ["Acne", "Excess hair growth", "Hair thinning", "Weight changes", "Sugar cravings", "Irregular cycle length"],
    tips: [
      "Regular meals with protein and fibre can help keep blood sugar steady.",
      "Strength training is linked to better insulin sensitivity over time.",
      "Irregular cycles are common with PCOS/PCOD — track your own pattern rather than expecting a fixed length.",
    ],
  },
  endometriosis: {
    label: "Endometriosis",
    symptomsExtra: ["Pelvic pain", "Pain during sex", "Painful bowel movements", "Heavy bleeding", "Nausea"],
    tips: [
      "A heat pack on the lower abdomen or back can ease pelvic pain for some people.",
      "A pain diary makes it much easier to talk to a doctor about patterns.",
      "Ask a nutritionist about anti-inflammatory foods like oily fish and leafy greens.",
    ],
  },
  menopause: {
    label: "Menopause / perimenopause",
    symptomsExtra: ["Hot flashes", "Night sweats", "Sleep trouble", "Brain fog", "Joint pain", "Vaginal dryness", "Irregular periods"],
    tips: [
      "Layered clothing and a cool room can take the edge off hot flashes.",
      "Weight-bearing exercise supports bone density through this transition.",
      "A consistent wind-down routine can help with the sleep changes many people notice.",
    ],
  },
};

const GENERAL_SYMPTOMS = ["Cramps", "Headache", "Fatigue", "Bloating", "Mood swings", "Back pain", "Breast tenderness"];

const MOODS = ["Great", "Okay", "Low", "Irritable", "Anxious"];
const FLOWS = ["Spotting", "Light", "Medium", "Heavy"];

const COMMON_HABITS = [
  { id: "water", label: "Drink 8 glasses of water" },
  { id: "move", label: "Move your body for 20 minutes" },
  { id: "sleep", label: "Get 7+ hours of sleep" },
  { id: "moodcheck", label: "Check in with your mood" },
];

const CONDITION_HABITS = {
  general: [],
  pcos: [
    { id: "lowgi", label: "Eat a low-GI meal" },
    { id: "strength", label: "Do strength training" },
    { id: "meds", label: "Take medication or supplement" },
  ],
  endometriosis: [
    { id: "painmeds", label: "Take pain relief as prescribed" },
    { id: "heat", label: "Use a heat pack" },
    { id: "antiinflam", label: "Eat an anti-inflammatory meal" },
  ],
  menopause: [
    { id: "calcium", label: "Get calcium & vitamin D" },
    { id: "cooling", label: "Cool down before bed" },
    { id: "weightbearing", label: "Do weight-bearing exercise" },
  ],
};

const PHASE_META = {
  menstrual: { label: "Menstrual", color: "var(--menstrual)", tint: "var(--menstrual-tint)", icon: Droplets, blurb: "Your period. Rest when you need to — iron-rich food helps replace what you lose." },
  follicular: { label: "Follicular", color: "var(--follicular)", tint: "var(--follicular-tint)", icon: Sprout, blurb: "Energy tends to build here. A good window for starting new habits." },
  ovulatory: { label: "Ovulatory", color: "var(--ovulatory)", tint: "var(--ovulatory-tint)", icon: Sun, blurb: "Around your fertile window. Energy and mood often peak." },
  luteal: { label: "Luteal", color: "var(--luteal)", tint: "var(--luteal-tint)", icon: Moon, blurb: "The run-up to your next period. Cravings and mood dips are common here." },
};

const DEFAULT_PROFILE = { condition: "general", avgCycleLength: 28, avgPeriodLength: 5 };

/* ------------------------------ symptom advice ------------------------------ */

const SYMPTOM_ADVICE = {
  "Cramps": [
    "A heat pack on your lower abdomen or a warm bath can take the edge off.",
    "Light movement or stretching sometimes helps more than lying still.",
  ],
  "Headache": [
    "Check you're drinking enough water — dehydration is a common trigger around your period.",
    "A dark, quiet room and a short rest can help if it's tension-related.",
  ],
  "Fatigue": [
    "Iron-rich foods (leafy greens, lentils, red meat) can help if your flow is heavy.",
    "It's fine to scale back workouts on low-energy days — gentle movement still counts.",
  ],
  "Bloating": [
    "Cutting back on salty or processed food for a day or two can ease water retention.",
    "Peppermint or ginger tea is a low-risk thing some people find soothing.",
  ],
  "Mood swings": [
    "A short walk or a few minutes of quiet can help take the edge off.",
    "Naming what you're feeling to someone you trust often makes it easier to sit with.",
  ],
  "Back pain": [
    "A heat pack on your lower back, or a gentle stretch, can help.",
    "Notice if it's worse on heavier flow days — that pattern is worth mentioning to a doctor.",
  ],
  "Breast tenderness": [
    "A supportive, well-fitted bra can make a real difference on tender days.",
    "This usually settles once your period starts — worth flagging to a doctor if it lingers well past that.",
  ],
  "Acne": [
    "Stick to a gentle, non-stripping skincare routine — over-treating can make hormonal breakouts worse.",
    "A dermatologist can help if it's persistent — there are options beyond over-the-counter products.",
  ],
  "Excess hair growth": [
    "This is a common PCOS/PCOD symptom tied to hormone levels — it's not something to manage alone.",
    "A doctor can talk through options, from cosmetic approaches to medication that addresses the underlying cause.",
  ],
  "Hair thinning": [
    "Gentle hair care (less heat, less tension from tight styles) can help limit further stress on hair.",
    "Ask a doctor about checking iron and thyroid levels — both can contribute to hair thinning.",
  ],
  "Weight changes": [
    "Small, consistent habits (regular meals, movement you enjoy) tend to help more than drastic changes.",
    "PCOS/PCOD can make weight harder to manage through willpower alone — a doctor or dietitian can help build a plan suited to you.",
  ],
  "Sugar cravings": [
    "Pairing carbs with protein or fibre can help smooth out the energy dips that drive cravings.",
    "Cravings that feel intense and frequent are worth mentioning to a doctor, especially alongside PCOS/PCOD.",
  ],
  "Irregular cycle length": [
    "Track it for a few cycles — a pattern, even an irregular one, is more useful to a doctor than a single unusual month.",
    "This is common with PCOS/PCOD, but still worth discussing at a checkup.",
  ],
  "Pelvic pain": [
    "A heat pack and rest can help with milder pelvic pain.",
    "Pain that's severe, sudden, or disrupts your day is worth getting checked rather than just managed at home.",
  ],
  "Pain during sex": [
    "This is common with conditions like endometriosis and is worth raising with a doctor rather than working around quietly.",
    "There are treatment options — this isn't something you have to just live with.",
  ],
  "Painful bowel movements": [
    "Note when this happens relative to your cycle — that timing pattern is useful information for a doctor.",
    "Persistent pain here, especially around your period, is a recognised sign worth checking out.",
  ],
  "Heavy bleeding": [
    "If you're soaking through a pad or tampon every hour for several hours in a row, please contact a doctor — that level of bleeding needs a proper check.",
    "Keeping a rough count of how many products you use per day helps a doctor assess this quickly.",
  ],
  "Nausea": [
    "Small, plain meals (crackers, toast, ginger tea) are often easier to manage than large meals.",
    "Nausea alongside severe pain is worth getting checked rather than waiting out.",
  ],
  "Hot flashes": [
    "Layered clothing and a cool room or fan nearby can help take the edge off.",
    "Cold water or a cool cloth on your neck can help in the moment.",
  ],
  "Night sweats": [
    "Breathable bedding and sleepwear can reduce how disruptive these are.",
    "Keeping a glass of cool water by the bed helps some people get back to sleep faster.",
  ],
  "Sleep trouble": [
    "A consistent wind-down routine and less screen time before bed can help with hormone-related sleep changes.",
    "A cooler room can help if night sweats are part of what's disrupting sleep.",
  ],
  "Brain fog": [
    "This is a real, commonly reported symptom during hormonal shifts — it's not \"just you.\"",
    "Breaking tasks into smaller steps and writing things down can help on foggier days.",
  ],
  "Joint pain": [
    "Gentle movement, like walking or swimming, often helps more than resting completely still.",
    "Persistent or worsening joint pain is worth mentioning at a checkup.",
  ],
  "Vaginal dryness": [
    "Over-the-counter lubricants or moisturisers designed for this can help day to day.",
    "A doctor can talk through longer-term options if this is affecting your comfort regularly.",
  ],
  "Irregular periods": [
    "Track what you're noticing for a couple of cycles — the pattern matters more than any single month.",
    "Irregularity is common around perimenopause, but still worth a checkup to rule out other causes.",
  ],
};

/* -------------------------------- chat assistant ------------------------------- */

const CHAT_WELCOME = "Hi, I'm the Ritu Assistant — think of me as a knowledgeable companion for period, PCOS/PCOD, endometriosis and menopause questions. I'm not a doctor and can't diagnose anything, but I can share general self-care guidance and help you figure out when it's worth seeing one.";

const CHAT_QUICK_PROMPTS = [
  "My cramps are really bad",
  "My periods are irregular",
  "What helps with PCOS?",
  "I'm getting hot flashes",
  "When should I see a doctor?",
];

const EMERGENCY_PATTERNS = [
  /soak(ing|ed)?\s+(a|through|every)\s*(pad|tampon)/i,
  /heavy bleeding/i,
  /can'?t stop bleeding/i,
  /faint(ed|ing)?/i,
  /unbearable pain/i,
  /severe (pain|cramps)/i,
  /chest pain/i,
  /can'?t breathe/i,
  /high fever/i,
  /suicid|self.?harm/i,
];

function findChatReply(text) {
  const t = text.toLowerCase();

  if (EMERGENCY_PATTERNS.some((re) => re.test(t))) {
    return "That sounds like it could need urgent attention. Please contact a doctor, your nearest clinic, or emergency services now rather than waiting on advice here — I can't judge how serious this is, and a professional can.";
  }

  const matchedSymptoms = Object.keys(SYMPTOM_ADVICE).filter((s) => t.includes(s.toLowerCase()));
  if (matchedSymptoms.length) {
    return matchedSymptoms
      .map((s) => `For ${s.toLowerCase()}: ${SYMPTOM_ADVICE[s][0]}`)
      .join("\n\n") + "\n\nYou can log this in the Symptoms tab to track whether it's a one-off or a pattern.";
  }

  if (/pcos|pcod/.test(t)) return CONDITIONS.pcos.tips.join(" ");
  if (/endo/.test(t)) return CONDITIONS.endometriosis.tips.join(" ");
  if (/menopaus|perimenopaus/.test(t)) return CONDITIONS.menopause.tips.join(" ");
  if (/irregular|late period|missed period/.test(t)) {
    return "Irregular cycles have a lot of possible causes — stress, PCOS/PCOD, perimenopause, and more. Logging a couple of cycles in the Cycle tab will give you and a doctor something concrete to look at.";
  }
  if (/doctor|gynaecologist|gynecologist|worried|should i see/.test(t)) {
    return "It's worth seeing a doctor if a symptom is severe, sudden, getting worse, or just doesn't sit right with you — trust that instinct. Bringing your logs from the Insights tab can make the appointment more useful.";
  }
  if (/pill|contracept|birth control|medication|dosage/.test(t)) {
    return "Anything about medication, dosage, or contraception really needs a doctor or pharmacist who knows your history — I'd rather not guess at something that specific.";
  }

  return "I don't have a specific note on that yet — I can share general self-care guidance for things like cramps, bloating, mood swings, acne, hot flashes, and more. You can also try one of the quick questions below, or bring this up with a doctor.";
}

/* --------------------------------- helpers --------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 9);
const isoDate = (d) => {
  const dt = new Date(d);
  const tz = dt.getTimezoneOffset();
  return new Date(dt.getTime() - tz * 60000).toISOString().slice(0, 10);
};
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
const diffDays = (a, b) => Math.round((new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / 86400000);
const fmtShort = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fmtLong = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, endAngle);
  const e = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", s.x, s.y, "A", r, r, 0, largeArcFlag, 0, e.x, e.y].join(" ");
}

function mergeHabitsForCondition(existingDefs, condition) {
  const wanted = [...COMMON_HABITS, ...(CONDITION_HABITS[condition] || [])];
  const existingIds = new Set(existingDefs.map((h) => h.id));
  const added = wanted.filter((h) => !existingIds.has(h.id)).map((h) => ({ ...h, active: true, custom: false }));
  return [...existingDefs, ...added];
}

/* ---------------------------------- storage --------------------------------- */

async function loadKey(key) {
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("Could not save", key, e);
  }
}

/* --------------------------------- components -------------------------------- */

function PhaseWheel({ cycleDay, avgCycle, avgPeriod, ovulationDay }) {
  const cx = 110, cy = 110, r = 82;
  const menstrualEnd = avgPeriod;
  const follicularEnd = Math.max(menstrualEnd + 1, ovulationDay - 2);
  const ovulatoryEnd = Math.min(avgCycle - 1, ovulationDay + 1);
  const dayToAngle = (day) => (Math.max(0, Math.min(day, avgCycle)) / avgCycle) * 360;

  const segments = [
    { key: "menstrual", start: 0, end: menstrualEnd },
    { key: "follicular", start: menstrualEnd, end: follicularEnd },
    { key: "ovulatory", start: follicularEnd, end: ovulatoryEnd },
    { key: "luteal", start: ovulatoryEnd, end: avgCycle },
  ].filter((s) => s.end > s.start);

  const markerDay = ((cycleDay - 1) % avgCycle) + 1;
  const markerAngle = dayToAngle(markerDay - 0.5);
  const markerPos = polarToCartesian(cx, cy, r, markerAngle);

  return (
    <svg viewBox="0 0 220 220" className="phase-wheel" role="img" aria-label="Cycle phase wheel">
      {segments.map((s) => (
        <path
          key={s.key}
          d={describeArc(cx, cy, r, dayToAngle(s.start), dayToAngle(s.end))}
          stroke={PHASE_META[s.key].color}
          strokeWidth="16"
          fill="none"
          strokeLinecap="butt"
        />
      ))}
      <circle cx={markerPos.x} cy={markerPos.y} r="7" fill="var(--ink)" stroke="var(--surface)" strokeWidth="2" />
      <text x={cx} y={cy - 6} textAnchor="middle" className="wheel-day">{cycleDay}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="wheel-label">day of cycle</text>
    </svg>
  );
}

function MonthCalendar({ viewMonth, onPrev, onNext, periods, cycleStats, todayIso }) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoDate(new Date(year, month, d)));

  const isPeriodDay = (iso) =>
    periods.some((p) => iso >= p.start && iso <= (p.end || p.start >= todayIso ? p.end || todayIso : p.end || p.start));
  const inPeriod = (iso) => periods.some((p) => {
    const end = p.end || (p.start <= todayIso ? todayIso : p.start);
    return iso >= p.start && iso <= end;
  });

  const predictedStart = cycleStats ? cycleStats.nextPeriodDate : null;
  const predictedEnd = predictedStart ? addDays(predictedStart, cycleStats.avgPeriod - 1) : null;
  const inPredicted = (iso) => predictedStart && iso >= predictedStart && iso <= predictedEnd;
  const ovulationIso = cycleStats ? addDays(cycleStats.lastStart, cycleStats.ovulationDay - 1) : null;

  return (
    <div className="cal">
      <div className="cal-head">
        <button className="icon-btn" onClick={onPrev} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <div className="cal-title">{viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
        <button className="icon-btn" onClick={onNext} aria-label="Next month"><ChevronRight size={18} /></button>
      </div>
      <div className="cal-grid cal-dow">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="cal-dow-cell">{d}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="cal-cell empty" />;
          const period = inPeriod(iso);
          const predicted = !period && inPredicted(iso);
          const ovulation = iso === ovulationIso;
          const today = iso === todayIso;
          return (
            <div key={i} className={`cal-cell${today ? " today" : ""}${period ? " period" : ""}${predicted ? " predicted" : ""}`}>
              <span>{Number(iso.slice(-2))}</span>
              {ovulation && <span className="ov-dot" />}
            </div>
          );
        })}
      </div>
      <div className="cal-legend">
        <span><i className="dot" style={{ background: "var(--menstrual)" }} /> Period</span>
        <span><i className="dot outline" /> Predicted period</span>
        <span><i className="dot" style={{ background: "var(--ovulatory)" }} /> Predicted ovulation</span>
      </div>
    </div>
  );
}

function HabitRow({ habit, done, streak, onToggle, onRemove }) {
  return (
    <div className="habit-row">
      <button className={`check${done ? " done" : ""}`} onClick={onToggle} aria-label={done ? "Mark not done" : "Mark done"}>
        {done && <Check size={14} strokeWidth={3} />}
      </button>
      <div className="habit-label">{habit.label}</div>
      <div className="habit-streak">{streak > 0 ? `${streak}-day streak` : ""}</div>
      {habit.custom && <button className="text-btn danger" onClick={onRemove}><Trash2 size={14} /></button>}
    </div>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: uid(), from: "bot", text: CHAT_WELCOME }]);
  const [input, setInput] = useState("");

  const send = (text) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg = { id: uid(), from: "user", text: clean };
    const botMsg = { id: uid(), from: "bot", text: findChatReply(clean) };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close Ritu assistant" : "Open Ritu assistant"}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div className="chat-head-title"><Bot size={16} /> Ritu Assistant</div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="chat-disclaimer"><ShieldAlert size={13} /> Not a doctor — general guidance only. For anything urgent, contact a healthcare provider.</div>
          <div className="chat-body">
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-quick">
            {CHAT_QUICK_PROMPTS.map((q) => (
              <button key={q} className="chat-chip" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a symptom or condition..."
              onKeyDown={(e) => e.key === "Enter" && send(input)}
            />
            <button className="icon-btn send" onClick={() => send(input)} aria-label="Send"><Send size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
}

/* ----------------------------------- app ------------------------------------ */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [periods, setPeriods] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [habitDefs, setHabitDefs] = useState([]);
  const [habitCompletions, setHabitCompletions] = useState({});
  const [tab, setTab] = useState("dashboard");

  const today = isoDate(new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, per, sym, hab] = await Promise.all([
        loadKey("ritu:profile"), loadKey("ritu:periods"), loadKey("ritu:symptomLogs"), loadKey("ritu:habits"),
      ]);
      if (cancelled) return;
      setProfile(p || DEFAULT_PROFILE);
      setPeriods(per || []);
      setSymptomLogs(sym || []);
      if (hab) { setHabitDefs(hab.defs || []); setHabitCompletions(hab.completions || {}); }
      else { setHabitDefs(COMMON_HABITS.map((h) => ({ ...h, active: true, custom: false }))); setHabitCompletions({}); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const updateProfile = (patch) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      saveKey("ritu:profile", next);
      if (patch.condition && patch.condition !== prev.condition) {
        const merged = mergeHabitsForCondition(habitDefs, patch.condition);
        setHabitDefs(merged);
        saveKey("ritu:habits", { defs: merged, completions: habitCompletions });
      }
      return next;
    });
  };
  const updatePeriods = (next) => { setPeriods(next); saveKey("ritu:periods", next); };
  const updateSymptomLogs = (next) => { setSymptomLogs(next); saveKey("ritu:symptomLogs", next); };
  const updateHabits = (defs, completions) => { setHabitDefs(defs); setHabitCompletions(completions); saveKey("ritu:habits", { defs, completions }); };

  const sortedPeriods = useMemo(() => [...periods].sort((a, b) => (a.start > b.start ? 1 : -1)), [periods]);

  const cycleStats = useMemo(() => {
    if (sortedPeriods.length === 0) return null;
    const last = sortedPeriods[sortedPeriods.length - 1];
    const lastStart = last.start;
    const cycleDay = diffDays(today, lastStart) + 1;
    let cycleLengths = [];
    for (let i = 1; i < sortedPeriods.length; i++) cycleLengths.push(diffDays(sortedPeriods[i].start, sortedPeriods[i - 1].start));
    const avgCycle = cycleLengths.length ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : profile.avgCycleLength;
    const periodLengths = sortedPeriods.filter((p) => p.end).map((p) => diffDays(p.end, p.start) + 1);
    const avgPeriod = periodLengths.length ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : profile.avgPeriodLength;
    const ovulationDay = Math.max(avgPeriod + 1, avgCycle - 14);
    let phase;
    if (cycleDay <= avgPeriod) phase = "menstrual";
    else if (cycleDay < ovulationDay - 1) phase = "follicular";
    else if (cycleDay <= ovulationDay + 1) phase = "ovulatory";
    else phase = "luteal";
    const nextPeriodDate = addDays(lastStart, avgCycle);
    const daysUntilNext = diffDays(nextPeriodDate, today);
    return { cycleDay, avgCycle, avgPeriod, ovulationDay, phase, nextPeriodDate, daysUntilNext, lastStart };
  }, [sortedPeriods, profile, today]);

  const activeHabits = habitDefs.filter((h) => h.active);
  const suggestedInactive = useMemo(() => {
    const wanted = [...COMMON_HABITS, ...(CONDITION_HABITS[profile.condition] || [])];
    const currentIds = new Set(habitDefs.map((h) => h.id));
    return habitDefs.filter((h) => !h.active && wanted.some((w) => w.id === h.id));
  }, [habitDefs, profile.condition]);

  const getStreak = (habitId) => {
    let streak = 0, d = today;
    while ((habitCompletions[d] || []).includes(habitId)) { streak++; d = addDays(d, -1); }
    return streak;
  };
  const toggleHabitToday = (habitId) => {
    const cur = habitCompletions[today] || [];
    const next = cur.includes(habitId) ? cur.filter((id) => id !== habitId) : [...cur, habitId];
    updateHabits(habitDefs, { ...habitCompletions, [today]: next });
  };

  const symptomOptions = [...GENERAL_SYMPTOMS, ...CONDITIONS[profile.condition].symptomsExtra];

  if (loading) {
    return (
      <div className="ritu-app">
        <Style />
        <div className="loading-screen">Loading your data…</div>
      </div>
    );
  }

  const NAV = [
    { id: "dashboard", label: "Today", icon: Home },
    { id: "cycle", label: "Cycle", icon: Droplets },
    { id: "symptoms", label: "Symptoms", icon: Activity },
    { id: "habits", label: "Habits", icon: ListChecks },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];

  return (
    <div className="ritu-app">
      <Style />
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">Ritu</div>
            <div className="brand-tag">track your rhythm</div>
          </div>
          <nav>
            {NAV.map((n) => (
              <button key={n.id} className={`navitem${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
                <n.icon size={17} /><span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-foot">Not a diagnostic tool. For persistent or severe symptoms, please see a doctor.</div>
        </aside>

        <main className="content">
          <div className="topbar-mobile">
            <div className="brand-mark small">Ritu</div>
          </div>

          {tab === "dashboard" && (
            <Dashboard
              profile={profile} updateProfile={updateProfile}
              cycleStats={cycleStats} today={today}
              activeHabits={activeHabits} habitCompletions={habitCompletions}
              toggleHabitToday={toggleHabitToday} getStreak={getStreak}
              updatePeriods={updatePeriods} periods={periods}
              symptomLogs={symptomLogs}
              goTo={setTab}
            />
          )}

          {tab === "cycle" && (
            <CycleTab
              profile={profile} updateProfile={updateProfile}
              periods={periods} updatePeriods={updatePeriods}
              cycleStats={cycleStats} today={today}
            />
          )}

          {tab === "symptoms" && (
            <SymptomsTab
              profile={profile} symptomOptions={symptomOptions}
              symptomLogs={symptomLogs} updateSymptomLogs={updateSymptomLogs}
              today={today}
            />
          )}

          {tab === "habits" && (
            <HabitsTab
              habitDefs={habitDefs} habitCompletions={habitCompletions}
              updateHabits={updateHabits} activeHabits={activeHabits}
              suggestedInactive={suggestedInactive}
              toggleHabitToday={toggleHabitToday} getStreak={getStreak}
              today={today}
            />
          )}

          {tab === "insights" && (
            <InsightsTab
              sortedPeriods={sortedPeriods} symptomLogs={symptomLogs}
              activeHabits={activeHabits} habitCompletions={habitCompletions}
              today={today}
            />
          )}
        </main>
      </div>

      <div className="tabbar-mobile">
        {NAV.map((n) => (
          <button key={n.id} className={`tabitem${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            <n.icon size={19} /><span>{n.label}</span>
          </button>
        ))}
      </div>

      <ChatWidget />
    </div>
  );
}

/* ---------------------------------- Dashboard ---------------------------------- */

function Dashboard({ profile, updateProfile, cycleStats, today, activeHabits, habitCompletions, toggleHabitToday, getStreak, updatePeriods, periods, symptomLogs, goTo }) {
  const [quickStart, setQuickStart] = useState("");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const doneToday = habitCompletions[today] || [];

  const weekAgo = addDays(today, -6);
  const recentSymptoms = symptomLogs.filter((s) => s.date >= weekAgo);
  const tally = {};
  recentSymptoms.forEach((s) => s.symptoms.forEach((sym) => { tally[sym] = (tally[sym] || 0) + 1; }));
  const topSymptom = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="tab-panel">
      <div className="section-head">
        <h1 className="page-title">{greeting}</h1>
        <select className="pill-select" value={profile.condition} onChange={(e) => updateProfile({ condition: e.target.value })}>
          {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {profile.condition !== "menopause" ? (
        cycleStats ? (
          <section className="section">
            <div className="phase-row">
              <PhaseWheel cycleDay={cycleStats.cycleDay} avgCycle={cycleStats.avgCycle} avgPeriod={cycleStats.avgPeriod} ovulationDay={cycleStats.ovulationDay} />
              <div className="phase-info">
                <div className="phase-name" style={{ color: PHASE_META[cycleStats.phase].color }}>{PHASE_META[cycleStats.phase].label} phase</div>
                <p className="phase-blurb">{PHASE_META[cycleStats.phase].blurb}</p>
                <div className="stat-line">Next period expected {fmtLong(cycleStats.nextPeriodDate)} ({cycleStats.daysUntilNext >= 0 ? `in ${cycleStats.daysUntilNext} days` : `${-cycleStats.daysUntilNext} days ago — log it below`})</div>
                {cycleStats.cycleDay > cycleStats.avgCycle * 1.15 && (
                  <div className="note-flag">Running longer than your average — common with PCOS/PCOD, but worth noting.</div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="section onboard">
            <div className="onboard-copy">Log your last period's start date to see your cycle and predictions.</div>
            <div className="row-inline">
              <input type="date" className="input" value={quickStart} max={today} onChange={(e) => setQuickStart(e.target.value)} />
              <button className="btn btn-primary" disabled={!quickStart} onClick={() => { updatePeriods([...periods, { id: uid(), start: quickStart, end: null, flow: "Medium" }]); setQuickStart(""); }}>Save</button>
            </div>
          </section>
        )
      ) : (
        <section className="section">
          <div className="stat-grid">
            <div className="stat-box"><Flame size={18} color="var(--menstrual)" /><div><div className="stat-num">{recentSymptoms.length}</div><div className="stat-cap">symptoms logged this week</div></div></div>
            <div className="stat-box"><Activity size={18} color="var(--luteal)" /><div><div className="stat-num">{topSymptom ? topSymptom[0] : "—"}</div><div className="stat-cap">most common this week</div></div></div>
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Today's habits</h2>
        {activeHabits.length === 0 ? (
          <p className="empty-copy">No habits set up yet. Add some from the Habits tab.</p>
        ) : (
          <div className="habit-list">
            {activeHabits.map((h) => (
              <HabitRow key={h.id} habit={h} done={doneToday.includes(h.id)} streak={getStreak(h.id)} onToggle={() => toggleHabitToday(h.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="section quiet">
        <button className="link-btn" onClick={() => goTo("symptoms")}>Log how you're feeling today →</button>
      </section>
    </div>
  );
}

/* ----------------------------------- Cycle ------------------------------------ */

function CycleTab({ profile, updateProfile, periods, updatePeriods, cycleStats, today }) {
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState("");
  const [flow, setFlow] = useState("Medium");
  const [viewMonth, setViewMonth] = useState(new Date());

  const openPeriod = [...periods].sort((a, b) => (a.start > b.start ? -1 : 1)).find((p) => !p.end);

  const savePeriod = () => {
    if (!start) return;
    const existingIdx = periods.findIndex((p) => p.start === start);
    let next;
    if (existingIdx >= 0) {
      next = periods.map((p, i) => (i === existingIdx ? { ...p, end: end || null, flow } : p));
    } else {
      next = [...periods, { id: uid(), start, end: end || null, flow }];
    }
    updatePeriods(next);
    setEnd("");
  };

  const endOpenPeriodToday = () => {
    if (!openPeriod) return;
    updatePeriods(periods.map((p) => (p.id === openPeriod.id ? { ...p, end: today } : p)));
  };

  return (
    <div className="tab-panel">
      <h1 className="page-title">Cycle</h1>

      <section className="section">
        <h2 className="section-title">Log a period</h2>
        <div className="form-row">
          <label className="field">
            <span>Start date</span>
            <input type="date" className="input" value={start} max={today} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="field">
            <span>End date (optional)</span>
            <input type="date" className="input" value={end} max={today} min={start} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <div className="pill-group">
          {FLOWS.map((f) => (
            <button key={f} className={`pill${flow === f ? " active" : ""}`} onClick={() => setFlow(f)}>{f}</button>
          ))}
        </div>
        <div className="row-inline">
          <button className="btn btn-primary" onClick={savePeriod}>Save period</button>
          {openPeriod && <button className="btn btn-ghost" onClick={endOpenPeriodToday}>End current period today</button>}
        </div>
      </section>

      {cycleStats && (
        <section className="section">
          <h2 className="section-title">This cycle</h2>
          <div className="stat-grid">
            <div className="stat-box"><div><div className="stat-num">{cycleStats.cycleDay}</div><div className="stat-cap">day of cycle</div></div></div>
            <div className="stat-box"><div><div className="stat-num">{cycleStats.avgCycle}</div><div className="stat-cap">avg. cycle length</div></div></div>
            <div className="stat-box"><div><div className="stat-num">{cycleStats.avgPeriod}</div><div className="stat-cap">avg. period length</div></div></div>
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Calendar</h2>
        <MonthCalendar
          viewMonth={viewMonth}
          onPrev={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          onNext={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          periods={periods} cycleStats={cycleStats} todayIso={today}
        />
      </section>

      <section className="section">
        <h2 className="section-title">Settings</h2>
        <div className="form-row">
          <label className="field">
            <span>Focus area</span>
            <select className="input" value={profile.condition} onChange={(e) => updateProfile({ condition: e.target.value })}>
              {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            <span>Average cycle length (days)</span>
            <input type="number" className="input" min="15" max="60" value={profile.avgCycleLength} onChange={(e) => updateProfile({ avgCycleLength: Number(e.target.value) || 28 })} />
          </label>
          <label className="field">
            <span>Average period length (days)</span>
            <input type="number" className="input" min="1" max="15" value={profile.avgPeriodLength} onChange={(e) => updateProfile({ avgPeriodLength: Number(e.target.value) || 5 })} />
          </label>
        </div>
        <p className="empty-copy">These are used as a starting estimate until you've logged a couple of real cycles.</p>
      </section>
    </div>
  );
}

/* --------------------------------- Symptoms ------------------------------------ */

function SymptomsTab({ profile, symptomOptions, symptomLogs, updateSymptomLogs, today }) {
  const [date, setDate] = useState(today);
  const existing = symptomLogs.find((l) => l.date === date);
  const [symptoms, setSymptoms] = useState(existing ? existing.symptoms : []);
  const [pain, setPain] = useState(existing ? existing.pain : 0);
  const [mood, setMood] = useState(existing ? existing.mood : "");
  const [notes, setNotes] = useState(existing ? existing.notes : "");

  useEffect(() => {
    const e = symptomLogs.find((l) => l.date === date);
    setSymptoms(e ? e.symptoms : []);
    setPain(e ? e.pain : 0);
    setMood(e ? e.mood : "");
    setNotes(e ? e.notes : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const toggleSymptom = (s) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const save = () => {
    const entry = { id: existing ? existing.id : uid(), date, symptoms, pain, mood, notes };
    const next = existing ? symptomLogs.map((l) => (l.date === date ? entry : l)) : [...symptomLogs, entry];
    updateSymptomLogs(next);
  };

  const history = [...symptomLogs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10);

  return (
    <div className="tab-panel">
      <h1 className="page-title">Symptoms</h1>

      <section className="section">
        <div className="form-row">
          <label className="field">
            <span>Date</span>
            <input type="date" className="input" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <h2 className="section-title">What are you noticing?</h2>
        <div className="pill-group wrap">
          {symptomOptions.map((s) => (
            <button key={s} className={`pill${symptoms.includes(s) ? " active" : ""}`} onClick={() => toggleSymptom(s)}>{s}</button>
          ))}
        </div>

        {symptoms.length > 0 && (
          <div className="advice-list">
            {symptoms.map((s) => (
              <div key={s} className="advice-card">
                <div className="advice-symptom">What might help with {s.toLowerCase()}</div>
                <ul>
                  {(SYMPTOM_ADVICE[s] || ["Log this for a cycle or two — a pattern is easier to act on than a single day."]).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <label className="field full">
          <span>Pain level: {pain}/10</span>
          <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))} />
        </label>

        {(pain >= 8 || symptoms.includes("Heavy bleeding")) && (
          <div className="note-flag urgent"><ShieldAlert size={14} /> This is worth discussing with a doctor soon — especially if it's new, sudden, or getting worse.</div>
        )}

        <h2 className="section-title">Mood</h2>
        <div className="pill-group">
          {MOODS.map((m) => (
            <button key={m} className={`pill${mood === m ? " active" : ""}`} onClick={() => setMood(m)}>{m}</button>
          ))}
        </div>

        <label className="field full">
          <span>Notes</span>
          <textarea className="input textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else worth remembering about today" />
        </label>

        <button className="btn btn-primary" onClick={save}>Save entry for {fmtShort(date)}</button>
      </section>

      <section className="section quiet">
        <h2 className="section-title">General tips for {CONDITIONS[profile.condition].label.toLowerCase()}</h2>
        <ul className="tip-list">
          {CONDITIONS[profile.condition].tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        <p className="disclaimer">These are general wellness notes, not medical advice. For diagnosis or treatment, please see a healthcare professional.</p>
      </section>

      <section className="section">
        <h2 className="section-title">Recent entries</h2>
        {history.length === 0 ? <p className="empty-copy">No entries logged yet.</p> : (
          <div className="history-list">
            {history.map((h) => (
              <div key={h.id} className="history-row">
                <div className="history-date">{fmtShort(h.date)}</div>
                <div className="history-body">
                  <div className="history-tags">{h.symptoms.length ? h.symptoms.join(", ") : "No symptoms"}{h.mood ? ` · ${h.mood}` : ""}</div>
                  {h.pain > 0 && <div className="history-pain">Pain {h.pain}/10</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------------------------- Habits ------------------------------------- */

function HabitsTab({ habitDefs, habitCompletions, updateHabits, activeHabits, suggestedInactive, toggleHabitToday, getStreak, today }) {
  const [newHabit, setNewHabit] = useState("");
  const doneToday = habitCompletions[today] || [];

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const next = [...habitDefs, { id: uid(), label: newHabit.trim(), active: true, custom: true }];
    updateHabits(next, habitCompletions);
    setNewHabit("");
  };
  const removeHabit = (id) => updateHabits(habitDefs.filter((h) => h.id !== id), habitCompletions);
  const activate = (id) => updateHabits(habitDefs.map((h) => (h.id === id ? { ...h, active: true } : h)), habitCompletions);

  return (
    <div className="tab-panel">
      <h1 className="page-title">Habits</h1>

      <section className="section">
        <h2 className="section-title">Today</h2>
        {activeHabits.length === 0 ? <p className="empty-copy">Nothing active yet — add or turn on a habit below.</p> : (
          <div className="habit-list">
            {activeHabits.map((h) => (
              <HabitRow key={h.id} habit={h} done={doneToday.includes(h.id)} streak={getStreak(h.id)} onToggle={() => toggleHabitToday(h.id)} onRemove={() => removeHabit(h.id)} />
            ))}
          </div>
        )}
      </section>

      {suggestedInactive.length > 0 && (
        <section className="section quiet">
          <h2 className="section-title">Suggested for you</h2>
          <div className="habit-list">
            {suggestedInactive.map((h) => (
              <div key={h.id} className="habit-row">
                <div className="habit-label">{h.label}</div>
                <button className="text-btn" onClick={() => activate(h.id)}>Add</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Add your own</h2>
        <div className="row-inline">
          <input className="input" value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="e.g. Take my evening walk" onKeyDown={(e) => e.key === "Enter" && addHabit()} />
          <button className="btn btn-primary" onClick={addHabit}><Plus size={16} /></button>
        </div>
      </section>
    </div>
  );
}

/* --------------------------------- Insights ------------------------------------- */

function InsightsTab({ sortedPeriods, symptomLogs, activeHabits, habitCompletions, today }) {
  const cycleData = [];
  for (let i = 1; i < sortedPeriods.length; i++) {
    cycleData.push({ label: fmtShort(sortedPeriods[i].start), length: diffDays(sortedPeriods[i].start, sortedPeriods[i - 1].start) });
  }

  const tally = {};
  symptomLogs.forEach((l) => l.symptoms.forEach((s) => { tally[s] = (tally[s] || 0) + 1; }));
  const symptomData = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

  const habitData = [];
  for (let i = 13; i >= 0; i--) {
    const iso = addDays(today, -i);
    const activeIds = activeHabits.map((h) => h.id);
    const done = (habitCompletions[iso] || []).filter((id) => activeIds.includes(id)).length;
    const pct = activeIds.length ? Math.round((done / activeIds.length) * 100) : 0;
    habitData.push({ label: fmtShort(iso), pct });
  }

  return (
    <div className="tab-panel">
      <h1 className="page-title">Insights</h1>

      <section className="section">
        <h2 className="section-title">Cycle length over time</h2>
        {cycleData.length === 0 ? (
          <p className="empty-copy">Log at least two periods to see your cycle length trend.</p>
        ) : (
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={cycleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} width={28} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", fontFamily: "IBM Plex Sans, sans-serif" }} />
                <Line type="monotone" dataKey="length" stroke="var(--menstrual)" strokeWidth={2} dot={{ r: 3 }} name="Days" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Most logged symptoms</h2>
        {symptomData.length === 0 ? (
          <p className="empty-copy">Log a few symptom entries to see patterns here.</p>
        ) : (
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={symptomData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis type="number" stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--muted)" fontSize={12} width={120} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", fontFamily: "IBM Plex Sans, sans-serif" }} />
                <Bar dataKey="count" fill="var(--luteal)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Habit completion, last 14 days</h2>
        {activeHabits.length === 0 ? (
          <p className="empty-copy">Turn on some habits to track your completion rate.</p>
        ) : (
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" stroke="var(--muted)" fontSize={11} interval={1} />
                <YAxis stroke="var(--muted)" fontSize={12} width={32} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", fontFamily: "IBM Plex Sans, sans-serif" }} formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" fill="var(--follicular)" radius={[3, 3, 0, 0]} name="Completion" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------ style ------------------------------------- */

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

      .ritu-app {
        --bg: #F7EFE9;
        --surface: #FFFDFB;
        --ink: #2A211C;
        --muted: #8A7E74;
        --line: #E4D9CD;
        --menstrual: #96323F; --menstrual-tint: #F1DADD;
        --follicular: #57794F; --follicular-tint: #DCE6D8;
        --ovulatory: #C98A2E; --ovulatory-tint: #F3E2C4;
        --luteal: #6E4F72; --luteal-tint: #E5DCE6;
        font-family: 'IBM Plex Sans', sans-serif;
        background: var(--bg);
        color: var(--ink);
        min-height: 100vh;
        line-height: 1.5;
      }
      .ritu-app * { box-sizing: border-box; }
      .loading-screen { padding: 60px 24px; text-align: center; color: var(--muted); }

      .layout { display: flex; min-height: 100vh; max-width: 1100px; margin: 0 auto; }
      .sidebar {
        width: 220px; flex-shrink: 0; padding: 28px 18px; display: flex; flex-direction: column;
        border-right: 1px solid var(--line);
      }
      .brand-mark { font-family: 'Newsreader', serif; font-style: italic; font-size: 28px; font-weight: 500; }
      .brand-mark.small { font-size: 20px; }
      .brand-tag { font-size: 12px; color: var(--muted); margin-top: 2px; }
      nav { display: flex; flex-direction: column; gap: 2px; margin-top: 32px; }
      .navitem {
        display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 7px;
        border: none; background: none; color: var(--muted); font-size: 14px; cursor: pointer; text-align: left;
        font-family: inherit;
      }
      .navitem:hover { background: var(--menstrual-tint); color: var(--ink); }
      .navitem.active { background: var(--ink); color: var(--bg); }
      .sidebar-foot { margin-top: auto; font-size: 11.5px; color: var(--muted); line-height: 1.5; padding-top: 20px; }

      .content { flex: 1; min-width: 0; padding: 32px 28px 100px; }
      .topbar-mobile { display: none; padding: 4px 0 18px; }

      .tab-panel { max-width: 640px; }
      .page-title { font-family: 'Newsreader', serif; font-weight: 500; font-size: 30px; margin: 0 0 18px; }
      .section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
      .section-title { font-size: 15px; font-weight: 600; margin: 0 0 12px; }
      .section { padding: 22px 0; border-bottom: 1px solid var(--line); }
      .section.quiet { color: var(--muted); }
      .section:last-child { border-bottom: none; }

      .pill-select {
        font-family: inherit; font-size: 13px; padding: 7px 10px; border-radius: 20px;
        border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer;
      }

      .phase-row { display: flex; gap: 28px; align-items: center; flex-wrap: wrap; }
      .phase-wheel { width: 180px; height: 180px; flex-shrink: 0; }
      .wheel-day { font-family: 'Newsreader', serif; font-size: 34px; fill: var(--ink); }
      .wheel-label { font-size: 11px; fill: var(--muted); }
      .phase-info { flex: 1; min-width: 220px; }
      .phase-name { font-family: 'Newsreader', serif; font-style: italic; font-size: 22px; margin-bottom: 6px; }
      .phase-blurb { color: var(--muted); font-size: 14px; margin: 0 0 10px; max-width: 42ch; }
      .stat-line { font-size: 13.5px; }
      .note-flag { margin-top: 10px; font-size: 13px; padding: 8px 12px; background: var(--ovulatory-tint); border-radius: 6px; display: inline-block; }

      .onboard-copy { color: var(--muted); font-size: 14px; margin-bottom: 12px; }
      .row-inline { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

      .stat-grid { display: flex; gap: 14px; flex-wrap: wrap; }
      .stat-box { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; }
      .stat-num { font-family: 'Newsreader', serif; font-size: 22px; line-height: 1.1; }
      .stat-cap { font-size: 11.5px; color: var(--muted); }

      .habit-list { display: flex; flex-direction: column; }
      .habit-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
      .habit-row:last-child { border-bottom: none; }
      .check {
        width: 22px; height: 22px; border-radius: 6px; border: 1.5px solid var(--muted);
        background: var(--surface); display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; color: var(--surface);
      }
      .check.done { background: var(--follicular); border-color: var(--follicular); }
      .habit-label { flex: 1; font-size: 14px; }
      .habit-streak { font-size: 12px; color: var(--muted); }
      .text-btn { background: none; border: none; color: var(--luteal); font-size: 13px; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 4px; }
      .text-btn.danger { color: var(--menstrual); }
      .link-btn { background: none; border: none; color: var(--ink); font-size: 14px; cursor: pointer; font-family: inherit; text-decoration: underline; padding: 0; }

      .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); }
      .field.full { width: 100%; margin-bottom: 16px; }
      .input {
        font-family: inherit; font-size: 14px; padding: 9px 11px; border-radius: 7px;
        border: 1px solid var(--line); background: var(--surface); color: var(--ink);
      }
      .textarea { resize: vertical; }

      .pill-group { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
      .pill-group.wrap { flex-wrap: wrap; }
      .pill {
        font-family: inherit; font-size: 13px; padding: 7px 13px; border-radius: 20px;
        border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer;
      }
      .pill.active { background: var(--ink); border-color: var(--ink); color: var(--bg); }

      .btn { font-family: inherit; font-size: 13.5px; padding: 9px 16px; border-radius: 7px; border: 1px solid var(--ink); cursor: pointer; background: var(--surface); }
      .btn-primary { background: var(--ink); color: var(--bg); }
      .btn-ghost { background: transparent; }
      .btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .icon-btn { background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px; display: flex; }

      .tip-list { margin: 0 0 12px; padding-left: 18px; font-size: 13.5px; color: var(--ink); }
      .tip-list li { margin-bottom: 6px; }
      .disclaimer { font-size: 12px; color: var(--muted); margin: 0; }
      .empty-copy { color: var(--muted); font-size: 13.5px; }

      .history-list { display: flex; flex-direction: column; }
      .history-row { display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 13.5px; }
      .history-row:last-child { border-bottom: none; }
      .history-date { width: 56px; flex-shrink: 0; color: var(--muted); }
      .history-tags { }
      .history-pain { color: var(--menstrual); font-size: 12px; margin-top: 2px; }

      .chart-box { margin-top: 4px; }

      .cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
      .cal-title { font-size: 14px; font-weight: 600; }
      .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
      .cal-dow { margin-bottom: 4px; }
      .cal-dow-cell { text-align: center; font-size: 11px; color: var(--muted); }
      .cal-cell {
        aspect-ratio: 1; display: flex; align-items: center; justify-content: center; position: relative;
        font-size: 12.5px; border-radius: 6px; background: var(--surface); border: 1px solid transparent;
      }
      .cal-cell.empty { background: none; }
      .cal-cell.today { border-color: var(--ink); }
      .cal-cell.period { background: var(--menstrual); color: #fff; }
      .cal-cell.predicted { border: 1.5px dashed var(--menstrual); }
      .ov-dot { position: absolute; bottom: 3px; width: 5px; height: 5px; border-radius: 50%; background: var(--ovulatory); }
      .cal-legend { display: flex; gap: 16px; margin-top: 12px; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
      .cal-legend .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
      .cal-legend .dot.outline { border: 1.5px dashed var(--menstrual); }

      .advice-list { display: flex; flex-direction: column; gap: 10px; margin: 4px 0 18px; }
      .advice-card { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; }
      .advice-symptom { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
      .advice-card ul { margin: 0; padding-left: 18px; font-size: 13px; color: var(--muted); }
      .advice-card li { margin-bottom: 3px; }
      .note-flag.urgent { background: var(--menstrual-tint); color: var(--menstrual); display: flex; align-items: center; gap: 6px; }

      .chat-fab {
        position: fixed; bottom: 22px; right: 22px; width: 52px; height: 52px; border-radius: 50%;
        background: var(--ink); color: var(--bg); border: none; display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.18); z-index: 40;
      }
      .chat-panel {
        position: fixed; bottom: 84px; right: 22px; width: 320px; max-width: calc(100vw - 32px);
        max-height: 70vh; background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; z-index: 40; overflow: hidden;
      }
      .chat-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid var(--line); }
      .chat-head-title { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 14px; }
      .chat-disclaimer {
        display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted);
        background: var(--luteal-tint); padding: 7px 12px;
      }
      .chat-body { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
      .chat-msg { font-size: 13px; line-height: 1.5; padding: 8px 11px; border-radius: 10px; max-width: 88%; white-space: pre-line; }
      .chat-msg.bot { background: var(--bg); align-self: flex-start; }
      .chat-msg.user { background: var(--ink); color: var(--bg); align-self: flex-end; }
      .chat-quick { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 14px 10px; }
      .chat-chip {
        font-family: inherit; font-size: 11.5px; padding: 5px 10px; border-radius: 20px;
        border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer;
      }
      .chat-input-row { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--line); }
      .chat-input-row .input { flex: 1; }
      .icon-btn.send { background: var(--ink); color: var(--bg); border-radius: 8px; }

      @media (max-width: 480px) {
        .chat-panel { right: 12px; left: 12px; width: auto; bottom: 78px; }
        .chat-fab { right: 16px; bottom: 16px; }
      }

      .tabbar-mobile { display: none; }

      @media (max-width: 820px) {
        .sidebar { display: none; }
        .layout { display: block; }
        .content { padding: 18px 16px 90px; }
        .topbar-mobile { display: block; }
        .tabbar-mobile {
          display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface);
          border-top: 1px solid var(--line); justify-content: space-around; padding: 8px 4px;
        }
        .tabitem {
          background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 3px;
          font-size: 10.5px; color: var(--muted); font-family: inherit; cursor: pointer; padding: 4px 8px;
        }
        .tabitem.active { color: var(--ink); font-weight: 600; }
        .phase-row { gap: 18px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .ritu-app * { transition: none !important; animation: none !important; }
      }
    `}</style>
  );
}
