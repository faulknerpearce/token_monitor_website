(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Provider cards: pool name and windows as each provider's panel shows them (sample values).
  const PROVIDER_CARDS = [
    { name: "ChatGPT", logo: "chatgpt.svg", color: "var(--chatgpt)", pool: "Mixed",
      text: "Codex 5-hour and weekly windows.",
      windows: [["5-Hour Window", 63], ["Weekly", 31]] },
    { name: "Claude", logo: "claude.svg", color: "var(--claude)", pool: "Mixed",
      text: "5-hour and weekly windows, plus Claude Code spend.",
      windows: [["5-Hour Window", 18], ["Weekly", 42]] },
    { name: "Cursor", logo: "cursor.svg", color: "var(--cursor)", pool: "Monthly",
      text: "Your monthly billing cycle, by pool.",
      windows: [["Total", 57], ["Auto + Composer", 41]] },
    { name: "Grokbot", logo: "grokbot.svg", color: "var(--grokbot)", pool: "Weekly",
      text: "The weekly Bot allowance.",
      windows: [["Weekly", 21]] },
    { name: "OpenCode Go", logo: "opencode.svg", color: "var(--opencode)", pool: "Mixed",
      text: "5-hour, weekly and monthly limits.",
      windows: [["5-Hour", 12], ["Weekly", 38], ["Monthly", 22]] },
    { name: "OpenRouter", logo: "openrouter.svg", color: "var(--openrouter)", pool: "Credits",
      text: "Account credits or a per-key cap.",
      windows: [["$18.00 of $75.00", 24]] },
    { name: "SuperGrok", logo: "grok.png", color: "var(--grok)", pool: "Weekly",
      text: "One weekly pool, split by product.",
      segments: [["Chat", 38, "#1c61d1"], ["Build", 21, "#8cc7ff"], ["API", 8, "#38527a"], ["Imagine", 4, "#bfe6ff"]] },
  ];

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Marquee ---------- */
  const marqueeRow = $("#marqueeRow");
  const chipList = [
    ["ChatGPT", "chatgpt.svg", "--chatgpt"], ["Claude", "claude.svg", "--claude"], ["Cursor", "cursor.svg", "--cursor"],
    ["Grokbot", "grokbot.svg", "--grokbot"], ["OpenCode", "opencode.svg", "--opencode"],
    ["OpenRouter", "openrouter.svg", "--openrouter"], ["SuperGrok", "grok.png", "--grok"],
  ];
  const chips = chipList
    .map(([n, logo, c]) => `<span class="chip" style="--c:var(${c})"><img src="assets/logos/${logo}" alt="" draggable="false">${n}</span>`)
    .join("");
  marqueeRow.innerHTML = chips + chips.replace(/class="chip"/g, 'class="chip" aria-hidden="true"');

  /* ---------- Provider grid ---------- */
  const meter = (label, pct) => `
    <div class="prov__win">
      <div class="prov__win-row"><span>${label}</span><b>${pct}%</b></div>
      <div class="prov__bar"><i style="--w:${pct}%"></i></div>
    </div>`;
  const segments = (segs) => {
    const used = segs.reduce((a, [, v]) => a + v, 0);
    return `
      <div class="prov__win">
        <div class="prov__win-row"><span>Weekly pool</span><b>${used}%</b></div>
        <div class="prov__segs">${segs.map(([, v, c]) => `<i style="--w:${v}%;--sc:${c}"></i>`).join("")}</div>
      </div>`;
  };
  const allCard = () => `
    <article class="prov prov--all" data-reveal style="--c:var(--ink-2);--d:210ms">
      <div class="prov__head">
        <span class="prov__logo prov__logo--mark"><svg viewBox="0 0 200 200" aria-hidden="true"><use href="#mascot"/></svg></span>
        <span class="prov__id"><b>All</b><small>Overview tab</small></span>
      </div>
      <p>Every connected provider on one tab.</p>
      <div class="prov__logos">${PROVIDER_CARDS.map((p) => `<span title="${p.name}"><img src="assets/logos/${p.logo}" alt="" draggable="false"></span>`).join("")}</div>
    </article>`;

  $("#providerGrid").innerHTML = PROVIDER_CARDS.map((p, i) => `
    <article class="prov" data-reveal style="--c:${p.color};--d:${(i % 4) * 70}ms">
      <div class="prov__head">
        <span class="prov__logo"><img src="assets/logos/${p.logo}" alt="" draggable="false"></span>
        <span class="prov__id"><b>${p.name}</b><small>${p.pool}</small></span>
      </div>
      <p>${p.text}</p>
      <div class="prov__wins">${p.segments ? segments(p.segments) : p.windows.map(([l, v]) => meter(l, v)).join("")}</div>
    </article>`).join("") + allCard();

  /* ---------- Overview hourly chart (6am to 10pm, stacked like the app) ---------- */
  const SERIES = [["Grok", "var(--grok)"], ["Grokbot", "var(--grokbot)"], ["Cursor", "var(--cursor)"], ["Claude", "var(--claude)"], ["Go", "var(--opencode)"]];
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const hourRows = [];
  for (let h = 6; h <= 22; h++) {
    const busy = Math.exp(-Math.pow((h - 14) / 3.8, 2));
    hourRows.push(SERIES.map((_, k) => (busy > 0.07 ? busy * (0.45 + rand()) * (1 - k * 0.14) : 0)));
  }
  const maxHour = Math.max(...hourRows.map((r) => r.reduce((a, b) => a + b, 0)));
  const AXIS = { 6: "6", 9: "9", 12: "12", 15: "3", 18: "6", 22: "10" };
  $("#hourly").innerHTML = hourRows.map((acts, k) => {
    const total = acts.reduce((a, b) => a + b, 0);
    const fill = total ? Math.max(4, (total / maxHour) * 100) : 0;
    const segs = acts.map((a, j) => (a ? `<b style="--c:${SERIES[j][1]};flex:${a.toFixed(3)}"></b>` : "")).join("");
    return `<div class="viz-hours__col">
      <div class="viz-hours__stem">${fill ? `<div class="viz-hours__fill" style="height:${fill.toFixed(1)}%;--i:${k * 35}ms">${segs}</div>` : "<span></span>"}</div>
      <small>${AXIS[k + 6] ?? ""}</small>
    </div>`;
  }).join("");
  $("#hourlyLegend").innerHTML = SERIES.map(([n, c]) => `<span><i style="--c:${c}"></i>${n}</span>`).join("");

  /* ---------- Daily Budget visual (weekly pool, 14.3% a day) ---------- */
  const BUDGET_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const BUDGET = [12, 18, 6, 15, 9];
  const daily = 100 / 7;
  $("#budgetViz").innerHTML = `
    <div class="viz-budget__head"><span>Daily budget</span><b>${daily.toFixed(1)}%</b></div>
    <div class="viz-budget__stems">${BUDGET_DAYS.map((d, i) => {
      const v = BUDGET[i];
      const h = v === undefined ? 0 : Math.min(100, Math.max(9, (v / daily) * 100));
      return `<div class="viz-budget__day${v === undefined ? " is-future" : ""}">
        <div class="viz-budget__track">${h ? `<i style="--h:${h}%;--i:${i * 60}ms"></i>` : ""}</div>
        <b>${v ?? 0}%</b><small>${d}</small>
      </div>`;
    }).join("")}</div>
    <div class="viz-budget__foot">${(daily * 5 - BUDGET.reduce((a, b) => a + b, 0)).toFixed(1)}% usage left today</div>`;

  /* ---------- Reveal on scroll ---------- */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals); return; }
    const start = performance.now();
    const dur = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 4);
      el.textContent = prefix + (target * eased).toFixed(decimals);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      target.classList.add("is-in");
      // Drop the stagger once revealed so hover responds immediately.
      const delay = parseFloat(getComputedStyle(target).getPropertyValue("--d")) || 0;
      setTimeout(() => target.style.setProperty("--d", "0ms"), delay + 950);
      $$("[data-count]", entry.target).forEach(countUp);
      revealer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$("[data-reveal]").forEach((el) => revealer.observe(el));

  /* ---------- Card spotlight ---------- */
  $$("[data-spot]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Mascot eyes follow the pointer ---------- */
  const bigMascot = $("#bigMascot");
  const eyes = $$("#eyes .eye");
  let eyeFrame = 0;
  window.addEventListener("pointermove", (e) => {
    if (reduceMotion || eyeFrame) return;
    eyeFrame = requestAnimationFrame(() => {
      eyeFrame = 0;
      const r = bigMascot.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.5);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 400);
      const x = (dx / dist) * 9 * reach;
      const y = (dy / dist) * 5 * reach;
      eyes.forEach((eye) => { eye.style.transform = `translate(${x}px, ${y}px)`; });
    });
  }, { passive: true });

  /* ---------- Copy button ---------- */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
        btn.classList.add("is-done");
      } catch {
        btn.textContent = "Select & copy";
      }
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("is-done"); }, 1800);
    });
  });

})();
