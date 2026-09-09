import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Droplet, Moon, Activity, Heart, Leaf, Sparkles, Flame, Pill,
  Calendar as CalendarIcon, BarChart2, BookOpen, Settings, User,
  Plus, Check, X, ChevronLeft, ChevronRight, Home, Trash2, ChevronDown,
  MessageCircle, Send, Bot, ShieldAlert, Utensils,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ============================== constants ============================== */

const CONDITIONS = [
  { id: "periods", label: "Regular periods", icon: Droplet },
  { id: "pcod", label: "PCOD", icon: Sparkles },
  { id: "pcos", label: "PCOS", icon: Sparkles },
  { id: "endometriosis", label: "Endometriosis", icon: Flame },
  { id: "perimenopause", label: "Perimenopause", icon: Leaf },
  { id: "menopause", label: "Menopause", icon: Moon },
  { id: "other", label: "Something else", icon: Heart },
];

const FLOW_LEVELS = [
  { id: "none", label: "None", color: "#D8CFC7" },
  { id: "spotting", label: "Spotting", color: "#E8A9B8" },
  { id: "light", label: "Light", color: "#D97C93" },
  { id: "medium", label: "Medium", color: "#B8465F" },
  { id: "heavy", label: "Heavy", color: "#7A2E4A" },
];

const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Acne", "Mood swings",
  "Breast tenderness", "Back pain", "Nausea", "Hot flashes", "Night sweats",
  "Joint pain", "Brain fog", "Irregular bleeding", "Spotting between periods",
  "Anxiety", "Trouble sleeping",
];

const MOODS = [
  { id: "happy", label: "Happy" },
  { id: "calm", label: "Calm" },
  { id: "energetic", label: "Energetic" },
  { id: "irritable", label: "Irritable" },
  { id: "anxious", label: "Anxious" },
  { id: "low", label: "Low" },
];

const HABIT_ICONS = { Droplet, Moon, Activity, Leaf, Sparkles, Flame, Pill, Heart };

function defaultHabitsFor(conditions) {
  const list = [
    { id: "water", name: "Drink enough water", icon: "Droplet" },
    { id: "sleep", name: "Sleep 7+ hours", icon: "Moon" },
    { id: "move", name: "Gentle movement", icon: "Activity" },
    { id: "calm", name: "A few quiet minutes", icon: "Leaf" },
  ];
  if (conditions.includes("pcod") || conditions.includes("pcos")) {
    list.push({ id: "balanced-meal", name: "Balanced meal, protein + fibre", icon: "Sparkles" });
  }
  if (conditions.includes("endometriosis")) {
    list.push({ id: "meds", name: "Take medication as prescribed", icon: "Pill" });
    list.push({ id: "heat", name: "Heat therapy if sore", icon: "Flame" });
  }
  if (conditions.includes("perimenopause") || conditions.includes("menopause")) {
    list.push({ id: "calcium", name: "Calcium & vitamin D", icon: "Sparkles" });
  }
  return list;
}

const LEARN_CONTENT = {
  periods: {
    title: "Regular periods",
    icon: "Droplet",
    tips: [
      "Logging your cycle for a few months makes it much easier to spot what's actually a pattern versus a one-off.",
      "If your flow runs heavy, iron-rich foods (leafy greens, lentils, jaggery) alongside vitamin C can help your body keep up.",
      "Gentle movement, a warm compress, or a short walk are commonly reported to ease cramps for some people.",
    ],
  },
  pcod: {
    title: "PCOD",
    icon: "Sparkles",
    tips: [
      "PCOD often responds well to consistency — regular meal timing and steady sleep can help more than any single big change.",
      "Movement doesn't have to mean intense workouts; a daily walk or a home routine you'll actually stick to counts.",
      "Irregular cycles are common with PCOD — tracking helps you and your doctor see the real pattern over time.",
    ],
  },
  pcos: {
    title: "PCOS",
    icon: "Sparkles",
    tips: [
      "Meals built around protein and fibre alongside carbs can help even out energy through the day for many with PCOS.",
      "Strength or resistance movement a couple of times a week is often highlighted alongside cardio for PCOS management.",
      "Sleep and stress both influence hormones — a wind-down habit is a small lever that can matter more than expected.",
    ],
  },
  endometriosis: {
    title: "Endometriosis",
    icon: "Flame",
    tips: [
      "A detailed pain and symptom log is genuinely useful to bring to a doctor's appointment — patterns are easy to forget otherwise.",
      "Heat (a bottle or pad) is a commonly used, low-risk way to take the edge off cramping pain.",
      "Pelvic floor physiotherapy is worth asking a doctor about if pain is a recurring problem.",
      "Anti-inflammatory foods (oily fish, nuts, vegetables) are something some people find helpful to build meals around.",
    ],
  },
  perimenopause: {
    title: "Perimenopause",
    icon: "Leaf",
    tips: [
      "Cycles can get irregular here — tracking what you do notice still helps build a picture over time.",
      "Cooling strategies (layers, a fan nearby, cold water) can help take the edge off hot flashes.",
      "Weight-bearing and strength exercise supports bone density through this transition.",
    ],
  },
  menopause: {
    title: "Menopause",
    icon: "Moon",
    tips: [
      "Calcium and vitamin D intake matters more here for long-term bone health — food first, and ask a doctor about supplements.",
      "A consistent, cool, screen-free wind-down routine can meaningfully help with sleep disruption.",
      "Strength training a couple of times a week helps offset natural bone and muscle loss.",
    ],
  },
  other: {
    title: "General wellness",
    icon: "Heart",
    tips: [
      "Whatever you're dealing with, a simple daily log is one of the most useful things you can bring to a doctor's visit.",
      "Small, repeatable habits (water, sleep, movement, a calm moment) tend to compound more than occasional big efforts.",
    ],
  },
};

/* ============================== diet & meals ============================== */

const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "dinner", label: "Dinner" },
];

const DIET_CONTENT = {
  periods: {
    eat: [
      "Iron-rich foods on heavier flow days — leafy greens, lentils, jaggery, or lean meat if you eat it",
      "Vitamin C alongside iron-rich meals (citrus, amla, bell peppers) to help your body absorb it",
      "Warm, easy-to-digest meals if cramps make you less hungry",
      "Plenty of water, especially if you're prone to headaches around your period",
    ],
    limit: [
      "Very salty or fried food, which can worsen bloating",
      "Excess caffeine, which can worsen cramps or anxiety for some people",
    ],
    sample: {
      breakfast: "Oats or poha with fruit and a handful of nuts",
      lunch: "Dal, roti or rice, a green vegetable, and salad",
      snack: "Fruit, roasted chana, or yogurt",
      dinner: "A light khichdi or soup-based meal with vegetables",
    },
  },
  pcod: {
    eat: [
      "Protein and fibre at every meal (dal, eggs, paneer, beans, vegetables) to help keep you full and blood sugar steady",
      "Whole grains over refined ones — brown rice, whole wheat, millets",
      "Regular meal timings rather than skipping meals, which can help hormone regulation",
    ],
    limit: [
      "Sugary drinks and refined snacks (biscuits, white bread, sweets), which can spike blood sugar",
      "Very large gaps between meals",
    ],
    sample: {
      breakfast: "Vegetable poha or a besan chilla with a side of curd",
      lunch: "Roti, dal, a vegetable sabzi, and a bowl of salad",
      snack: "A handful of nuts, or roasted makhana",
      dinner: "Grilled paneer or fish with sautéed vegetables",
    },
  },
  pcos: {
    eat: [
      "Protein and fibre together at each meal to help even out energy through the day",
      "Healthy fats — nuts, seeds, olive oil, avocado — which can help with hormone balance",
      "Low-glycemic carbs (millets, oats, whole wheat) over refined ones",
    ],
    limit: [
      "Sugary drinks, refined carbs, and fried food, which can worsen insulin resistance",
      "Excess dairy, if you notice it worsens acne or bloating for you specifically",
    ],
    sample: {
      breakfast: "Moong dal chilla, or oats with nuts and seeds",
      lunch: "Millet roti, dal, a vegetable, and salad",
      snack: "Greek yogurt or a small portion of nuts",
      dinner: "Grilled chicken, fish, or paneer with a big portion of vegetables",
    },
  },
  endometriosis: {
    eat: [
      "Anti-inflammatory foods — oily fish, leafy greens, berries, nuts, olive oil",
      "Fibre-rich foods (vegetables, whole grains, legumes), which may help with estrogen balance",
      "Warm, soothing foods on painful days — soups, stews, herbal teas",
    ],
    limit: [
      "Red and processed meat, which some people find worsens inflammation",
      "Excess caffeine and alcohol, which can worsen pain for some people",
    ],
    sample: {
      breakfast: "Oats with berries, flaxseed, and walnuts",
      lunch: "Quinoa or brown rice, dal, and a big serving of leafy greens",
      snack: "A handful of walnuts or a piece of fruit",
      dinner: "Baked fish or tofu with roasted vegetables",
    },
  },
  perimenopause: {
    eat: [
      "Calcium and vitamin D-rich foods (dairy, fortified foods, leafy greens) for bone health",
      "Phytoestrogen-containing foods like soy and flaxseed, which some people find helps with symptoms",
      "Protein at each meal to help maintain muscle mass",
    ],
    limit: [
      "Spicy food, caffeine, and alcohol if they seem to trigger your hot flashes",
      "Late, heavy meals if they're disrupting your sleep",
    ],
    sample: {
      breakfast: "Yogurt with flaxseed and fruit",
      lunch: "Roti, dal, a vegetable, and a side of curd",
      snack: "A small handful of almonds or a glass of milk",
      dinner: "Grilled fish or paneer with steamed vegetables",
    },
  },
  menopause: {
    eat: [
      "Calcium and vitamin D-rich foods for long-term bone health — dairy, fortified foods, leafy greens",
      "Protein at each meal to help offset natural muscle loss",
      "Plenty of water and fibre, since digestion can slow down during this transition",
    ],
    limit: [
      "Excess salt, which can affect blood pressure and bone health over time",
      "Spicy food, caffeine, or alcohol if they trigger hot flashes for you",
    ],
    sample: {
      breakfast: "Vegetable upma or oats with milk and nuts",
      lunch: "Roti, dal, a vegetable, and a bowl of curd",
      snack: "A piece of fruit or a small glass of milk",
      dinner: "Light soup or khichdi with vegetables",
    },
  },
  other: {
    eat: [
      "A mix of whole grains, protein, vegetables, and fruit through the day",
      "Enough water — a simple, easy habit that supports almost everything else",
    ],
    limit: [
      "Very processed or sugary food as a regular, everyday habit",
    ],
    sample: {
      breakfast: "Whatever whole-food breakfast you enjoy and will actually eat",
      lunch: "A balanced plate — grains, protein, vegetables",
      snack: "Fruit, nuts, or yogurt",
      dinner: "A lighter, balanced meal a few hours before bed",
    },
  },
};

/* ============================== symptom advice ============================== */

const SYMPTOM_ADVICE = {
  "Cramps": [
    "A heat pack on your lower abdomen or a warm bath can take the edge off.",
    "Light movement or stretching sometimes helps more than lying still.",
  ],
  "Bloating": [
    "Cutting back on salty or processed food for a day or two can ease water retention.",
    "Peppermint or ginger tea is a low-risk thing some people find soothing.",
  ],
  "Headache": [
    "Check you're drinking enough water — dehydration is a common trigger around your period.",
    "A dark, quiet room and a short rest can help if it's tension-related.",
  ],
  "Fatigue": [
    "Iron-rich foods (leafy greens, lentils, jaggery) can help if your flow is heavy.",
    "It's fine to scale back workouts on low-energy days — gentle movement still counts.",
  ],
  "Acne": [
    "Stick to a gentle, non-stripping skincare routine — over-treating can make hormonal breakouts worse.",
    "A dermatologist can help if it's persistent — there are options beyond over-the-counter products.",
  ],
  "Mood swings": [
    "A short walk or a few minutes of quiet can help take the edge off.",
    "Naming what you're feeling to someone you trust often makes it easier to sit with.",
  ],
  "Breast tenderness": [
    "A supportive, well-fitted bra can make a real difference on tender days.",
    "This usually settles once your period starts — worth flagging to a doctor if it lingers well past that.",
  ],
  "Back pain": [
    "A heat pack on your lower back, or a gentle stretch, can help.",
    "Notice if it's worse on heavier flow days — that pattern is worth mentioning to a doctor.",
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
  "Joint pain": [
    "Gentle movement, like walking or swimming, often helps more than resting completely still.",
    "Persistent or worsening joint pain is worth mentioning at a checkup.",
  ],
  "Brain fog": [
    "This is a real, commonly reported symptom during hormonal shifts — it's not \"just you.\"",
    "Breaking tasks into smaller steps and writing things down can help on foggier days.",
  ],
  "Irregular bleeding": [
    "Track exactly when it happens relative to your cycle — that detail is genuinely useful to a doctor.",
    "If it's heavy, frequent, or new for you, it's worth getting checked rather than watching and waiting.",
  ],
  "Spotting between periods": [
    "A single instance is often harmless, but note whether it keeps happening.",
    "Spotting alongside pain, or after sex, is worth mentioning to a doctor.",
  ],
  "Anxiety": [
    "Grounding techniques (slow breathing, naming five things you can see) can help in the moment.",
    "If it feels constant rather than tied to your cycle, it's worth talking to someone beyond this app.",
  ],
  "Trouble sleeping": [
    "A consistent wind-down routine and less screen time before bed can help.",
    "A cooler room can help if night sweats or hot flashes are part of what's disrupting sleep.",
  ],
};

/* ============================== chat assistant ============================== */

const CHAT_WELCOME = "Hi, I'm the Ritu Assistant — think of me as a knowledgeable companion for period, PCOD, PCOS, endometriosis and menopause questions. I'm not a doctor and can't diagnose anything, but I can share general self-care guidance and help you figure out when it's worth seeing one.";

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
      .join("\n\n") + "\n\nYou can log this on the Calendar tab to track whether it's a one-off or a pattern.";
  }

  if (/pcod/.test(t)) return LEARN_CONTENT.pcod.tips.join(" ");
  if (/pcos/.test(t)) return LEARN_CONTENT.pcos.tips.join(" ");
  if (/endo/.test(t)) return LEARN_CONTENT.endometriosis.tips.join(" ");
  if (/perimenopaus/.test(t)) return LEARN_CONTENT.perimenopause.tips.join(" ");
  if (/menopaus/.test(t)) return LEARN_CONTENT.menopause.tips.join(" ");
  if (/irregular|late period|missed period/.test(t)) {
    return "Irregular cycles have a lot of possible causes — stress, PCOD/PCOS, perimenopause, and more. Logging a couple of cycles on the Calendar tab will give you and a doctor something concrete to look at.";
  }
  if (/doctor|gynaecologist|gynecologist|worried|should i see/.test(t)) {
    return "It's worth seeing a doctor if a symptom is severe, sudden, getting worse, or just doesn't sit right with you — trust that instinct. Bringing your logs from the Insights tab can make the appointment more useful.";
  }
  if (/pill|contracept|birth control|medication|dosage/.test(t)) {
    return "Anything about medication, dosage, or contraception really needs a doctor or pharmacist who knows your history — I'd rather not guess at something that specific.";
  }

  return "I don't have a specific note on that yet — I can share general self-care guidance for things like cramps, bloating, mood swings, acne, hot flashes, and more. You can also try one of the quick questions below, or bring this up with a doctor.";
}

/* ============================== date helpers ============================== */

const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const todayKey = () => dateKey(new Date());
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

/* ============================== cycle math ============================== */

function getCycleInfo(profile, targetDate) {
  if (!profile || !profile.lastPeriodStart) return null;
  const start = startOfDay(parseKey(profile.lastPeriodStart));
  const cycleLength = profile.cycleLength || 28;
  const periodLength = Math.min(profile.periodLength || 5, cycleLength - 1);
  const diff = daysBetween(start, targetDate);
  const cycleDay = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
  const ovulationDay = Math.min(cycleLength - 1, Math.max(periodLength + 2, cycleLength - 14));

  let phase, colorVar;
  if (cycleDay <= periodLength) { phase = "Menstrual phase"; colorVar = "var(--berry)"; }
  else if (cycleDay < ovulationDay - 1) { phase = "Follicular phase"; colorVar = "var(--sage)"; }
  else if (cycleDay <= ovulationDay + 1) { phase = "Ovulation window"; colorVar = "var(--gold)"; }
  else { phase = "Luteal phase"; colorVar = "var(--plum)"; }

  const cyclesPassed = Math.floor(diff / cycleLength);
  const currentCycleStart = addDays(start, cyclesPassed * cycleLength);
  const nextPeriodStart = addDays(currentCycleStart, cycleLength);
  const daysUntilNext = daysBetween(targetDate, nextPeriodStart);

  return { cycleDay, cycleLength, periodLength, ovulationDay, phase, colorVar, daysUntilNext };
}

function cycleSegments(info) {
  const { periodLength, ovulationDay, cycleLength } = info;
  const raw = [
    { name: "Menstrual", s: 1, e: periodLength, color: "var(--berry)" },
    { name: "Follicular", s: periodLength + 1, e: ovulationDay - 2, color: "var(--sage)" },
    { name: "Ovulation", s: ovulationDay - 1, e: ovulationDay + 1, color: "var(--gold)" },
    { name: "Luteal", s: ovulationDay + 2, e: cycleLength, color: "var(--plum)" },
  ];
  return raw.filter((seg) => seg.e >= seg.s);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/* ============================== small UI atoms ============================== */

function IconFor({ name, ...props }) {
  const Cmp = HABIT_ICONS[name] || Heart;
  return <Cmp {...props} />;
}

function Chip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="chip" data-active={active ? "1" : "0"}>
      {children}
    </button>
  );
}

function EmptyState({ children }) {
  return <p className="empty-state">{children}</p>;
}

/* ============================== cycle wheel ============================== */

function CycleWheel({ info }) {
  const size = 208, r = 82, sw = 16, cx = size / 2, cy = size / 2;
  const segs = cycleSegments(info);
  const markerAngle = ((info.cycleDay - 0.5) / info.cycleLength) * 360;
  const marker = polarToCartesian(cx, cy, r, markerAngle);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`Cycle day ${info.cycleDay}, ${info.phase}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} />
      {segs.map((seg) => (
        <path
          key={seg.name}
          d={describeArc(cx, cy, r, ((seg.s - 1) / info.cycleLength) * 360, (seg.e / info.cycleLength) * 360)}
          fill="none"
          stroke={seg.color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      ))}
      <circle cx={marker.x} cy={marker.y} r={7} fill="var(--ink)" stroke="var(--paper)" strokeWidth={3} />
      <text x={cx} y={cy - 6} textAnchor="middle" className="wheel-day">{info.cycleDay}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="wheel-label">day of cycle</text>
    </svg>
  );
}

function HabitRing({ pct }) {
  const size = 208, r = 82, sw = 16, cx = size / 2, cy = size / 2;
  const angle = pct * 360;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${Math.round(pct * 100)} percent of today's habits done`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} />
      {angle > 0 && (
        <path d={describeArc(cx, cy, r, 0, Math.max(angle, 0.001))} fill="none" stroke="var(--sage)" strokeWidth={sw} strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 4} textAnchor="middle" className="wheel-day">{Math.round(pct * 100)}%</text>
      <text x={cx} y={cy + 18} textAnchor="middle" className="wheel-label">habits today</text>
    </svg>
  );
}

/* ============================== onboarding ============================== */

function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [conditions, setConditions] = useState([]);
  const [lastPeriodStart, setLastPeriodStart] = useState(todayKey());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const menopauseOnly = conditions.length > 0 && conditions.every((c) => c === "menopause");
  const canContinue = name.trim().length > 0 && conditions.length > 0;

  function toggle(id) {
    setConditions((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function submit() {
    onDone({
      name: name.trim(),
      age: age ? Number(age) : null,
      weight: weight ? Number(weight) : null,
      conditions,
      lastPeriodStart: menopauseOnly ? null : lastPeriodStart,
      cycleLength: Number(cycleLength) || 28,
      periodLength: Number(periodLength) || 5,
    });
  }

  return (
    <div className="page onboarding">
      <div className="onboard-card">
        <h1 className="serif-headline">Welcome to Ritu</h1>
        <p className="sub">A private space to track your cycle, symptoms and daily habits — built for periods, PCOD, PCOS, endometriosis, menopause and everything in between.</p>

        <label className="field-label">What should we call you?</label>
        <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

        <div className="two-col">
          <div>
            <label className="field-label">Age</label>
            <input type="number" min={10} max={100} className="text-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="field-label">Weight (kg)</label>
            <input type="number" min={20} max={200} className="text-input" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <label className="field-label">What are you tracking? (pick all that apply)</label>
        <div className="chip-row">
          {CONDITIONS.map((c) => (
            <Chip key={c.id} active={conditions.includes(c.id)} onClick={() => toggle(c.id)}>
              <c.icon size={14} style={{ marginRight: 6 }} />{c.label}
            </Chip>
          ))}
        </div>

        {!menopauseOnly && conditions.length > 0 && (
          <div className="onboard-cycle-fields">
            <div>
              <label className="field-label">First day of your last period</label>
              <input type="date" className="text-input" value={lastPeriodStart} onChange={(e) => setLastPeriodStart(e.target.value)} max={todayKey()} />
            </div>
            <div className="two-col">
              <div>
                <label className="field-label">Usual cycle length</label>
                <input type="number" min={15} max={60} className="text-input" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Usual period length</label>
                <input type="number" min={1} max={14} className="text-input" value={periodLength} onChange={(e) => setPeriodLength(e.target.value)} />
              </div>
            </div>
            <p className="hint">Not sure of the exact numbers? A rough guess is fine — you can refine it later in your profile.</p>
          </div>
        )}

        <button className="btn-primary" disabled={!canContinue} onClick={submit}>Start tracking</button>
        <p className="disclaimer">Ritu helps you build habits and notice patterns. It isn't a medical device and doesn't replace advice from a doctor.</p>
      </div>
    </div>
  );
}

/* ============================== dashboard ============================== */

function Dashboard({ profile, cycleLogs, habitsData, onToggleHabit, onOpenLog, tracksCycle }) {
  const info = tracksCycle ? getCycleInfo(profile, new Date()) : null;
  const tk = todayKey();
  const todayLog = cycleLogs[tk];
  const habits = habitsData.config;
  const doneToday = habits.filter((h) => habitsData.completions[tk]?.[h.id]).length;
  const pct = habits.length ? doneToday / habits.length : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      <p className="greeting">{greeting}, {profile.name}</p>

      <div className="hero-card">
        {tracksCycle && info ? (
          <>
            <CycleWheel info={info} />
            <div className="hero-text">
              <p className="phase-name" style={{ color: info.colorVar }}>{info.phase}</p>
              <p className="phase-sub">
                {info.daysUntilNext >= 0
                  ? `Next period expected in ${info.daysUntilNext} day${info.daysUntilNext === 1 ? "" : "s"}`
                  : `Period expected ${Math.abs(info.daysUntilNext)} day${Math.abs(info.daysUntilNext) === 1 ? "" : "s"} ago — logging today can help clear things up`}
              </p>
            </div>
          </>
        ) : (
          <>
            <HabitRing pct={pct} />
            <div className="hero-text">
              <p className="phase-name" style={{ color: "var(--sage)" }}>Staying on track</p>
              <p className="phase-sub">{doneToday} of {habits.length} habits done today</p>
            </div>
          </>
        )}
        <button className="btn-outline" onClick={() => onOpenLog(tk)}>
          {todayLog ? "Edit today's log" : "Log how you're feeling today"}
        </button>
      </div>

      <h2 className="section-title">Today's habits</h2>
      {habits.length === 0 ? (
        <EmptyState>No habits set up yet — add some from the Habits tab.</EmptyState>
      ) : (
        <div className="habit-list">
          {habits.map((h) => {
            const done = !!habitsData.completions[tk]?.[h.id];
            return (
              <button key={h.id} className="habit-row" data-done={done ? "1" : "0"} onClick={() => onToggleHabit(h.id)}>
                <span className="habit-icon"><IconFor name={h.icon} size={18} /></span>
                <span className="habit-name">{h.name}</span>
                <span className="habit-check">{done ? <Check size={16} /> : null}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== calendar / log ============================== */

function DayLogPanel({ dateStr, log, onSave, onDelete, onClose }) {
  const [flow, setFlow] = useState(log?.flow || "none");
  const [symptoms, setSymptoms] = useState(log?.symptoms || []);
  const [mood, setMood] = useState(log?.mood || "");
  const [pain, setPain] = useState(log?.pain ?? 0);
  const [notes, setNotes] = useState(log?.notes || "");

  function toggleSymptom(s) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const d = parseKey(dateStr);
  const label = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  return (
    <div className="log-panel">
      <div className="log-panel-head">
        <h3 className="serif-headline small">{label}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>

      <label className="field-label">Flow</label>
      <div className="chip-row">
        {FLOW_LEVELS.map((f) => (
          <Chip key={f.id} active={flow === f.id} onClick={() => setFlow(f.id)}>{f.label}</Chip>
        ))}
      </div>

      <label className="field-label">Symptoms</label>
      <div className="chip-row">
        {SYMPTOMS.map((s) => (
          <Chip key={s} active={symptoms.includes(s)} onClick={() => toggleSymptom(s)}>{s}</Chip>
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

      <label className="field-label">Mood</label>
      <div className="chip-row">
        {MOODS.map((m) => (
          <Chip key={m.id} active={mood === m.id} onClick={() => setMood(m.id)}>{m.label}</Chip>
        ))}
      </div>

      <label className="field-label">Pain level: {pain}/10</label>
      <input type="range" min={0} max={10} value={pain} onChange={(e) => setPain(Number(e.target.value))} className="slider" />

      {(pain >= 8 || symptoms.includes("Irregular bleeding")) && (
        <div className="note-flag urgent"><ShieldAlert size={14} /> This is worth discussing with a doctor soon — especially if it's new, sudden, or getting worse.</div>
      )}

      <label className="field-label">Notes</label>
      <textarea className="text-input textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else worth remembering..." />

      <div className="log-panel-actions">
        <button className="btn-primary" onClick={() => onSave(dateStr, { flow, symptoms, mood, pain, notes })}>Save entry</button>
        {log && <button className="btn-text-danger" onClick={() => onDelete(dateStr)}><Trash2 size={14} style={{ marginRight: 4 }} />Delete entry</button>}
      </div>
    </div>
  );
}

function CalendarPage({ cycleLogs, selectedDate, onSelectDate, onSave, onDelete }) {
  const [viewDate, setViewDate] = useState(startOfDay(new Date()));

  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const tk = todayKey();

  return (
    <div className="page">
      <h1 className="serif-headline">Calendar</h1>
      <div className="cal-nav">
        <button className="icon-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <span className="cal-month-label">{MONTH_NAMES[month]} {year}</span>
        <button className="icon-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
      </div>

      <div className="cal-grid cal-weekdays">
        {WEEKDAY_LETTERS.map((w, i) => <span key={i}>{w}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (!d) return <span key={i} className="cal-cell empty" />;
          const k = dateKey(d);
          const log = cycleLogs[k];
          const dotColor = log?.flow && log.flow !== "none"
            ? FLOW_LEVELS.find((f) => f.id === log.flow)?.color
            : log ? "var(--sage)" : null;
          return (
            <button
              key={i}
              className="cal-cell"
              data-today={k === tk ? "1" : "0"}
              data-selected={k === selectedDate ? "1" : "0"}
              onClick={() => onSelectDate(k)}
            >
              <span>{d.getDate()}</span>
              {dotColor && <span className="cal-dot" style={{ background: dotColor }} />}
            </button>
          );
        })}
      </div>

      <div className="cal-legend">
        {FLOW_LEVELS.filter((f) => f.id !== "none").map((f) => (
          <span key={f.id} className="legend-item"><span className="legend-dot" style={{ background: f.color }} />{f.label}</span>
        ))}
        <span className="legend-item"><span className="legend-dot" style={{ background: "var(--sage)" }} />Symptoms logged</span>
      </div>

      {selectedDate && (
        <DayLogPanel
          dateStr={selectedDate}
          log={cycleLogs[selectedDate]}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => onSelectDate(null)}
        />
      )}
    </div>
  );
}

/* ============================== habits page ============================== */

function HabitsPage({ habitsData, onToggleHabit, onAddHabit, onRemoveHabit }) {
  const [newName, setNewName] = useState("");
  const tk = todayKey();

  function streakFor(habitId) {
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const k = dateKey(cursor);
      if (habitsData.completions[k]?.[habitId]) { streak++; cursor = addDays(cursor, -1); }
      else break;
      if (streak > 366) break;
    }
    return streak;
  }

  function submitAdd() {
    if (!newName.trim()) return;
    onAddHabit({ id: `h-${Date.now()}`, name: newName.trim(), icon: "Sparkles" });
    setNewName("");
  }

  return (
    <div className="page">
      <h1 className="serif-headline">Habits</h1>
      <p className="sub">Small things, done most days. Tap to mark today done.</p>

      <div className="habit-list">
        {habitsData.config.map((h) => {
          const done = !!habitsData.completions[tk]?.[h.id];
          const streak = streakFor(h.id);
          return (
            <div key={h.id} className="habit-row wide" data-done={done ? "1" : "0"}>
              <button className="habit-row-main" onClick={() => onToggleHabit(h.id)}>
                <span className="habit-icon"><IconFor name={h.icon} size={18} /></span>
                <span>
                  <span className="habit-name block">{h.name}</span>
                  {streak > 0 && <span className="streak-label">{streak} day streak</span>}
                </span>
                <span className="habit-check">{done ? <Check size={16} /> : null}</span>
              </button>
              <button className="icon-btn subtle" onClick={() => onRemoveHabit(h.id)} aria-label={`Remove ${h.name}`}><X size={14} /></button>
            </div>
          );
        })}
      </div>

      <div className="add-habit-row">
        <input className="text-input" placeholder="Add a habit, e.g. Take a walk" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAdd()} />
        <button className="btn-primary small" onClick={submitAdd}><Plus size={16} /></button>
      </div>
    </div>
  );
}

/* ============================== insights page ============================== */

function InsightsPage({ cycleLogs, habitsData, mealsData }) {
  const cycleLengths = useMemo(() => {
    const starts = Object.keys(cycleLogs)
      .filter((k) => cycleLogs[k]?.flow && cycleLogs[k].flow !== "none")
      .sort();
    const periodStarts = [];
    let prevWasPeriod = false;
    starts.forEach((k) => {
      if (!prevWasPeriod) periodStarts.push(k);
      prevWasPeriod = true;
      const next = dateKey(addDays(parseKey(k), 1));
      if (!starts.includes(next)) prevWasPeriod = false;
    });
    const lengths = [];
    for (let i = 1; i < periodStarts.length; i++) {
      lengths.push({ cycle: `#${i}`, days: daysBetween(parseKey(periodStarts[i - 1]), parseKey(periodStarts[i])) });
    }
    return lengths;
  }, [cycleLogs]);

  const symptomCounts = useMemo(() => {
    const counts = {};
    Object.values(cycleLogs).forEach((log) => {
      (log.symptoms || []).forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
  }, [cycleLogs]);

  const habitConsistency = useMemo(() => {
    return habitsData.config.map((h) => {
      let done = 0;
      for (let i = 0; i < 30; i++) {
        const k = dateKey(addDays(new Date(), -i));
        if (habitsData.completions[k]?.[h.id]) done++;
      }
      return { name: h.name.length > 14 ? h.name.slice(0, 14) + "…" : h.name, pct: Math.round((done / 30) * 100) };
    });
  }, [habitsData]);

  const mealSymptomInsight = useMemo(() => {
    const mealDays = Object.keys(mealsData.completions || {});
    if (mealDays.length < 6) return null;

    const mealsEatenOn = (k) => MEAL_SLOTS.filter((m) => mealsData.completions[k]?.[m.id]).length;

    const symptomTally = {};
    Object.entries(cycleLogs).forEach(([k, log]) => {
      (log.symptoms || []).forEach((s) => {
        symptomTally[s] = symptomTally[s] || new Set();
        symptomTally[s].add(k);
      });
    });

    let best = null;
    Object.entries(symptomTally).forEach(([symptom, daySet]) => {
      const withSymptom = mealDays.filter((k) => daySet.has(k));
      const withoutSymptom = mealDays.filter((k) => !daySet.has(k));
      if (withSymptom.length < 3 || withoutSymptom.length < 3) return;

      const avgWith = withSymptom.reduce((sum, k) => sum + mealsEatenOn(k), 0) / withSymptom.length;
      const avgWithout = withoutSymptom.reduce((sum, k) => sum + mealsEatenOn(k), 0) / withoutSymptom.length;
      const diff = Math.abs(avgWith - avgWithout);

      if (diff >= 0.5 && (!best || diff > best.diff)) {
        best = { symptom, avgWith, avgWithout, diff };
      }
    });

    return best;
  }, [cycleLogs, mealsData]);

  return (
    <div className="page">
      <h1 className="serif-headline">Insights</h1>

      <h2 className="section-title">Cycle length over time</h2>
      {cycleLengths.length < 2 ? (
        <EmptyState>Log at least two periods to see how your cycle length is trending.</EmptyState>
      ) : (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cycleLengths}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--track)" />
              <XAxis dataKey="cycle" stroke="var(--ink-soft)" fontSize={12} />
              <YAxis stroke="var(--ink-soft)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="days" stroke="var(--berry)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="section-title">Most logged symptoms</h2>
      {symptomCounts.length === 0 ? (
        <EmptyState>Log a few symptoms on the Calendar tab and they'll show up here.</EmptyState>
      ) : (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={symptomCounts} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--track)" />
              <XAxis type="number" stroke="var(--ink-soft)" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} stroke="var(--ink-soft)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--sage)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="section-title">Habit consistency (last 30 days)</h2>
      {habitConsistency.length === 0 ? (
        <EmptyState>Add some habits on the Habits tab to track consistency.</EmptyState>
      ) : (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={Math.max(160, habitConsistency.length * 40)}>
            <BarChart data={habitConsistency} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--track)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--ink-soft)" fontSize={12} unit="%" />
              <YAxis type="category" dataKey="name" width={110} stroke="var(--ink-soft)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="pct" fill="var(--plum)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="section-title">Meals & symptoms</h2>
      {mealSymptomInsight ? (
        <div className="insight-card">
          <p>
            On days you logged <strong>{mealSymptomInsight.symptom.toLowerCase()}</strong>, you ate an average of{" "}
            <strong>{mealSymptomInsight.avgWith.toFixed(1)}</strong> of {MEAL_SLOTS.length} meals — versus{" "}
            <strong>{mealSymptomInsight.avgWithout.toFixed(1)}</strong> on other days.
          </p>
          <p className="disclaimer">This is just a pattern in your own logs, not a cause-and-effect finding — worth mentioning to a doctor if it keeps showing up, not a diagnosis on its own.</p>
        </div>
      ) : (
        <EmptyState>Log your meals and symptoms for a couple more weeks to see if any patterns show up here.</EmptyState>
      )}
    </div>
  );
}

/* ============================== learn page ============================== */

function LearnPage({ conditions }) {
  const [open, setOpen] = useState(conditions[0] || "other");
  const shown = conditions.length ? conditions : ["other"];

  return (
    <div className="page">
      <h1 className="serif-headline">Learn</h1>
      <p className="disclaimer top">General wellness notes, not medical advice. If something feels severe or is getting worse, please see a doctor.</p>

      <div className="accordion">
        {shown.map((cid) => {
          const c = LEARN_CONTENT[cid] || LEARN_CONTENT.other;
          const isOpen = open === cid;
          return (
            <div key={cid} className="accordion-item">
              <button className="accordion-head" onClick={() => setOpen(isOpen ? null : cid)}>
                <span className="habit-icon"><IconFor name={c.icon} size={18} /></span>
                <span className="accordion-title">{c.title}</span>
                <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {isOpen && (
                <div className="accordion-body">
                  {c.tips.map((t, i) => <p key={i}>{t}</p>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== meals page ============================== */

function MealsPage({ profile, mealsData, onToggleMeal }) {
  const tk = todayKey();
  const todayMeals = mealsData.completions[tk] || {};
  const doneCount = MEAL_SLOTS.filter((m) => todayMeals[m.id]).length;
  const shownConditions = profile.conditions.length ? profile.conditions : ["other"];

  return (
    <div className="page">
      <h1 className="serif-headline">Meals</h1>
      <p className="sub">Track whether you've eaten today, and see food ideas that may help with what you're managing.</p>

      <h2 className="section-title">Today's meals ({doneCount}/{MEAL_SLOTS.length})</h2>
      <div className="habit-list">
        {MEAL_SLOTS.map((m) => {
          const done = !!todayMeals[m.id];
          return (
            <button key={m.id} className="habit-row" data-done={done ? "1" : "0"} onClick={() => onToggleMeal(m.id)}>
              <span className="habit-icon"><Utensils size={18} /></span>
              <span className="habit-name">{m.label}</span>
              <span className="habit-check">{done ? <Check size={16} /> : null}</span>
            </button>
          );
        })}
      </div>

      <h2 className="section-title">What might help you eat well today</h2>
      <div className="accordion">
        {shownConditions.map((cid) => {
          const d = DIET_CONTENT[cid] || DIET_CONTENT.other;
          const label = (CONDITIONS.find((c) => c.id === cid) || {}).label || "General wellness";
          return (
            <div key={cid} className="diet-card">
              <div className="diet-card-title">{label}</div>

              <div className="diet-section">
                <p className="diet-section-label">Foods that may help</p>
                <ul>{d.eat.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>

              <div className="diet-section">
                <p className="diet-section-label">Go easy on</p>
                <ul>{d.limit.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>

              <div className="diet-section">
                <p className="diet-section-label">A sample day</p>
                <ul className="diet-sample">
                  <li><strong>Breakfast:</strong> {d.sample.breakfast}</li>
                  <li><strong>Lunch:</strong> {d.sample.lunch}</li>
                  <li><strong>Snack:</strong> {d.sample.snack}</li>
                  <li><strong>Dinner:</strong> {d.sample.dinner}</li>
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <p className="disclaimer">General nutrition notes, not a personalised diet plan. If you have specific dietary needs, allergies, or a diagnosed condition, please check with a doctor or dietitian.</p>
    </div>
  );
}

/* ============================== profile page ============================== */

function ProfilePage({ profile, onSave, onReset }) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age ?? "");
  const [weight, setWeight] = useState(profile.weight ?? "");
  const [conditions, setConditions] = useState(profile.conditions);
  const [lastPeriodStart, setLastPeriodStart] = useState(profile.lastPeriodStart || todayKey());
  const [cycleLength, setCycleLength] = useState(profile.cycleLength);
  const [periodLength, setPeriodLength] = useState(profile.periodLength);
  const [confirmingReset, setConfirmingReset] = useState(false);

  function toggle(id) {
    setConditions((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  const menopauseOnly = conditions.length > 0 && conditions.every((c) => c === "menopause");

  return (
    <div className="page">
      <h1 className="serif-headline">Profile</h1>

      <label className="field-label">Name</label>
      <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} />

      <div className="two-col">
        <div>
          <label className="field-label">Age</label>
          <input type="number" min={10} max={100} className="text-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="field-label">Weight (kg)</label>
          <input type="number" min={20} max={200} className="text-input" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      <label className="field-label">What you're tracking</label>
      <div className="chip-row">
        {CONDITIONS.map((c) => (
          <Chip key={c.id} active={conditions.includes(c.id)} onClick={() => toggle(c.id)}>
            <c.icon size={14} style={{ marginRight: 6 }} />{c.label}
          </Chip>
        ))}
      </div>

      {!menopauseOnly && (
        <div className="onboard-cycle-fields">
          <label className="field-label">First day of last period</label>
          <input type="date" className="text-input" value={lastPeriodStart} onChange={(e) => setLastPeriodStart(e.target.value)} max={todayKey()} />
          <div className="two-col">
            <div>
              <label className="field-label">Usual cycle length</label>
              <input type="number" min={15} max={60} className="text-input" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Usual period length</label>
              <input type="number" min={1} max={14} className="text-input" value={periodLength} onChange={(e) => setPeriodLength(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={() => onSave({
          name: name.trim() || profile.name,
          age: age ? Number(age) : null,
          weight: weight ? Number(weight) : null,
          conditions,
          lastPeriodStart: menopauseOnly ? null : lastPeriodStart,
          cycleLength: Number(cycleLength) || 28,
          periodLength: Number(periodLength) || 5,
        })}
      >
        Save changes
      </button>

      <div className="danger-zone">
        <h2 className="section-title">Data</h2>
        <p className="sub">Everything you log stays in your own account storage for this app.</p>
        {!confirmingReset ? (
          <button className="btn-text-danger" onClick={() => setConfirmingReset(true)}>Clear all my data</button>
        ) : (
          <div className="confirm-row">
            <span>Clear every log, habit and profile setting?</span>
            <button className="btn-text-danger" onClick={onReset}>Yes, clear it</button>
            <button className="btn-text" onClick={() => setConfirmingReset(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== nav shell ============================== */

const NAV = [
  { id: "dashboard", label: "Today", icon: Home },
  { id: "log", label: "Calendar", icon: CalendarIcon },
  { id: "habits", label: "Habits", icon: Check },
  { id: "meals", label: "Meals", icon: Utensils },
  { id: "insights", label: "Insights", icon: BarChart2 },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "profile", label: "Profile", icon: User },
];

function NavShell({ page, setPage, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="brand">Ritu</p>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className="side-link" data-active={page === n.id ? "1" : "0"} onClick={() => setPage(n.id)}>
              <n.icon size={17} /><span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-area">{children}</main>
      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button key={n.id} className="bottom-link" data-active={page === n.id ? "1" : "0"} onClick={() => setPage(n.id)}>
            <n.icon size={19} /><span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ============================== chat widget ============================== */

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: `m-${Date.now()}`, from: "bot", text: CHAT_WELCOME }]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (text) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg = { id: `m-${Date.now()}-u`, from: "user", text: clean };
    const botMsg = { id: `m-${Date.now()}-b`, from: "bot", text: findChatReply(clean) };
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
          <div className="chat-body" ref={bodyRef}>
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
              className="text-input"
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

/* ============================== root app ============================== */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');

.ritu-root {
  --paper: #FBF5F1;
  --ink: #2B1D24;
  --ink-soft: #7A6B70;
  --berry: #A23A54;
  --sage: #4F7A6C;
  --gold: #C98A2E;
  --plum: #6B3357;
  --track: #E8DAD2;
  --border: #E3D2C8;
  font-family: 'Work Sans', sans-serif;
  color: var(--ink);
  background: var(--paper);
  min-height: 100vh;
  width: 100%;
}
.ritu-root * { box-sizing: border-box; }
.serif-headline { font-family: 'Fraunces', serif; font-weight: 600; font-size: 28px; margin: 0 0 6px; letter-spacing: -0.01em; }
.serif-headline.small { font-size: 20px; margin: 0; }
.sub { color: var(--ink-soft); font-size: 14px; margin: 0 0 20px; line-height: 1.5; max-width: 60ch; }
.hint { color: var(--ink-soft); font-size: 12px; margin: 4px 0 16px; }

.app-shell { display: flex; min-height: 100vh; }
.sidebar { display: none; }
.main-area { flex: 1; min-width: 0; padding: 24px 20px 96px; max-width: 640px; margin: 0 auto; width: 100%; }
.page { display: flex; flex-direction: column; }

.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around;
  background: var(--paper); border-top: 1px solid var(--border); padding: 6px 4px calc(env(safe-area-inset-bottom, 0px) + 6px);
  z-index: 20;
}
.bottom-link {
  background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 2px;
  color: var(--ink-soft); font-size: 10px; padding: 6px 8px; border-radius: 10px; cursor: pointer; font-family: inherit;
}
.bottom-link[data-active="1"] { color: var(--berry); }

@media (min-width: 860px) {
  .sidebar { display: flex; flex-direction: column; width: 208px; padding: 28px 16px; border-right: 1px solid var(--border); gap: 24px; position: sticky; top: 0; height: 100vh; }
  .brand { font-family: 'Fraunces', serif; font-weight: 600; font-size: 24px; margin: 0 0 8px; color: var(--berry); }
  .sidebar nav { display: flex; flex-direction: column; gap: 2px; }
  .side-link {
    display: flex; align-items: center; gap: 10px; background: none; border: none; text-align: left;
    padding: 10px 12px; border-radius: 10px; color: var(--ink-soft); font-family: inherit; font-size: 14px; cursor: pointer;
  }
  .side-link[data-active="1"] { background: var(--track); color: var(--berry); font-weight: 500; }
  .bottom-nav { display: none; }
  .main-area { padding: 40px 40px 40px; max-width: 720px; }
}

.greeting { color: var(--ink-soft); font-size: 14px; margin: 0 0 16px; }
.hero-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 16px; border: 1px solid var(--border); border-radius: 20px; background: #fff; margin-bottom: 28px; }
.hero-text { margin-top: 12px; margin-bottom: 16px; }
.phase-name { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; margin: 0 0 4px; }
.phase-sub { font-size: 13px; color: var(--ink-soft); margin: 0; max-width: 32ch; }
.wheel-day { font-family: 'Fraunces', serif; font-size: 34px; font-weight: 600; fill: var(--ink); }
.wheel-label { font-family: 'Work Sans', sans-serif; font-size: 11px; fill: var(--ink-soft); }

.section-title { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; margin: 8px 0 10px; }

.habit-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.habit-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 14px;
  background: #fff; cursor: pointer; font-family: inherit; text-align: left; width: 100%;
}
.habit-row[data-done="1"] { background: #F1EAE0; border-color: var(--sage); }
.habit-row.wide { padding: 0; gap: 0; }
.habit-row-main { flex: 1; display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: none; border: none; cursor: pointer; font-family: inherit; text-align: left; }
.habit-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: var(--track); color: var(--berry); flex-shrink: 0; }
.habit-name { font-size: 14px; flex: 1; }
.habit-name.block { display: block; }
.streak-label { font-size: 11px; color: var(--gold); }
.habit-check { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid var(--track); display: flex; align-items: center; justify-content: center; color: var(--sage); flex-shrink: 0; }
.habit-row[data-done="1"] .habit-check { border-color: var(--sage); background: var(--sage); color: #fff; }

.add-habit-row { display: flex; gap: 8px; margin-top: 8px; }
.add-habit-row .text-input { flex: 1; }

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.chip {
  border: 1px solid var(--border); background: #fff; border-radius: 999px; padding: 7px 14px; font-size: 13px;
  cursor: pointer; font-family: inherit; color: var(--ink); display: inline-flex; align-items: center;
}
.chip[data-active="1"] { background: var(--berry); border-color: var(--berry); color: #fff; }

.field-label { font-size: 12px; color: var(--ink-soft); margin-bottom: 6px; display: block; font-weight: 500; }
.text-input { width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; font-size: 14px; margin-bottom: 16px; font-family: inherit; background: #fff; color: var(--ink); }
.textarea { resize: vertical; }
.slider { width: 100%; margin-bottom: 16px; accent-color: var(--berry); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.btn-primary { background: var(--berry); color: #fff; border: none; border-radius: 12px; padding: 13px 20px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; width: 100%; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary.small { width: auto; padding: 10px 16px; }
.btn-outline { background: none; border: 1px solid var(--berry); color: var(--berry); border-radius: 12px; padding: 10px 18px; font-size: 13px; cursor: pointer; font-family: inherit; }
.btn-text { background: none; border: none; color: var(--ink-soft); font-size: 13px; cursor: pointer; font-family: inherit; padding: 6px; }
.btn-text-danger { background: none; border: none; color: var(--berry); font-size: 13px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; padding: 6px 0; }
.icon-btn { background: none; border: none; cursor: pointer; color: var(--ink-soft); padding: 6px; border-radius: 8px; display: flex; }
.icon-btn.subtle { opacity: 0.5; }

.disclaimer { font-size: 11.5px; color: var(--ink-soft); margin-top: 18px; line-height: 1.5; }
.disclaimer.top { margin-top: -8px; margin-bottom: 20px; }
.empty-state { color: var(--ink-soft); font-size: 13px; border: 1px dashed var(--border); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 8px; }

.onboarding { display: flex; align-items: center; justify-content: center; min-height: 100vh; width: 100%; padding: 24px; }
.onboard-card { max-width: 460px; width: 100%; }
.onboard-cycle-fields { margin-top: 4px; }

.cal-nav { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.cal-month-label { font-size: 15px; font-weight: 500; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px; }
.cal-weekdays { color: var(--ink-soft); font-size: 11px; text-align: center; margin-bottom: 8px; }
.cal-cell {
  aspect-ratio: 1; border: none; background: none; border-radius: 10px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px; font-size: 13px; cursor: pointer; font-family: inherit; color: var(--ink); position: relative;
}
.cal-cell.empty { cursor: default; }
.cal-cell[data-today="1"] { font-weight: 700; }
.cal-cell[data-selected="1"] { background: var(--track); }
.cal-dot { width: 6px; height: 6px; border-radius: 50%; }
.cal-legend { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0 24px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--ink-soft); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }

.log-panel { border: 1px solid var(--border); border-radius: 18px; padding: 20px; background: #fff; margin-top: 8px; }
.log-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.log-panel-actions { display: flex; align-items: center; gap: 16px; }

.chart-box { border: 1px solid var(--border); border-radius: 16px; padding: 12px 8px 4px; background: #fff; margin-bottom: 24px; }

.insight-card { border: 1px solid var(--border); border-radius: 16px; padding: 16px; background: #fff; margin-bottom: 24px; }
.insight-card p { margin: 0 0 8px; font-size: 13.5px; line-height: 1.55; }
.insight-card p:last-child { margin-bottom: 0; }

.accordion { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: #fff; }
.accordion-item { border-bottom: 1px solid var(--border); }
.accordion-item:last-child { border-bottom: none; }
.accordion-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: none; border: none; cursor: pointer; font-family: inherit; text-align: left; }
.accordion-title { flex: 1; font-size: 14px; font-weight: 500; }
.accordion-body { padding: 0 16px 18px 58px; display: flex; flex-direction: column; gap: 10px; }
.accordion-body p { font-size: 13.5px; line-height: 1.55; color: var(--ink-soft); margin: 0; }

.diet-card { padding: 16px; border-bottom: 1px solid var(--border); }
.diet-card:last-child { border-bottom: none; }
.diet-card-title { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px; color: var(--berry); }
.diet-section { margin-bottom: 12px; }
.diet-section:last-child { margin-bottom: 0; }
.diet-section-label { font-size: 11px; font-weight: 600; color: var(--ink-soft); margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.04em; }
.diet-section ul { margin: 0; padding-left: 18px; font-size: 13.5px; color: var(--ink); }
.diet-section li { margin-bottom: 4px; }
.diet-sample { list-style: none; padding-left: 0 !important; }
.diet-sample li { margin-bottom: 6px; }

.danger-zone { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border); }
.confirm-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 13px; color: var(--ink-soft); }

.loading-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: var(--ink-soft); font-size: 14px; }

.advice-list { display: flex; flex-direction: column; gap: 10px; margin: -4px 0 18px; }
.advice-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; }
.advice-symptom { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.advice-card ul { margin: 0; padding-left: 18px; font-size: 13px; color: var(--ink-soft); }
.advice-card li { margin-bottom: 3px; }
.note-flag.urgent { background: rgba(162, 58, 84, 0.1); color: var(--berry); display: flex; align-items: center; gap: 6px; margin: -4px 0 16px; font-size: 13px; padding: 8px 12px; border-radius: 10px; }

.chat-fab {
  position: fixed; bottom: 22px; right: 22px; width: 52px; height: 52px; border-radius: 50%;
  background: var(--berry); color: #fff; border: none; display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.18); z-index: 40;
}
.chat-panel {
  position: fixed; bottom: 84px; right: 22px; width: 320px; max-width: calc(100vw - 32px);
  max-height: 70vh; background: var(--paper); border: 1px solid var(--border); border-radius: 18px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2); display: flex; flex-direction: column; z-index: 40; overflow: hidden;
}
.chat-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid var(--border); background: #fff; }
.chat-head-title { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 14px; color: var(--berry); }
.chat-disclaimer {
  display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--berry);
  background: rgba(162, 58, 84, 0.08); padding: 7px 12px;
}
.chat-body { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.chat-msg { font-size: 13px; line-height: 1.5; padding: 8px 11px; border-radius: 12px; max-width: 88%; white-space: pre-line; }
.chat-msg.bot { background: var(--track); align-self: flex-start; }
.chat-msg.user { background: var(--berry); color: #fff; align-self: flex-end; }
.chat-quick { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 14px 10px; }
.chat-chip {
  font-family: inherit; font-size: 11.5px; padding: 5px 10px; border-radius: 20px;
  border: 1px solid var(--border); background: #fff; color: var(--ink); cursor: pointer;
}
.chat-input-row { display: flex; gap: 8px; align-items: center; padding: 10px 14px; border-top: 1px solid var(--border); background: #fff; }
.chat-input-row .text-input { flex: 1; margin-bottom: 0; }
.icon-btn.send { background: var(--berry); color: #fff; border-radius: 10px; }

@media (max-width: 480px) {
  .chat-panel { right: 12px; left: 12px; width: auto; bottom: 78px; }
  .chat-fab { right: 16px; bottom: 76px; }
}
`;

export default function RituApp() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [cycleLogs, setCycleLogs] = useState({});
  const [habitsData, setHabitsData] = useState({ config: [], completions: {} });
  const [mealsData, setMealsData] = useState({ completions: {} });
  const [page, setPage] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loadedProfile = null;
      try {
        const p = await window.storage.get("profile");
        if (p?.value) loadedProfile = JSON.parse(p.value);
      } catch (e) { /* no profile yet */ }
      try {
        const l = await window.storage.get("cycle-logs");
        if (l?.value && !cancelled) setCycleLogs(JSON.parse(l.value));
      } catch (e) { /* no logs yet */ }
      try {
        const h = await window.storage.get("habits");
        if (h?.value && !cancelled) setHabitsData(JSON.parse(h.value));
        else if (!cancelled) setHabitsData({ config: [], completions: {} });
      } catch (e) { if (!cancelled) setHabitsData({ config: [], completions: {} }); }
      try {
        const me = await window.storage.get("meals");
        if (me?.value && !cancelled) setMealsData(JSON.parse(me.value));
        else if (!cancelled) setMealsData({ completions: {} });
      } catch (e) { if (!cancelled) setMealsData({ completions: {} }); }
      if (!cancelled) {
        setProfile(loadedProfile);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function persist(key, value) {
    try { await window.storage.set(key, JSON.stringify(value), false); }
    catch (e) { /* best-effort persistence for this demo */ }
  }

  function handleOnboardingDone(newProfile) {
    setProfile(newProfile);
    persist("profile", newProfile);
    const habits = { config: defaultHabitsFor(newProfile.conditions), completions: {} };
    setHabitsData(habits);
    persist("habits", habits);
  }

  function saveProfile(updated) {
    setProfile(updated);
    persist("profile", updated);
    setPage("dashboard");
  }

  function saveLog(dateStr, entry) {
    const next = { ...cycleLogs, [dateStr]: entry };
    setCycleLogs(next);
    persist("cycle-logs", next);
    setSelectedDate(null);
  }

  function deleteLog(dateStr) {
    const next = { ...cycleLogs };
    delete next[dateStr];
    setCycleLogs(next);
    persist("cycle-logs", next);
    setSelectedDate(null);
  }

  function toggleHabit(habitId) {
    const tk = todayKey();
    const dayMap = { ...(habitsData.completions[tk] || {}) };
    dayMap[habitId] = !dayMap[habitId];
    const next = { ...habitsData, completions: { ...habitsData.completions, [tk]: dayMap } };
    setHabitsData(next);
    persist("habits", next);
  }

  function addHabit(habit) {
    const next = { ...habitsData, config: [...habitsData.config, habit] };
    setHabitsData(next);
    persist("habits", next);
  }

  function removeHabit(habitId) {
    const next = { ...habitsData, config: habitsData.config.filter((h) => h.id !== habitId) };
    setHabitsData(next);
    persist("habits", next);
  }

  function toggleMeal(slotId) {
    const tk = todayKey();
    const dayMap = { ...(mealsData.completions[tk] || {}) };
    dayMap[slotId] = !dayMap[slotId];
    const next = { ...mealsData, completions: { ...mealsData.completions, [tk]: dayMap } };
    setMealsData(next);
    persist("meals", next);
  }

  async function resetAll() {
    setProfile(null);
    setCycleLogs({});
    setHabitsData({ config: [], completions: {} });
    setMealsData({ completions: {} });
    setPage("dashboard");
    try { await window.storage.delete("profile"); } catch (e) {}
    try { await window.storage.delete("cycle-logs"); } catch (e) {}
    try { await window.storage.delete("habits"); } catch (e) {}
    try { await window.storage.delete("meals"); } catch (e) {}
  }

  const tracksCycle = profile ? !(profile.conditions.length > 0 && profile.conditions.every((c) => c === "menopause")) : false;

  let body = null;
  if (loading) {
    body = <div className="loading-screen">Loading your data…</div>;
  } else if (!profile) {
    body = <Onboarding onDone={handleOnboardingDone} />;
  } else {
    let content;
    if (page === "dashboard") {
      content = (
        <Dashboard
          profile={profile}
          cycleLogs={cycleLogs}
          habitsData={habitsData}
          onToggleHabit={toggleHabit}
          onOpenLog={(k) => { setSelectedDate(k); setPage("log"); }}
          tracksCycle={tracksCycle}
        />
      );
    } else if (page === "log") {
      content = (
        <CalendarPage
          cycleLogs={cycleLogs}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onSave={saveLog}
          onDelete={deleteLog}
        />
      );
    } else if (page === "habits") {
      content = <HabitsPage habitsData={habitsData} onToggleHabit={toggleHabit} onAddHabit={addHabit} onRemoveHabit={removeHabit} />;
    } else if (page === "meals") {
      content = <MealsPage profile={profile} mealsData={mealsData} onToggleMeal={toggleMeal} />;
    } else if (page === "insights") {
      content = <InsightsPage cycleLogs={cycleLogs} habitsData={habitsData} mealsData={mealsData} />;
    } else if (page === "learn") {
      content = <LearnPage conditions={profile.conditions} />;
    } else if (page === "profile") {
      content = <ProfilePage profile={profile} onSave={saveProfile} onReset={resetAll} />;
    }
    body = <NavShell page={page} setPage={setPage}>{content}</NavShell>;
  }

  return (
    <div className="ritu-root">
      <style>{STYLE}</style>
      {body}
      {!loading && <ChatWidget />}
    </div>
  );
}
