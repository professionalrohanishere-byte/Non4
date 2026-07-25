(function () {
  "use strict";
  const SP = "businessos:";
  const MODULES = [
    { key: "lessons", label: "LESSONS", icon: "◈" },
    { key: "ideas", label: "IDEAS", icon: "✦" },
    { key: "judge", label: "JUDGE", icon: "⚖" },
    { key: "progress", label: "PROGRESS", icon: "⌖" },
  ];
  let active = "lessons";
  let lessonCat = null;
  let judgeStep = 0;
  let judgeAnswers = {};
  let judgeIdeaTitle = "";
  let judgeResult = null;

  const QUESTIONS = [
    { key: "customer", q: "Who exactly is your customer? Be specific — age, job, situation.", tip: "Try naming one real specific person you know who fits, instead of 'everyone'." },
    { key: "problem", q: "What painful problem do they have today?", tip: "Painful means they're already trying (badly) to solve it some other way. What way?" },
    { key: "solution", q: "How does your idea solve it better than what they already do?", tip: "Compare directly: 'instead of X, they'd get Y' — be concrete." },
    { key: "money", q: "How will you make money? Who pays, how much, how often?", tip: "Put an actual number on it, even a guess — 'maybe $5/month' is more useful than 'a subscription.'" },
    { key: "marketsize", q: "Roughly how many people have this problem? How do you know?", tip: "Even a rough guess with reasoning ('my city has ~200 shops like this') beats no number." },
    { key: "competition", q: "Who else solves this today, and why would people choose you instead?", tip: "If you truly can't think of anyone, that's often a red flag, not a good sign." },
    { key: "nextstep", q: "What's the smallest possible step you could take THIS WEEK to test this?", tip: "Smaller than you think — a text message to 5 people counts." },
  ];

  /* ---------- sound ---------- */
  let audioCtx = null;
  function ensureAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return audioCtx; }
  function tick(freq = 780, dur = 0.06, vol = 0.04) {
    const ctx = ensureAudio(); if (!ctx) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq; g.gain.value = vol;
      o.connect(g); g.connect(ctx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }
  const soundTap = () => tick(740, 0.06, 0.035);
  const soundGood = () => { tick(900, 0.08, 0.04); setTimeout(() => tick(1300, 0.1, 0.04), 90); };
  document.addEventListener("pointerdown", ensureAudio, { once: true });

  /* ---------- storage ---------- */
  function getJSON(key, fallback) { try { const r = localStorage.getItem(SP + key); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; } }
  function setJSON(key, val) { try { localStorage.setItem(SP + key, JSON.stringify(val)); } catch (e) {} }
  let ideas = getJSON("ideas", []);
  let learned = getJSON("learned", {});
  let judgedLog = getJSON("judged", []);
  let apiKey = localStorage.getItem(SP + "geminiKey") || "";

  function saveIdeas() { setJSON("ideas", ideas); }
  function saveLearned() { setJSON("learned", learned); }
  function saveJudged() { setJSON("judged", judgedLog); }

  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* ---------- boot ---------- */
  function boot() {
    const pctEl = document.getElementById("boot-pct"), barEl = document.getElementById("boot-bar-fill");
    let pct = 0;
    const t = setInterval(() => {
      pct += Math.random() * 22;
      if (pct >= 100) { pct = 100; clearInterval(t); setTimeout(() => { document.getElementById("boot-screen").classList.add("hidden"); startApp(); }, 200); }
      pctEl.textContent = Math.floor(pct) + "%"; barEl.style.width = pct + "%";
    }, 80);
  }

  function tickClock() {
    const el = document.getElementById("clock");
    function u() {
      const now = new Date();
      el.textContent = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit" }).toUpperCase() + " · " + now.toLocaleTimeString(undefined, { hour12: false });
    }
    u(); setInterval(u, 1000);
  }

  function spawnAmbientParticles() {
    const field = document.getElementById("ambient-field"); if (!field) return;
    let html = "";
    for (let i = 0; i < 20; i++) html += `<span style="left:${Math.random()*100}%; bottom:-10px; animation-duration:${8+Math.random()*14}s; animation-delay:${Math.random()*12}s;"></span>`;
    field.innerHTML = html;
  }

  /* ---------- nav ---------- */
  function renderNav() {
    const nav = document.getElementById("nav-buttons"); nav.innerHTML = "";
    MODULES.forEach((m) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (m.key === active ? " active" : "");
      btn.innerHTML = `<span class="orb">${m.icon}</span><span class="label">${m.label}</span>`;
      btn.onclick = () => { soundTap(); setActive(m.key); };
      nav.appendChild(btn);
    });
    const mnav = document.getElementById("mobile-nav"); mnav.innerHTML = "";
    MODULES.forEach((m) => {
      const btn = document.createElement("button");
      btn.className = "mobile-nav-btn" + (m.key === active ? " active" : "");
      btn.innerHTML = `<span class="orb">${m.icon}</span><span class="label">${m.label}</span>`;
      btn.onclick = () => { soundTap(); setActive(m.key); };
      mnav.appendChild(btn);
    });
  }
  function setActive(key) { active = key; lessonCat = null; if (key !== "judge") { judgeStep = 0; } renderNav(); renderPanel(); }

  /* ---------- panel dispatcher ---------- */
  function renderPanel() {
    const panel = document.getElementById("panel");
    if (active === "lessons") renderLessons(panel);
    else if (active === "ideas") renderIdeas(panel);
    else if (active === "judge") renderJudge(panel);
    else if (active === "progress") renderProgress(panel);
    renderProgressBars();
  }

  /* ---------- LESSONS ---------- */
  function renderLessons(panel) {
    if (!lessonCat) {
      let cards = "";
      Object.keys(LESSONS).forEach((key) => {
        const cat = LESSONS[key];
        const total = cat.items.length;
        const done = cat.items.filter((_, i) => learned[key + ":" + i]).length;
        cards += `<button class="cat-card" data-cat="${key}">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-label">${cat.label}</span>
          <span class="cat-progress">${done}/${total} learned</span>
        </button>`;
      });
      panel.innerHTML = `
        <div class="panel-header"><div class="panel-header-left"><span class="panel-icon">◈</span><span class="panel-title">LESSONS</span></div><span class="panel-meta">PICK A TOPIC</span></div>
        <div class="cat-grid">${cards}</div>`;
      panel.querySelectorAll(".cat-card").forEach((b) => b.onclick = () => { soundTap(); lessonCat = b.dataset.cat; renderPanel(); });
      return;
    }
    const cat = LESSONS[lessonCat];
    let cards = cat.items.map((item, i) => {
      const isLearned = !!learned[lessonCat + ":" + i];
      return `
      <div class="lesson-card ${isLearned ? "learned" : ""}" data-i="${i}">
        <div class="lesson-title-row">
          <span class="lesson-title">${escapeHtml(item.title)}</span>
          <button class="lesson-check" data-i="${i}">${isLearned ? "✔ LEARNED" : "MARK LEARNED"}</button>
        </div>
        <div class="lesson-block"><span class="lesson-label">SIMPLE</span><p>${escapeHtml(item.simple)}</p></div>
        <div class="lesson-block"><span class="lesson-label gold">EXAMPLE</span><p>${escapeHtml(item.example)}</p></div>
        <div class="lesson-block"><span class="lesson-label gold">TRY THIS</span><p>${escapeHtml(item.tip)}</p></div>
      </div>`;
    }).join("");
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-header-left"><button class="back-btn" id="lesson-back">←</button><span class="panel-icon">${cat.icon}</span><span class="panel-title">${cat.label}</span></div>
        <span class="panel-meta">${cat.items.length} LESSONS</span>
      </div>
      <div class="lesson-list">${cards}</div>`;
    document.getElementById("lesson-back").onclick = () => { soundTap(); lessonCat = null; renderPanel(); };
    panel.querySelectorAll(".lesson-check").forEach((b) => b.onclick = () => {
      soundGood();
      const i = b.dataset.i; const k = lessonCat + ":" + i;
      learned[k] = !learned[k]; saveLearned(); renderPanel();
    });
  }

  /* ---------- IDEAS ---------- */
  function renderIdeas(panel) {
    let rows = ideas.length ? ideas.map((it) => `
      <div class="entry" data-id="${it.id}">
        <span class="entry-dot"></span>
        <div class="entry-body">
          <span class="entry-text">${escapeHtml(it.title)}</span>
          ${it.judged ? `<span class="entry-sub">Judged: ${it.judged.overall}/100</span>` : `<span class="entry-sub muted">Not judged yet</span>`}
        </div>
        <button class="entry-mini-btn" data-act="judge" data-id="${it.id}">JUDGE</button>
        <button class="entry-del" data-id="${it.id}">✕</button>
      </div>`).join("") : `<div class="empty-state">NO IDEAS YET — LOG YOUR FIRST ONE BELOW</div>`;

    panel.innerHTML = `
      <div class="panel-header"><div class="panel-header-left"><span class="panel-icon">✦</span><span class="panel-title">IDEAS</span></div><span class="panel-meta">${ideas.length} LOGGED</span></div>
      <div class="input-row"><input id="idea-input" type="text" placeholder="One-sentence idea…" autocomplete="off" /><button id="idea-log-btn"><span class="plus">+</span><span class="log-text">LOG</span></button></div>
      <div class="entry-list">${rows}</div>`;

    document.getElementById("idea-log-btn").onclick = addIdea;
    document.getElementById("idea-input").addEventListener("keydown", (e) => { if (e.key === "Enter") addIdea(); });
    panel.querySelectorAll(".entry-del").forEach((b) => b.onclick = () => { soundTap(); ideas = ideas.filter((i) => i.id !== b.dataset.id); saveIdeas(); renderPanel(); });
    panel.querySelectorAll('[data-act="judge"]').forEach((b) => b.onclick = () => {
      soundTap();
      const idea = ideas.find((i) => i.id === b.dataset.id);
      judgeIdeaTitle = idea.title; judgeAnswers = {}; judgeStep = 0; judgeResult = null;
      setActive("judge");
    });
  }
  function addIdea() {
    const input = document.getElementById("idea-input");
    const text = input.value.trim(); if (!text) return;
    ideas.unshift({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), title: text, judged: null });
    saveIdeas(); input.value = ""; soundGood(); renderPanel();
  }

  /* ---------- JUDGE ---------- */
  function scoreAnswer(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).filter(Boolean);
    let score = Math.min(70, words.length * 5);
    if (/\$|\d/.test(text)) score += 15;
    const vague = ["everyone", "everybody", "anyone", "somehow", "maybe", "stuff", "things", "just", "kind of", "sort of"];
    const lower = text.toLowerCase();
    const hits = vague.filter((v) => lower.includes(v)).length;
    score -= hits * 8;
    return Math.max(5, Math.min(100, Math.round(score)));
  }

  function renderJudge(panel) {
    if (judgeResult) { renderJudgeResult(panel); return; }

    if (judgeStep === -1 || (!judgeIdeaTitle && judgeStep === 0 && Object.keys(judgeAnswers).length === 0)) {
      // idea title entry step
    }

    if (!judgeIdeaTitle) {
      panel.innerHTML = `
        <div class="panel-header"><div class="panel-header-left"><span class="panel-icon">⚖</span><span class="panel-title">JUDGE</span></div><span class="panel-meta">STEP 0 / ${QUESTIONS.length}</span></div>
        <div class="judge-intro">
          <div class="judge-q">What's the idea, in one sentence?</div>
          <input id="judge-title-input" type="text" placeholder="e.g. An app that reminds shop owners to restock…" autocomplete="off" />
          <button class="setup-btn" id="judge-title-next">START JUDGING →</button>
        </div>`;
      document.getElementById("judge-title-next").onclick = () => {
        const v = document.getElementById("judge-title-input").value.trim();
        if (!v) return;
        soundGood(); judgeIdeaTitle = v; judgeStep = 0; renderPanel();
      };
      return;
    }

    const q = QUESTIONS[judgeStep];
    panel.innerHTML = `
      <div class="panel-header"><div class="panel-header-left"><span class="panel-icon">⚖</span><span class="panel-title">JUDGE</span></div><span class="panel-meta">STEP ${judgeStep+1} / ${QUESTIONS.length}</span></div>
      <div class="judge-intro">
        <div class="judge-idea-chip">"${escapeHtml(judgeIdeaTitle)}"</div>
        <div class="judge-q">${q.q}</div>
        <textarea id="judge-answer" rows="4" placeholder="Type your honest answer…">${escapeHtml(judgeAnswers[q.key] || "")}</textarea>
        <div class="judge-hint">${q.tip}</div>
        <div class="judge-nav">
          ${judgeStep > 0 ? `<button class="setup-btn ghost" id="judge-back">← BACK</button>` : `<span></span>`}
          <button class="setup-btn" id="judge-next">${judgeStep === QUESTIONS.length - 1 ? "GET MY RESULT →" : "NEXT →"}</button>
        </div>
      </div>`;
    if (judgeStep > 0) document.getElementById("judge-back").onclick = () => { soundTap(); judgeAnswers[q.key] = document.getElementById("judge-answer").value; judgeStep--; renderPanel(); };
    document.getElementById("judge-next").onclick = () => {
      soundTap();
      judgeAnswers[q.key] = document.getElementById("judge-answer").value;
      if (judgeStep < QUESTIONS.length - 1) { judgeStep++; renderPanel(); }
      else { finishJudging(); }
    };
  }

  function finishJudging() {
    const scores = {};
    QUESTIONS.forEach((q) => { scores[q.key] = scoreAnswer(judgeAnswers[q.key]); });
    const overall = Math.round(QUESTIONS.reduce((s, q) => s + scores[q.key], 0) / QUESTIONS.length);
    judgeResult = { title: judgeIdeaTitle, scores, overall, answers: { ...judgeAnswers }, ai: null };
    const matching = ideas.find((i) => i.title === judgeIdeaTitle);
    if (matching) { matching.judged = { overall, scores }; saveIdeas(); }
    judgedLog.unshift({ title: judgeIdeaTitle, overall, date: new Date().toISOString() });
    saveJudged();
    soundGood();
    renderPanel();
  }

  function renderJudgeResult(panel) {
    const weakest = QUESTIONS.map((q) => ({ key: q.key, q: q.q, tip: q.tip, score: judgeResult.scores[q.key] })).sort((a, b) => a.score - b.score);
    const bars = QUESTIONS.map((q) => {
      const s = judgeResult.scores[q.key];
      const color = s >= 65 ? "#4fd8ff" : s >= 40 ? "#ffb020" : "#ff5a5a";
      return `<div class="score-row"><div class="score-top"><span>${q.q.split("?")[0]}</span><span>${s}/100</span></div><div class="score-track"><div class="score-fill" style="width:${s}%;background:${color}"></div></div></div>`;
    }).join("");
    const weakTips = weakest.slice(0, 2).map((w) => `<div class="weak-tip"><strong>${w.q}</strong><br/>${w.tip}</div>`).join("");

    panel.innerHTML = `
      <div class="panel-header"><div class="panel-header-left"><span class="panel-icon">⚖</span><span class="panel-title">RESULT</span></div><span class="panel-meta">${judgeResult.overall}/100 OVERALL</span></div>
      <div class="judge-result">
        <div class="judge-idea-chip">"${escapeHtml(judgeResult.title)}"</div>
        <div class="overall-ring-wrap" id="overall-ring"></div>
        <div class="score-list">${bars}</div>
        <div class="weak-section"><div class="rail-label">WHAT TO STRENGTHEN FIRST</div>${weakTips}</div>

        <div class="ai-section">
          <div class="rail-label">OPTIONAL — REAL AI FEEDBACK</div>
          <div class="ai-note">Needs a free Gemini API key (no cost, no card) from <span class="mono">aistudio.google.com</span>. Only used when you tap the button below — nothing sent otherwise.</div>
          <input id="gemini-key-input" type="text" placeholder="Paste your free Gemini API key (optional)" value="${apiKey ? "••••••••••••" : ""}" />
          <button class="setup-btn ghost" id="save-key-btn">SAVE KEY</button>
          <button class="setup-btn" id="ai-feedback-btn">GET AI FEEDBACK</button>
          <div id="ai-output"></div>
        </div>

        <button class="setup-btn ghost" id="judge-again">JUDGE ANOTHER IDEA</button>
      </div>`;

    renderOverallRing();

    document.getElementById("save-key-btn").onclick = () => {
      const v = document.getElementById("gemini-key-input").value.trim();
      if (v && v !== "••••••••••••") { apiKey = v; localStorage.setItem(SP + "geminiKey", apiKey); soundGood(); document.getElementById("gemini-key-input").value = "••••••••••••"; }
    };
    document.getElementById("ai-feedback-btn").onclick = fetchAiFeedback;
    document.getElementById("judge-again").onclick = () => { soundTap(); judgeIdeaTitle = ""; judgeAnswers = {}; judgeStep = 0; judgeResult = null; renderPanel(); };
  }

  function renderOverallRing() {
    const el = document.getElementById("overall-ring"); if (!el) return;
    const pct = judgeResult.overall, size = 120, r = size/2-8, c = 2*Math.PI*r, off = c-(pct/100)*c;
    el.innerHTML = `<div style="position:relative;width:${size}px;height:${size}px;margin:0 auto;">
      <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(79,216,255,0.12)" stroke-width="3"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#gg)" stroke-width="3" stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round"/>
        <defs><linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4fd8ff"/><stop offset="100%" stop-color="#ffb020"/></linearGradient></defs>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <span style="font-family:Orbitron,sans-serif;font-size:26px;font-weight:700;color:#67e0ff;">${pct}</span>
        <span style="font-size:9px;letter-spacing:0.15em;color:rgba(79,216,255,0.5);">OVERALL</span>
      </div></div>`;
  }

  async function fetchAiFeedback() {
    const out = document.getElementById("ai-output");
    if (!apiKey) { out.innerHTML = `<div class="ai-error">No API key saved yet — paste one above and hit SAVE KEY first.</div>`; return; }
    out.innerHTML = `<div class="ai-loading">Contacting AI… (only works when you're online)</div>`;
    const prompt = `You are a blunt but kind business mentor explaining things simply, like to a total beginner. 
Idea: "${judgeResult.title}"
Customer: ${judgeResult.answers.customer}
Problem: ${judgeResult.answers.problem}
Solution: ${judgeResult.answers.solution}
Money: ${judgeResult.answers.money}
Market size: ${judgeResult.answers.marketsize}
Competition: ${judgeResult.answers.competition}
Next step: ${judgeResult.answers.nextstep}

Give: 1) one honest sentence on the biggest weakness, 2) one honest sentence on the biggest strength, 3) exactly one concrete next action. Keep it under 100 words total, simple words, no jargon.`;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Request failed");
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "No response text returned.";
      out.innerHTML = `<div class="ai-response">${escapeHtml(text).replace(/\n/g, "<br/>")}</div>`;
      soundGood();
    } catch (e) {
      out.innerHTML = `<div class="ai-error">Couldn't get AI feedback: ${escapeHtml(e.message)}. Check your key, your internet, or try again in a minute (free tier has limits).</div>`;
    }
  }

  /* ---------- PROGRESS ---------- */
  function renderProgress(panel) {
    const totalLessons = Object.values(LESSONS).reduce((s, c) => s + c.items.length, 0);
    const doneLessons = Object.keys(learned).filter((k) => learned[k]).length;
    const avgScore = judgedLog.length ? Math.round(judgedLog.reduce((s, j) => s + j.overall, 0) / judgedLog.length) : 0;
    const recentJudged = judgedLog.slice(0, 6).map((j) => `<div class="entry"><span class="entry-dot"></span><div class="entry-body"><span class="entry-text">${escapeHtml(j.title)}</span><span class="entry-sub">${j.overall}/100 · ${new Date(j.date).toLocaleDateString()}</span></div></div>`).join("") || `<div class="empty-state">NOTHING JUDGED YET</div>`;

    panel.innerHTML = `
      <div class="panel-header"><div class="panel-header-left"><span class="panel-icon">⌖</span><span class="panel-title">PROGRESS</span></div><span class="panel-meta">YOUR JOURNEY</span></div>
      <div class="progress-stats">
        <div class="stat-block"><span class="stat-num">${doneLessons}/${totalLessons}</span><span class="stat-lbl">LESSONS LEARNED</span></div>
        <div class="stat-block"><span class="stat-num">${ideas.length}</span><span class="stat-lbl">IDEAS LOGGED</span></div>
        <div class="stat-block"><span class="stat-num">${judgedLog.length}</span><span class="stat-lbl">IDEAS JUDGED</span></div>
        <div class="stat-block"><span class="stat-num">${avgScore}</span><span class="stat-lbl">AVG SCORE</span></div>
      </div>
      <div class="rail-label" style="margin-top:16px;">RECENTLY JUDGED</div>
      <div class="entry-list">${recentJudged}</div>`;
  }

  function renderProgressBars() {
    const el = document.getElementById("progress-bars"); if (!el) return;
    const totalLessons = Object.values(LESSONS).reduce((s, c) => s + c.items.length, 0);
    const doneLessons = Object.keys(learned).filter((k) => learned[k]).length;
    const lessonsPct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
    const judgedPct = ideas.length ? Math.round((ideas.filter((i) => i.judged).length / ideas.length) * 100) : 0;
    el.innerHTML = `
      <div class="overview-item"><div class="overview-top"><span>LESSONS</span><span>${doneLessons}/${totalLessons}</span></div><div class="overview-track"><div class="overview-fill" style="width:${lessonsPct}%"></div></div></div>
      <div class="overview-item"><div class="overview-top"><span>IDEAS JUDGED</span><span>${judgedPct}%</span></div><div class="overview-track"><div class="overview-fill" style="width:${judgedPct}%"></div></div></div>`;
  }

  function startApp() {
    document.getElementById("app").classList.remove("hidden");
    tickClock(); spawnAmbientParticles(); renderNav(); renderPanel();
  }

  boot();
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
})();
