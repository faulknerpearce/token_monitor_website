// Live preview of the TokenMon menu bar dropdown.
//
// Each panel follows the layout of its SwiftUI view in the app (ProviderSwitcherView,
// PanelCard, SlimUsageTrack, DailyBudgetBarsView, MetricStatGrid, OverviewPanelView).
// Usage figures are sample values; dates are computed from today.
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DAY = 86400000;

  /* ---------- Colours (ProviderAccent at 0.85, as ProviderColors uses) ---------- */
  const C = {
    grok: "rgb(28 97 209 / 0.85)",
    cursor: "rgb(46 135 97 / 0.85)",
    opencode: "rgb(255 140 0 / 0.85)",
    claude: "rgb(217 120 87 / 0.85)",
    chatgpt: "rgb(41 133 117 / 0.85)",
    openrouter: "rgb(115 92 230 / 0.85)",
    grokbot: "rgb(97 107 128 / 0.85)",
    zen: "rgb(140 90 220 / 0.78)",
  };
  // Grok product palette (ProductColor).
  const P = {
    chat: "rgb(28 97 209)",
    build: "rgb(140 199 255)",
    api: "rgb(56 82 122)",
    imagine: "rgb(191 230 255)",
  };

  const LOGO = {
    grok: "assets/logos/grok.png",
    cursor: "assets/logos/cursor.svg",
    opencode: "assets/logos/opencode.svg",
    claude: "assets/logos/claude.svg",
    chatgpt: "assets/logos/chatgpt.svg",
    openrouter: "assets/logos/openrouter.svg",
    grokbot: "assets/logos/grokbot.svg",
    tokenmon: "assets/logos/tokenmon-mark.png",
  };

  /* ---------- SF Symbol stand-ins ---------- */
  const ICON = {
    gear: '<svg class="tm-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M10.3 3.2h3.4l.5 2.4c.7.25 1.35.63 1.9 1.1l2.3-.8 1.7 2.95-1.85 1.6a7 7 0 0 1 0 2.1l1.85 1.6-1.7 2.95-2.3-.8c-.55.47-1.2.85-1.9 1.1l-.5 2.4h-3.4l-.5-2.4a7 7 0 0 1-1.9-1.1l-2.3.8-1.7-2.95 1.85-1.6a7 7 0 0 1 0-2.1L3.9 8.85l1.7-2.95 2.3.8c.55-.47 1.2-.85 1.9-1.1Z"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    signOut: '<svg class="tm-icon tm-icon--tertiary" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M19.6 10.4A8.5 8.5 0 1 0 13.6 20"/><circle cx="11" cy="9.6" r="3"/><path d="M5.8 17.6c1.3-1.8 3.1-2.7 5.2-2.7 1 0 1.9.2 2.7.6"/><path d="M16.2 17.8h5.4"/></g></svg>',
    left: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M6.5 1.5 3 5l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3.5 1.5 7 5 3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronRight: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3.5 1.5 7 5 3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  /* ---------- Dates (Format.resetCaption: "EEE dd MMMM h:mma") ---------- */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => new Date(d.getTime() + n * DAY);
  const at = (d, h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x; };
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MON3 = MONTHS.map((m) => m.slice(0, 3));
  const pad = (n) => String(n).padStart(2, "0");
  const resetCaption = (d) => {
    const h = d.getHours() % 12 || 12;
    return `Resets ${WD[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${h}:${pad(d.getMinutes())}${d.getHours() < 12 ? "am" : "pm"}`;
  };
  const rangeLabel = (first, last) => first.getMonth() === last.getMonth()
    ? `${MONTHS[first.getMonth()]} ${first.getDate()} – ${last.getDate()}`
    : `${MONTHS[first.getMonth()]} ${first.getDate()} – ${MON3[last.getMonth()]} ${last.getDate()}`;
  const nextHour = (hours) => { const d = new Date(); d.setMinutes(0, 0, 0); return new Date(d.getTime() + hours * 3600000); };
  const mondayOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7));

  /* ---------- Small builders ---------- */
  const img = (src, cls = "") => `<img src="${src}" alt="" class="${cls}" draggable="false">`;
  const card = (inner) => `<div class="tm-card">${inner}</div>`;
  const section = (title) => `<div class="tm-section">${title}</div>`;
  const sectionRow = (title, trailing) =>
    `<div class="tm-section-row">${section(title)}<span class="tm-spacer"></span>${trailing ? `<span class="tm-digit">${trailing}</span>` : ""}</div>`;
  const signOut = () => `<div class="tm-signout">${ICON.signOut}</div>`;

  const header = (provider, title, meta) => `
    <div class="tm-hrow">
      <span class="tm-hlabel">${img(LOGO[provider])}<span class="tm-title">${title}</span></span>
      <span class="tm-spacer"></span>
      ${meta ? `<span class="tm-meta">${meta}</span>` : ""}
      ${ICON.gear}
    </div>`;

  const bar = (pct, color) => `<div class="tm-bar"><i style="--c:${color}" data-w="${pct}"></i></div>`;

  const track = (label, pct, color, caption, showsLabel = true) => `
    <div class="tm-track">
      ${showsLabel ? `<div class="tm-track__row"><span class="tm-digit">${label}</span><span class="tm-digit">${Math.round(pct)}% Used</span></div>` : ""}
      ${bar(pct, color)}
      ${caption ? `<div class="tm-reset">${caption}</div>` : ""}
    </div>`;

  // DailyBudget.paceCaption, with headroom = earned share so far − consumed.
  const paceCaption = (daily, elapsedDays, consumed) => {
    const headroom = daily * elapsedDays - consumed;
    if (headroom < 0) return `Usage ${(-headroom).toFixed(1)}% over today's allowance`;
    if (headroom > daily + 0.05) return `${headroom.toFixed(1)}% usage left today from unused prior days`;
    if (headroom < 0.05) return "On pace for today";
    return `${headroom.toFixed(1)}% usage left today`;
  };

  // DailyBudgetBarsView: stem height = the day's allowance, fill = usage against it.
  const budgetCard = ({ first, values, daily, accent, footer }) => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(first, i));
    const stems = days.map((d, i) => {
      const isFuture = d > today;
      const v = values[i] ?? 0;
      const fill = isFuture || v <= 0.005 ? 0 : Math.min(68, Math.max(6, 68 * (v / daily)));
      return `
        <div class="tm-stem${isFuture ? " is-future" : ""}">
          <div class="tm-stem__track">${fill ? `<i style="--c:${accent};--h:${fill}px;--i:${i * 45}ms"></i>` : ""}</div>
          <div class="tm-stem__labels"><span>${isFuture ? 0 : Math.round(v)}%</span><span>${WD[d.getDay()].slice(0, 2)}</span></div>
        </div>`;
    }).join("");
    return card(`
      <div class="tm-section-row">${section("Daily Budget")}<span class="tm-digit">${daily.toFixed(1)}%</span><span class="tm-spacer"></span><span class="tm-digit">${rangeLabel(days[0], days[6])}</span></div>
      <div class="tm-nav"><span>${ICON.left}</span><span class="is-off">${ICON.right}</span></div>
      <div class="tm-stems">${stems}</div>
      <div class="tm-caption" style="font-size:12px">${footer}</div>`);
  };

  /* ---------- Sample snapshots ---------- */
  const W = 100 / 7;
  const M = 100 / 30;

  const claudeReset = at(addDays(today, 2), 10);
  const claudeFirst = addDays(today, -4);
  const claude = { five: 18, week: 42, values: [9, 11, 6, 10, 6] };

  const grokReset = at(addDays(today, 3), 16);
  const grokFirst = addDays(today, -3);
  const grok = { used: 71, products: [["Chat", 38, P.chat], ["Build", 21, P.build], ["API", 8, P.api], ["Imagine", 4, P.imagine]], values: [17, 22, 14, 18] };

  const cursorStart = addDays(today, -18);
  const cursorReset = at(addDays(today, 12), 9);
  const weekStart = mondayOfWeek(today);
  const cursorWeek = [3.1, 4.6, 2.2, 3.8, 5.1, 1.4, 2.9];
  const cursor = { pools: [["Total", 57], ["Auto + Composer", 41], ["API (Other Models)", 16]] };

  const ocStart = addDays(today, -10);
  const ocWeek = [2.4, 1.1, 3.6, 2.8, 1.9, 0.8, 2.2];
  const opencode = { five: 12, week: 38, month: 22 };

  const grokbotReset = at(addDays(today, 5), 18);
  const grokbotFirst = addDays(today, -1);
  const grokbot = { used: 21, values: [12, 9] };

  const chatgpt = { five: 63, week: 31 };
  const openrouter = { used: 24 };

  const elapsed = (start) => Math.round((today - start) / DAY) + 1;
  const weekValuesThroughToday = (week) => week.slice(0, Math.round((today - weekStart) / DAY) + 1);

  /* ---------- Panels ---------- */
  const PANELS = {
    overview: () => {
      const ovCard = (p, name, meta, pct, color, reset) => card(`
        <div class="tm-hrow"><span class="tm-hlabel">${img(LOGO[p])}<span class="tm-title">${name}</span></span><span class="tm-meta tm-meta--upper">— ${meta}</span><span class="tm-spacer"></span><span class="tm-digit">${pct}% Used</span></div>
        ${bar(pct, color)}
        <div class="tm-reset">${resetCaption(reset)}</div>
        ${signOut()}`);
      return `
        <div class="tm-hrow">
          <span class="tm-hlabel">${img(LOGO.tokenmon, "tm-mark")}<span class="tm-title">TokenMon</span></span>
          <span class="tm-spacer"></span><span class="tm-version">v1.9.0</span>${ICON.gear}
        </div>
        ${ovCard("grok", "Grok", "Weekly", grok.used, C.grok, grokReset)}
        ${ovCard("claude", "Claude", "Weekly", claude.week, C.claude, claudeReset)}
        ${ovCard("chatgpt", "ChatGPT", "Codex", chatgpt.five, C.chatgpt, nextHour(2))}`;
    },

    grok: () => `
      ${header("grok", "SuperGrok")}
      ${card(`
        ${sectionRow("Usage Pool Weekly", `${grok.used}% Used`)}
        <div class="tm-seg">${grok.products.map(([, v, c]) => `<i style="--c:${c}" data-w="${v}"></i>`).join("")}<i class="is-rest"></i></div>
        <div class="tm-reset">${resetCaption(grokReset)}</div>`)}
      ${card(`
        ${section("Categories")}
        <div class="tm-cats">${grok.products.map(([n, v, c]) => `<span class="tm-cat tm-body"><i style="--c:${c}"></i><b>${n}</b><span class="tm-digit">${v}%</span></span>`).join("")}</div>`)}
      ${budgetCard({ first: grokFirst, values: grok.values, daily: W, accent: C.grok, footer: paceCaption(W, 4, grok.used) })}
      ${signOut()}`,

    cursor: () => `
      ${header("cursor", "Cursor", "Cursor Pro")}
      ${card(`${section("Usage Pool Monthly")}${cursor.pools.map(([l, v]) => track(l, v, C.cursor, resetCaption(cursorReset))).join("")}`)}
      ${budgetCard({ first: weekStart, values: weekValuesThroughToday(cursorWeek), daily: M, accent: C.cursor, footer: paceCaption(M, elapsed(cursorStart), 57) })}
      ${signOut()}`,

    opencode: () => `
      ${header("opencode", "OpenCode Go")}
      ${card(`${section("Usage Pool Mixed")}
        ${track("5-Hour", opencode.five, C.opencode, resetCaption(nextHour(3)))}
        ${track("Weekly", opencode.week, C.opencode, resetCaption(at(addDays(today, 4), 0)))}
        ${track("Monthly", opencode.month, C.opencode, resetCaption(at(addDays(today, 20), 0)))}`)}
      ${budgetCard({ first: weekStart, values: weekValuesThroughToday(ocWeek), daily: M, accent: C.opencode, footer: paceCaption(M, elapsed(ocStart), opencode.month) })}
`,

    claude: () => `
      ${header("claude", "Claude")}
      ${card(`${section("Usage Pool Mixed")}
        ${track("5-Hour Window", claude.five, C.claude, resetCaption(nextHour(2)))}
        ${track("Weekly", claude.week, C.claude, resetCaption(claudeReset))}`)}
      ${budgetCard({ first: claudeFirst, values: claude.values, daily: W, accent: C.claude, footer: paceCaption(W, 5, claude.week) })}
      ${card(`<div class="tm-collapse">${section("Models This Month")}${ICON.chevronRight}</div>`)}
      ${signOut()}`,

    chatgpt: () => `
      ${header("chatgpt", "ChatGPT", "Plus")}
      ${card(`${section("Usage Pool Mixed")}
        ${track("5-Hour Window", chatgpt.five, C.chatgpt, resetCaption(nextHour(2)))}
        ${track("Weekly", chatgpt.week, C.chatgpt, resetCaption(at(addDays(today, 4), 8)))}`)}
      ${signOut()}`,

    openrouter: () => `
      ${header("openrouter", "OpenRouter", "Account credits")}
      ${card(`${sectionRow("Credit Budget", `${openrouter.used}% Used`)}
        ${track("Credits used", openrouter.used, C.openrouter, "$18.00 of $75.00 · $57.00 left", false)}`)}
      ${signOut()}`,

    grokbot: () => `
      ${header("grokbot", "Grokbot")}
      ${card(`${sectionRow("Usage Pool Weekly", `${grokbot.used}% Used`)}
        <div class="tm-caption">via Cursor</div>
        ${track("Weekly", grokbot.used, C.grokbot, resetCaption(grokbotReset), false)}`)}
      ${budgetCard({ first: grokbotFirst, values: grokbot.values, daily: W, accent: C.grokbot, footer: paceCaption(W, 2, grokbot.used) })}
      ${signOut()}`,
  };

  /* ---------- Switcher (4 per row, padded with empty cells) ---------- */
  const TABS = [
    ["overview", "All"], ["grok", "Grok"], ["cursor", "Cursor"], ["opencode", "OpenCode"],
    ["claude", "Claude"], ["chatgpt", "ChatGPT"], ["openrouter", "OpenRouter"], ["grokbot", "Grokbot"],
  ];
  const tabsEl = $("#tmTabs");
  const content = $("#tmContent");
  const desk = $("#desk");
  const panel = $("#tmPanel");
  const stage = desk.closest(".stage");
  const ACCENT = { overview: "var(--claude)", grok: "var(--grok)", cursor: "var(--cursor)", opencode: "var(--opencode)", claude: "var(--claude)", chatgpt: "var(--chatgpt)", openrouter: "var(--openrouter)", grokbot: "var(--grokbot)" };

  const rows = [];
  for (let i = 0; i < TABS.length; i += 4) rows.push(TABS.slice(i, i + 4));
  tabsEl.innerHTML = rows.map((row) => `<div class="tm-switcher__row">${row.map(([id, label]) => `
    <button class="tm-tab" type="button" role="tab" aria-selected="false" data-id="${id}">
      ${id === "overview" ? "" : img(LOGO[id])}<span>${label}</span>
    </button>`).join("")}</div>`).join("");
  const tabEls = Array.from(tabsEl.querySelectorAll(".tm-tab"));

  /* ---------- Status item: Cursor and Claude graphs ---------- */
  const statusEl = $("#statusItem");
  const STATUS = [["cursor", 57, C.cursor], ["claude", claude.five, C.claude]];
  statusEl.innerHTML = STATUS.map(([id, pct, c]) => `
    <button class="status__seg" type="button" data-id="${id}" aria-label="${id === "claude" ? "Claude" : "Cursor"} ${pct}% used">
      ${img(LOGO[id])}<span class="status__pct">${pct}%</span><span class="status__bar"><i style="--c:${c}" data-w="${pct}"></i></span>
    </button>`).join("");
  statusEl.classList.add("is-open");

  const fillBars = (root) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.querySelectorAll("[data-w]").forEach((el) => { el.style.width = `${el.dataset.w}%`; });
      root.querySelectorAll(".tm-seg i[data-w]").forEach((el) => {
        el.style.width = `calc((100% - ${(el.parentElement.children.length - 1) * 2}px) * ${el.dataset.w / 100})`;
      });
      root.querySelectorAll(".tm-stems").forEach((el) => el.classList.add("is-grown"));
    }));
  };

  let current = null;
  const select = (id) => {
    if (id === current) return;
    current = id;
    tabEls.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.id === id)));
    content.innerHTML = PANELS[id]();
    content.classList.remove("is-entering");
    void content.offsetWidth;
    content.classList.add("is-entering");
    stage.style.setProperty("--accent", ACCENT[id]);
    fillBars(content);
  };

  /* ---------- Fit the 420pt panel into narrow screens ---------- */
  const fit = () => {
    const avail = desk.clientWidth - 22;
    panel.style.setProperty("--panel-scale", String(Math.min(1, avail / 420)));
  };
  fit();
  window.addEventListener("resize", fit);

  /* ---------- Demo cursor walks through the tabs ---------- */
  const cursorEl = $("#fakeCursor");
  const tour = ["claude", "grok", "cursor", "overview", "chatgpt", "opencode", "grokbot", "openrouter"];
  let step = 0;
  let timer = 0;
  let inView = true;
  let userActive = false;

  const pointAt = (el) => {
    const d = desk.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    desk.style.setProperty("--cx", `${r.left - d.left + r.width * 0.55}px`);
    desk.style.setProperty("--cy", `${r.top - d.top + r.height * 0.45}px`);
    cursorEl.style.setProperty("--cx", `${r.left - d.left + r.width * 0.55}px`);
    cursorEl.style.setProperty("--cy", `${r.top - d.top + r.height * 0.45}px`);
  };

  const advance = () => {
    clearTimeout(timer);
    if (!inView || userActive || document.hidden || reduceMotion) return;
    const id = tour[step % tour.length];
    step++;
    const tab = tabEls.find((t) => t.dataset.id === id);
    pointAt(tab);
    timer = setTimeout(() => {
      cursorEl.classList.add("is-click");
      tab.classList.add("is-pressed");
      setTimeout(() => {
        cursorEl.classList.remove("is-click");
        tab.classList.remove("is-pressed");
        select(id);
        timer = setTimeout(advance, 3600);
      }, 140);
    }, 950);
  };

  tabEls.forEach((t) => t.addEventListener("click", () => select(t.dataset.id)));
  statusEl.querySelectorAll(".status__seg").forEach((b) => b.addEventListener("click", () => select(b.dataset.id)));

  desk.addEventListener("pointerenter", () => { userActive = true; desk.classList.add("is-user"); clearTimeout(timer); });
  desk.addEventListener("pointerleave", () => { userActive = false; desk.classList.remove("is-user"); timer = setTimeout(advance, 1200); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) advance(); });
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) timer = setTimeout(advance, 600); else clearTimeout(timer);
  }).observe(desk);

  // Settle the cursor near the panel before the first move.
  requestAnimationFrame(() => {
    const d = desk.getBoundingClientRect();
    cursorEl.style.setProperty("--cx", `${d.width * 0.45}px`);
    cursorEl.style.setProperty("--cy", `${d.height * 0.8}px`);
  });

  select("claude");
  fillBars(statusEl);
  step = 1;
})();
