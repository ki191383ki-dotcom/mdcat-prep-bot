import { useState, useEffect, useRef } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: "bio", label: "Biology", emoji: "🧬", color: "#22c55e", topics: ["Cell Biology","Genetics","Evolution","Ecology","Human Physiology","Plant Biology","Biochemistry","Reproduction"] },
  { id: "chem", label: "Chemistry", emoji: "⚗️", color: "#3b82f6", topics: ["Atomic Structure","Chemical Bonding","Thermodynamics","Organic Chemistry","Acids & Bases","Electrochemistry","Kinetics","Equilibrium"] },
  { id: "phy", label: "Physics", emoji: "⚡", color: "#f59e0b", topics: ["Mechanics","Waves","Thermodynamics","Electromagnetism","Optics","Modern Physics","Fluid Mechanics","Nuclear Physics"] },
  { id: "eng", label: "English", emoji: "📝", color: "#ec4899", topics: ["Grammar","Vocabulary","Comprehension","Sentence Correction","Synonyms","Antonyms","Prepositions","Tenses"] },
  { id: "lr", label: "Logical Reasoning", emoji: "🧠", color: "#a78bfa", topics: ["Patterns","Analogies","Critical Thinking","Data Interpretation","Spatial Reasoning","Number Series","Coding-Decoding","Syllogisms"] },
];

const DIFFICULTIES = ["Easy","Medium","Hard"];

const SAMPLE_QUESTIONS = {
  bio: [
    { q: "Which organelle is called the 'powerhouse of the cell'?", opts: ["Nucleus","Mitochondria","Ribosome","Golgi Apparatus"], ans: 1, topic: "Cell Biology", diff: "Easy" },
    { q: "DNA replication occurs during which phase of the cell cycle?", opts: ["G1","G2","S phase","M phase"], ans: 2, topic: "Cell Biology", diff: "Medium" },
    { q: "Which type of RNA carries amino acids to the ribosome?", opts: ["mRNA","rRNA","tRNA","snRNA"], ans: 2, topic: "Biochemistry", diff: "Easy" },
    { q: "The law of segregation was proposed by:", opts: ["Darwin","Mendel","Watson","Morgan"], ans: 1, topic: "Genetics", diff: "Easy" },
    { q: "Which enzyme unwinds the DNA double helix during replication?", opts: ["DNA Polymerase","Ligase","Helicase","Primase"], ans: 2, topic: "Genetics", diff: "Hard" },
  ],
  chem: [
    { q: "The atomic number of Carbon is:", opts: ["6","12","8","4"], ans: 0, topic: "Atomic Structure", diff: "Easy" },
    { q: "Which bond is formed by sharing of electrons?", opts: ["Ionic","Covalent","Metallic","Hydrogen"], ans: 1, topic: "Chemical Bonding", diff: "Easy" },
    { q: "pH of pure water at 25°C is:", opts: ["0","7","14","1"], ans: 1, topic: "Acids & Bases", diff: "Easy" },
    { q: "Which gas is produced when zinc reacts with dilute HCl?", opts: ["Oxygen","Carbon dioxide","Hydrogen","Nitrogen"], ans: 2, topic: "Acids & Bases", diff: "Medium" },
    { q: "The hybridization of carbon in methane (CH4) is:", opts: ["sp","sp2","sp3","sp3d"], ans: 2, topic: "Organic Chemistry", diff: "Medium" },
  ],
  phy: [
    { q: "The SI unit of force is:", opts: ["Watt","Joule","Newton","Pascal"], ans: 2, topic: "Mechanics", diff: "Easy" },
    { q: "Speed of light in vacuum is approximately:", opts: ["3×10⁶ m/s","3×10⁸ m/s","3×10¹⁰ m/s","3×10⁴ m/s"], ans: 1, topic: "Modern Physics", diff: "Easy" },
    { q: "Which law states that every action has an equal and opposite reaction?", opts: ["Newton's 1st Law","Newton's 2nd Law","Newton's 3rd Law","Law of Gravitation"], ans: 2, topic: "Mechanics", diff: "Easy" },
    { q: "The frequency of a wave is 50 Hz. Its time period is:", opts: ["50 s","0.02 s","2 s","0.5 s"], ans: 1, topic: "Waves", diff: "Medium" },
    { q: "A transformer works on the principle of:", opts: ["Self-induction","Mutual induction","Magnetic effect","Electric effect"], ans: 1, topic: "Electromagnetism", diff: "Hard" },
  ],
  eng: [
    { q: "Choose the correct synonym of 'Benevolent':", opts: ["Cruel","Kind","Angry","Lazy"], ans: 1, topic: "Synonyms", diff: "Easy" },
    { q: "She ___ to the market yesterday. (Fill in the blank)", opts: ["go","goes","went","going"], ans: 2, topic: "Tenses", diff: "Easy" },
    { q: "Which sentence is grammatically correct?", opts: ["He don't know","He doesn't knows","He doesn't know","He not know"], ans: 2, topic: "Grammar", diff: "Easy" },
    { q: "Antonym of 'Verbose' is:", opts: ["Talkative","Concise","Loud","Shy"], ans: 1, topic: "Antonyms", diff: "Medium" },
    { q: "The preposition in 'She is good AT mathematics' indicates:", opts: ["Direction","Time","Subject/Field","Place"], ans: 2, topic: "Prepositions", diff: "Medium" },
  ],
  lr: [
    { q: "What comes next in the series: 2, 4, 8, 16, ___?", opts: ["24","32","30","28"], ans: 1, topic: "Number Series", diff: "Easy" },
    { q: "Dog is to Kennel as Bird is to:", opts: ["Nest","Cage","Tree","Sky"], ans: 0, topic: "Analogies", diff: "Easy" },
    { q: "If all roses are flowers and some flowers fade quickly, then:", opts: ["All roses fade","Some roses may fade","No roses fade","All flowers are roses"], ans: 1, topic: "Syllogisms", diff: "Medium" },
    { q: "If CAT = 24, then DOG = ?", opts: ["26","27","28","30"], ans: 2, topic: "Coding-Decoding", diff: "Hard" },
    { q: "Find the odd one out: Apple, Mango, Carrot, Banana", opts: ["Apple","Mango","Carrot","Banana"], ans: 2, topic: "Patterns", diff: "Easy" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const allQ = () => Object.values(SAMPLE_QUESTIONS).flat();

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MDCATBot() {
  const [screen, setScreen] = useState("home"); // home | practice | mock | chat | results
  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [score, setScore] = useState(0);
  const [aiExp, setAiExp] = useState("");
  const [loadingExp, setLoadingExp] = useState(false);
  const [chatHistory, setChatHistory] = useState([{ role: "ai", text: "Assalam o Alaikum! 👋 Main tumhara MDCAT AI tutor hun. Koi bhi topic pocho — Biology, Chemistry, Physics, English ya Logical Reasoning!" }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [mockTime, setMockTime] = useState(120 * 60);
  const [mockRunning, setMockRunning] = useState(false);
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mdcat_progress") || "{}"); } catch { return {}; }
  });
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  // Save progress
  useEffect(() => {
    try { localStorage.setItem("mdcat_progress", JSON.stringify(progress)); } catch {}
  }, [progress]);

  // Mock timer
  useEffect(() => {
    if (mockRunning && mockTime > 0) {
      timerRef.current = setInterval(() => setMockTime(t => t - 1), 1000);
    } else if (mockTime === 0 && mockRunning) {
      finishSession();
    }
    return () => clearInterval(timerRef.current);
  }, [mockRunning, mockTime]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Start practice
  const startPractice = (subj) => {
    const qs = shuffle(SAMPLE_QUESTIONS[subj.id] || []).slice(0, 5);
    setSubject(subj);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setAnswered([]);
    setScore(0);
    setAiExp("");
    setScreen("practice");
  };

  // Start mock test
  const startMock = () => {
    const qs = shuffle(allQ()).slice(0, 20);
    setSubject(null);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setAnswered([]);
    setScore(0);
    setAiExp("");
    setMockTime(40 * 60);
    setMockRunning(true);
    setScreen("mock");
  };

  // Answer question
  const handleAnswer = (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const q = questions[current];
    const correct = optIdx === q.ans;
    if (correct) setScore(s => s + 1);
    setAnswered(prev => [...prev, { ...q, chosen: optIdx, correct }]);
    if (screen === "practice") fetchExplanation(q, optIdx);
  };

  // AI Explanation
  const fetchExplanation = async (q, chosen) => {
    setLoadingExp(true);
    setAiExp("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert MDCAT tutor. Give a clear, concise explanation in simple English mixed with Urdu where helpful. Keep it under 120 words. Be encouraging.",
          messages: [{
            role: "user",
            content: `MCQ: "${q.q}"\nOptions: ${q.opts.join(", ")}\nCorrect Answer: ${q.opts[q.ans]}\nStudent chose: ${q.opts[chosen]}\nWas correct: ${chosen === q.ans}\n\nExplain why the correct answer is right. If wrong, gently correct the student.`
          }]
        })
      });
      const data = await res.json();
      setAiExp(data.content?.map(c => c.text || "").join("") || "");
    } catch { setAiExp("Explanation load nahi ho saki. Internet check karo!"); }
    setLoadingExp(false);
  };

  // Next question
  const nextQ = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAiExp("");
    } else {
      finishSession();
    }
  };

  // Finish session
  const finishSession = () => {
    clearInterval(timerRef.current);
    setMockRunning(false);
    // Update progress
    const subjId = subject?.id || "mock";
    setProgress(prev => ({
      ...prev,
      [subjId]: {
        attempts: (prev[subjId]?.attempts || 0) + 1,
        totalCorrect: (prev[subjId]?.totalCorrect || 0) + score,
        totalQ: (prev[subjId]?.totalQ || 0) + questions.length,
        lastScore: Math.round((score / questions.length) * 100),
      }
    }));
    setScreen("results");
  };

  // AI Chat
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(h => [...h, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert MDCAT tutor for Pakistani students. Answer questions about Biology, Chemistry, Physics, English, and Logical Reasoning. Mix English with simple Urdu where helpful. Be encouraging, concise, and exam-focused. Format answers clearly with key points.",
          messages: chatHistory.filter(m => m.role !== "ai" || chatHistory.indexOf(m) > 0).map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text
          })).concat([{ role: "user", content: userMsg }])
        })
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "Kuch masla ho gaya. Dobara try karo!";
      setChatHistory(h => [...h, { role: "ai", text: reply }]);
    } catch {
      setChatHistory(h => [...h, { role: "ai", text: "Internet connection check karo aur dobara try karo! 🔄" }]);
    }
    setChatLoading(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const totalAttempts = Object.values(progress).reduce((a, b) => a + (b.attempts || 0), 0);
  const totalCorrect = Object.values(progress).reduce((a, b) => a + (b.totalCorrect || 0), 0);
  const totalQDone = Object.values(progress).reduce((a, b) => a + (b.totalQ || 0), 0);

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const S = {
    page: { minHeight: "100vh", background: "#060b18", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", padding: "0 0 40px" },
    nav: { background: "rgba(6,11,24,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
    navBrand: { fontSize: "18px", fontWeight: 800, background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    wrap: { maxWidth: "720px", margin: "0 auto", padding: "0 16px" },
    card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "20px", marginBottom: "16px" },
    btn: (color = "#818cf8") => ({ background: color, border: "none", borderRadius: "12px", padding: "12px 22px", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer", transition: "opacity .2s", display: "inline-block" }),
    tag: (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: "8px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }),
    pill: { background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", cursor: "pointer" },
  };

  // ── SCREENS ─────────────────────────────────────────────────────────────────

  // HOME
  if (screen === "home") return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={S.navBrand}>🎓 MDCAT AI Prep</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setScreen("chat")} style={{ ...S.btn("#1e40af"), padding: "8px 14px", fontSize: "13px" }}>💬 AI Tutor</button>
        </div>
      </nav>

      <div style={S.wrap}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "36px 0 28px" }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>🏆</div>
          <h1 style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 900, margin: "0 0 10px", lineHeight: 1.2 }}>
            MDCAT <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Prep Bot</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "15px", margin: "0 0 24px" }}>AI-powered • Instant Explanations • Mock Tests • 5 Subjects</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={startMock} style={{ ...S.btn("linear-gradient(135deg,#f59e0b,#ef4444)"), fontSize: "16px", padding: "14px 28px" }}>🔥 Start Mock Test (20 Qs)</button>
            <button onClick={() => setScreen("chat")} style={{ ...S.btn("#1e293b"), border: "1px solid rgba(255,255,255,0.15)", fontSize: "15px" }}>💬 Ask AI Tutor</button>
          </div>
        </div>

        {/* Stats */}
        {totalAttempts > 0 && (
          <div style={{ ...S.card, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", textAlign: "center" }}>
            <div><div style={{ fontSize: "26px", fontWeight: 800, color: "#38bdf8" }}>{totalAttempts}</div><div style={{ fontSize: "12px", color: "#64748b" }}>Sessions</div></div>
            <div><div style={{ fontSize: "26px", fontWeight: 800, color: "#22c55e" }}>{totalQDone}</div><div style={{ fontSize: "12px", color: "#64748b" }}>Questions</div></div>
            <div><div style={{ fontSize: "26px", fontWeight: 800, color: "#f59e0b" }}>{totalQDone ? Math.round((totalCorrect / totalQDone) * 100) : 0}%</div><div style={{ fontSize: "12px", color: "#64748b" }}>Accuracy</div></div>
          </div>
        )}

        {/* Subjects */}
        <h2 style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>PRACTICE BY SUBJECT</h2>
        {SUBJECTS.map(subj => {
          const p = progress[subj.id];
          return (
            <div key={subj.id} style={{ ...S.card, cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }} onClick={() => startPractice(subj)}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: subj.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{subj.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{subj.label}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{subj.topics.slice(0, 3).join(" • ")}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {p ? <div style={{ ...S.tag(subj.color) }}>{p.lastScore}%</div> : <div style={{ ...S.tag("#64748b") }}>Start</div>}
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>{p ? `${p.attempts} sessions` : "Not started"}</div>
              </div>
            </div>
          );
        })}

        {/* Tips */}
        <div style={{ ...S.card, background: "rgba(56,189,248,0.06)", borderColor: "rgba(56,189,248,0.2)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#38bdf8" }}>💡 MDCAT Tips</h3>
          {["Focus on Biology — it has most weightage (58%)","Practice past papers daily for pattern recognition","For Physics, master formulas and their derivations","English vocab: learn 10 new words daily","Mock tests build speed and accuracy"].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "13px", color: "#94a3b8" }}>
              <span style={{ color: "#38bdf8", flexShrink: 0 }}>→</span>{tip}
            </div>
          ))}
        </div>
      </div>
      <style>{`button:hover{opacity:.85!important} input:focus{outline:none}`}</style>
    </div>
  );

  // PRACTICE / MOCK
  if (screen === "practice" || screen === "mock") {
    const q = questions[current];
    if (!q) return null;
    const isAnswered = selected !== null;
    const subj = SUBJECTS.find(s => s.id === q.id) || subject;

    return (
      <div style={S.page}>
        <nav style={S.nav}>
          <button onClick={() => { clearInterval(timerRef.current); setScreen("home"); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}>← Back</button>
          <span style={S.navBrand}>{screen === "mock" ? "🔥 Mock Test" : `${subject?.emoji} ${subject?.label}`}</span>
          {screen === "mock" && (
            <span style={{ color: mockTime < 300 ? "#ef4444" : "#f59e0b", fontWeight: 700, fontSize: "15px" }}>⏱ {formatTime(mockTime)}</span>
          )}
        </nav>

        <div style={S.wrap}>
          {/* Progress */}
          <div style={{ padding: "16px 0 8px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>{current + 1}/{questions.length}</span>
            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((current) / questions.length) * 100}%`, background: "linear-gradient(90deg,#38bdf8,#818cf8)", borderRadius: "3px", transition: "width .3s" }} />
            </div>
            <span style={{ fontSize: "13px", color: "#22c55e" }}>✓ {score}</span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            <span style={S.tag("#38bdf8")}>{q.topic}</span>
            <span style={S.tag(q.diff === "Easy" ? "#22c55e" : q.diff === "Medium" ? "#f59e0b" : "#ef4444")}>{q.diff}</span>
          </div>

          {/* Question */}
          <div style={{ ...S.card, background: "rgba(56,189,248,0.05)", borderColor: "rgba(56,189,248,0.15)" }}>
            <p style={{ margin: 0, fontSize: "clamp(15px,3vw,18px)", fontWeight: 600, lineHeight: 1.6, color: "#e2e8f0" }}>{q.q}</p>
          </div>

          {/* Options */}
          {q.opts.map((opt, i) => {
            let bg = "rgba(255,255,255,0.05)";
            let border = "1px solid rgba(255,255,255,0.08)";
            let color = "#e2e8f0";
            if (isAnswered) {
              if (i === q.ans) { bg = "rgba(34,197,94,0.15)"; border = "1px solid #22c55e"; color = "#86efac"; }
              else if (i === selected && selected !== q.ans) { bg = "rgba(239,68,68,0.15)"; border = "1px solid #ef4444"; color = "#fca5a5"; }
            } else if (selected === i) { border = "1px solid #818cf8"; }

            return (
              <div key={i} onClick={() => handleAnswer(i)}
                style={{ ...S.card, margin: "0 0 10px", cursor: isAnswered ? "default" : "pointer", background: bg, border, color, display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", transition: "all .2s" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: isAnswered && i === q.ans ? "#22c55e" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                  {isAnswered && i === q.ans ? "✓" : isAnswered && i === selected ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontSize: "15px" }}>{opt}</span>
              </div>
            );
          })}

          {/* AI Explanation */}
          {isAnswered && screen === "practice" && (
            <div style={{ ...S.card, background: "rgba(129,140,248,0.08)", borderColor: "rgba(129,140,248,0.25)", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "18px" }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#a5b4fc" }}>AI Explanation</span>
                {loadingExp && <span style={{ fontSize: "12px", color: "#64748b" }}>Loading...</span>}
              </div>
              {loadingExp ? (
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#818cf8", animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.7, color: "#cbd5e1" }}>{aiExp}</p>
              )}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button onClick={nextQ} style={{ ...S.btn("linear-gradient(135deg,#818cf8,#6d28d9)"), width: "100%", padding: "14px", fontSize: "16px", marginTop: "8px" }}>
              {current < questions.length - 1 ? "Next Question →" : "See Results 🏆"}
            </button>
          )}
        </div>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} button:hover{opacity:.85!important}`}</style>
      </div>
    );
  }

  // RESULTS
  if (screen === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct >= 80 ? "Zabardast! 🔥 Excellent performance!" : pct >= 60 ? "Acha hai! 👍 Keep it up!" : "Practice more karo! 💪 You can do it!";
    return (
      <div style={S.page}>
        <nav style={S.nav}>
          <span style={S.navBrand}>🏆 Results</span>
        </nav>
        <div style={S.wrap}>
          <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "12px" }}>{pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : "📚"}</div>
            <div style={{ fontSize: "56px", fontWeight: 900, background: pct >= 80 ? "linear-gradient(90deg,#22c55e,#38bdf8)" : pct >= 60 ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "linear-gradient(90deg,#818cf8,#6d28d9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{pct}%</div>
            <p style={{ color: "#94a3b8", fontSize: "17px", margin: "8px 0 0" }}>{msg}</p>
          </div>

          <div style={{ ...S.card, display: "grid", gridTemplateColumns: "repeat(3,1fr)", textAlign: "center", gap: "8px" }}>
            <div><div style={{ fontSize: "24px", fontWeight: 800, color: "#22c55e" }}>{score}</div><div style={{ fontSize: "12px", color: "#64748b" }}>Correct</div></div>
            <div><div style={{ fontSize: "24px", fontWeight: 800, color: "#ef4444" }}>{questions.length - score}</div><div style={{ fontSize: "12px", color: "#64748b" }}>Wrong</div></div>
            <div><div style={{ fontSize: "24px", fontWeight: 800, color: "#38bdf8" }}>{questions.length}</div><div style={{ fontSize: "12px", color: "#64748b" }}>Total</div></div>
          </div>

          {/* Review */}
          <h3 style={{ fontSize: "14px", color: "#64748b", letterSpacing: "1px", fontWeight: 700, marginBottom: "10px" }}>QUESTION REVIEW</h3>
          {answered.map((a, i) => (
            <div key={i} style={{ ...S.card, borderColor: a.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <span>{a.correct ? "✅" : "❌"}</span>
                <span style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>{a.q}</span>
              </div>
              {!a.correct && <div style={{ fontSize: "13px", color: "#94a3b8" }}>✓ Correct: <span style={{ color: "#86efac", fontWeight: 600 }}>{a.opts[a.ans]}</span></div>}
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button onClick={() => setScreen("home")} style={{ ...S.btn("#1e293b"), flex: 1, border: "1px solid rgba(255,255,255,0.1)" }}>🏠 Home</button>
            <button onClick={() => subject ? startPractice(subject) : startMock()} style={{ ...S.btn("linear-gradient(135deg,#818cf8,#6d28d9)"), flex: 1 }}>🔄 Try Again</button>
          </div>
          <button onClick={() => setScreen("chat")} style={{ ...S.btn("#0f172a"), width: "100%", marginTop: "10px", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>💬 Ask AI Tutor about weak areas</button>
        </div>
        <style>{`button:hover{opacity:.85!important}`}</style>
      </div>
    );
  }

  // CHAT / AI TUTOR
  if (screen === "chat") return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", height: "100vh", padding: 0 }}>
      <nav style={S.nav}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}>← Back</button>
        <span style={S.navBrand}>💬 AI Tutor</span>
        <span style={{ fontSize: "12px", color: "#22c55e" }}>● Online</span>
      </nav>

      {/* Quick topics */}
      <div style={{ padding: "10px 16px", display: "flex", gap: "8px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {["Explain DNA Replication","What is pH?","Newton's Laws","MDCAT syllabus","Tips for Biology"].map(t => (
          <button key={t} onClick={() => { setChatInput(t); }} style={{ ...S.pill, whiteSpace: "nowrap", background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)", cursor: "pointer" }}>{t}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {chatHistory.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "8px" }}>
            {msg.role === "ai" && <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#38bdf8,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🎓</div>}
            <div style={{
              maxWidth: "80%",
              background: msg.role === "user" ? "linear-gradient(135deg,#818cf8,#6d28d9)" : "rgba(255,255,255,0.07)",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px",
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#e2e8f0",
              border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
              whiteSpace: "pre-wrap",
            }}>{msg.text}</div>
          </div>
        ))}
        {chatLoading && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#38bdf8,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🎓</div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: "6px" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#818cf8", animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "10px", background: "rgba(6,11,24,0.95)" }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendChat()}
          placeholder="Koi bhi sawaal pocho... 🧬⚗️⚡"
          style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "12px 16px", color: "#e2e8f0", fontSize: "15px", outline: "none" }}
        />
        <button onClick={sendChat} disabled={chatLoading} style={{ ...S.btn("linear-gradient(135deg,#38bdf8,#818cf8)"), padding: "12px 18px", flexShrink: 0 }}>
          {chatLoading ? "..." : "Send"}
        </button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} button:hover{opacity:.85!important} input::placeholder{color:rgba(255,255,255,0.3)}`}</style>
    </div>
  );

  return null;
}
