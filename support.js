(() => {
  "use strict";

  // Stripe Payment Link ("Buy me a coffee") set to "Customers choose what to pay" (USD).
  // Its after-payment redirect should point to support.html?thanks=1.
  const TIP_LINK = "https://buy.stripe.com/3cI14n4jX4zA6716jU9k400";

  const PRESETS = [5, 10, 15, 25, 50];
  const DEFAULT_PRESET = 10;
  const MIN_AMOUNT = 1;
  const MAX_AMOUNT = 10000;

  const $ = (sel) => document.querySelector(sel);

  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const params = new URLSearchParams(window.location.search);
  if (params.has("thanks")) {
    $("#tipAsk").hidden = true;
    $("#tipThanks").hidden = false;
    return;
  }

  // Arriving from a Download button: offer a coffee, with the download one click away.
  if (params.has("download")) {
    $("main").classList.add("tip--download");
    $("#tipHeadSupport").hidden = true;
    $("#tipHeadDownload").hidden = false;
    $("#tipSkip").hidden = false;
  }

  const presets = $("#tipPresets");
  const custom = $("#tipCustom");
  const customInput = $("#tipCustomInput");
  const go = $("#tipGo");
  const error = $("#tipError");

  const option = (value, label, checked) => `
    <label class="tip__option">
      <input type="radio" name="amount" value="${value}"${checked ? " checked" : ""}>
      <span>${label}</span>
    </label>`;
  presets.innerHTML =
    PRESETS.map((n) => option(n, `$${n}`, n === DEFAULT_PRESET)).join("") + option("custom", "Other", false);

  const selected = () => presets.querySelector("input:checked").value;

  // Amount in dollars, or null when the entry is not valid.
  const amount = () => {
    const raw = selected() === "custom" ? customInput.value.trim() : selected();
    const value = Number(raw);
    if (raw === "" || !Number.isFinite(value) || value < MIN_AMOUNT || value > MAX_AMOUNT) return null;
    return Math.round(value * 100) / 100;
  };

  const format = (value) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`;

  const render = () => {
    const isCustom = selected() === "custom";
    custom.hidden = !isCustom;
    const value = amount();
    go.textContent = value === null ? "Buy me a coffee" : `Buy me a coffee (${format(value)})`;
    error.hidden = true;
  };

  presets.addEventListener("change", () => {
    render();
    if (selected() === "custom") customInput.focus();
  });
  customInput.addEventListener("input", render);

  $("#tipForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = amount();
    if (value === null) {
      error.textContent = `Enter an amount between ${format(MIN_AMOUNT)} and ${format(MAX_AMOUNT)}.`;
      error.hidden = false;
      return;
    }
    if (!TIP_LINK) {
      error.textContent = "Payments aren't switched on yet. Please check back soon.";
      error.hidden = false;
      return;
    }
    const url = new URL(TIP_LINK);
    url.searchParams.set("prefilled_amount", String(Math.round(value * 100)));
    window.location.assign(url.toString());
  });

  render();
})();
