(() => {
  const FALLBACK_MESSAGES = {
    extensionName: "Midnight Drambler",
    defaultBlockMessage: "It is after midnight. In the morning you can decide whether you really want to send this.",
    closeButton: "Close",
    emergencyUnlockButton: "Emergency unlock",
    emergencyUnlockTitle: "Emergency unlock",
    emergencyUnlockIntro: "If this is truly urgent, type the exact sentence below.",
    emergencyUnlockPhrase: "I WILL STILL WANT TO SEND THIS TOMORROW",
    emergencyUnlockInputLabel: "Unlock confirmation",
    backButton: "Back",
    emergencyUnlockSubmitButton: "Unlock for 5 min",
    emergencyUnlockMismatchError: "The sentence must be typed exactly the same way. Check capitalization, spaces, and punctuation.",
    countdownText: "Midnight Drambler disabled. Remaining: $1 min."
  };

  const DEFAULT_LOCALE = "en";
  const POLISH_LOCALE = "pl";
  const KNOWN_DEFAULT_MESSAGES = [
    "Jest po północy. Rano zdecydujesz, czy naprawdę chcesz to wysłać.",
    "It is after midnight. In the morning you can decide whether you really want to send this."
  ];

  let localeMessages = {};
  let currentLocale = "";

  function i18n(key, substitutions) {
    const entry = localeMessages[key];
    const nativeMessage = browser.i18n.getMessage(key, substitutions);
    const template = entry && entry.message
      ? entry.message
      : nativeMessage || FALLBACK_MESSAGES[key] || key;
    const values = Array.isArray(substitutions) ? substitutions : [substitutions];

    let text = template.replace(/\$(\d+)/g, (_, index) => values[Number(index) - 1] || "");

    if (entry && entry.placeholders) {
      for (const [name, placeholder] of Object.entries(entry.placeholders)) {
        const match = /^\$(\d+)$/.exec(placeholder.content);
        const value = match ? values[Number(match[1]) - 1] || "" : placeholder.content;
        text = text.replace(new RegExp(`\\$${name}\\$`, "gi"), value);
      }
    }

    return text;
  }

  function getPreferredLocale() {
    const language = (
      navigator.language ||
      (navigator.languages && navigator.languages[0]) ||
      browser.i18n.getUILanguage() ||
      ""
    ).toLowerCase();

    return language === POLISH_LOCALE || language.startsWith(`${POLISH_LOCALE}-`)
      ? POLISH_LOCALE
      : DEFAULT_LOCALE;
  }

  async function refreshLocale() {
    const nextLocale = getPreferredLocale();
    if (nextLocale === currentLocale && Object.keys(localeMessages).length) {
      return false;
    }

    const response = await fetch(browser.runtime.getURL(`_locales/${nextLocale}/messages.json`));
    if (!response.ok) {
      throw new Error(`Could not load locale: ${nextLocale}`);
    }

    localeMessages = await response.json();
    currentLocale = nextLocale;
    return true;
  }

  const UNLOCK_DURATION_MS = 5 * 60 * 1000;
  const LOCALE_CHECK_INTERVAL_MS = 1000;
  const CHECK_INTERVAL_MS = 30 * 1000;
  const DOM_SCAN_DELAY_MS = 80;

  function defaultSettings() {
    return {
      enabled: true,
      startTime: "00:00",
      endTime: "07:00",
      message: i18n("defaultBlockMessage"),
      unlockUntil: 0
    };
  }

  const WRITING_SELECTOR = [
    "textarea",
    "[contenteditable='true']",
    "[contenteditable='plaintext-only']",
    "[role='textbox']",
    "input[type='text']",
    "input:not([type])"
  ].join(",");

  const SEARCH_WORDS = [
    "search",
    "szukaj",
    "find",
    "filter",
    "filtr",
    "rechercher",
    "buscar",
    "suche",
    "cerca"
  ];

  const WRITING_WORDS = [
    "message",
    "wiadomosc",
    "comment",
    "komentarz",
    "reply",
    "odpowiedz",
    "post",
    "opublikuj",
    "write",
    "napisz"
  ];

  const SUBMIT_ACTION_PATTERN = /\b(send|wyslij|opublikuj|publikuj|post|comment|skomentuj|reply|odpowiedz|submit|publish)\b/i;
  const COMPOSER_TRIGGER_PATTERN = /(what'?s on your mind|o czym myslisz|co slychac|utworz post|create post|napisz cos|write something|start a post)/i;

  let settings = { ...defaultSettings() };
  let overlayEl = null;
  let overlayMode = null;
  let countdownEl = null;
  let countdownTimer = 0;
  let scanTimer = 0;
  const pendingScanRoots = new Set();

  function removeExistingUi() {
    document
      .querySelectorAll("#midnight-drambler-overlay, #midnight-drambler-countdown")
      .forEach((element) => element.remove());
  }

  function isTime(value) {
    return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function normalizeSettings(values) {
    const defaults = defaultSettings();
    const message = typeof values.message === "string" ? values.message.trim() : "";

    return {
      enabled: Boolean(values.enabled),
      startTime: isTime(values.startTime) ? values.startTime : defaults.startTime,
      endTime: isTime(values.endTime) ? values.endTime : defaults.endTime,
      message: message && !KNOWN_DEFAULT_MESSAGES.includes(message)
        ? message
        : defaults.message,
      unlockUntil: Number.isFinite(Number(values.unlockUntil)) ? Number(values.unlockUntil) : 0
    };
  }

  function minutesFromTime(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function isInsideBlockingWindow(date = new Date()) {
    const start = minutesFromTime(settings.startTime);
    const end = minutesFromTime(settings.endTime);
    const now = date.getHours() * 60 + date.getMinutes();

    if (start === end) {
      return true;
    }

    if (start < end) {
      return now >= start && now < end;
    }

    return now >= start || now < end;
  }

  function isTemporarilyUnlocked(now = Date.now()) {
    return settings.unlockUntil > now;
  }

  function shouldBlock() {
    return settings.enabled && isInsideBlockingWindow() && !isTemporarilyUnlocked();
  }

  function shouldShowCountdown() {
    return settings.enabled && isInsideBlockingWindow() && isTemporarilyUnlocked();
  }

  function getElement(target) {
    if (!target) {
      return null;
    }

    if (target.nodeType === Node.ELEMENT_NODE) {
      return target;
    }

    return target.parentElement || null;
  }

  function isInsideOwnUi(element) {
    return Boolean(element && element.closest("#midnight-drambler-overlay, #midnight-drambler-countdown"));
  }

  function isEditableElement(element) {
    return element && element.matches && element.matches(WRITING_SELECTOR);
  }

  function isDisabledOrReadonly(element) {
    if (!element) {
      return true;
    }

    if (element.closest("[aria-disabled='true'], [disabled]")) {
      return true;
    }

    return Boolean(element.readOnly || element.disabled);
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function collectLabels(element) {
    const labels = [
      element.getAttribute("aria-label"),
      element.getAttribute("placeholder"),
      element.getAttribute("name"),
      element.getAttribute("id"),
      element.getAttribute("title"),
      element.getAttribute("data-testid")
    ];

    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      for (const id of labelledBy.split(/\s+/)) {
        const labelEl = document.getElementById(id);
        if (labelEl) {
          labels.push(labelEl.textContent);
        }
      }
    }

    return normalizeText(labels.filter(Boolean).join(" "));
  }

  function isSearchField(element) {
    const labels = collectLabels(element);

    if (element.matches("input[type='search'], [role='searchbox']")) {
      return true;
    }

    if (element.closest("form[role='search'], [role='search']")) {
      return true;
    }

    return SEARCH_WORDS.some((word) => labels.includes(word));
  }

  function isInNavigationContext(element) {
    return Boolean(element.closest("nav, header, [role='navigation'], [role='banner']"));
  }

  function isLikelyWritingInput(element) {
    if (!element.matches("input[type='text'], input:not([type])")) {
      return true;
    }

    const labels = collectLabels(element);

    if (WRITING_WORDS.some((word) => labels.includes(word))) {
      return true;
    }

    return !isInNavigationContext(element);
  }

  function findWritingTarget(target) {
    const element = getElement(target);
    if (!element || isInsideOwnUi(element)) {
      return null;
    }

    const editable = isEditableElement(element)
      ? element
      : element.closest(WRITING_SELECTOR);

    if (
      !editable ||
      isInsideOwnUi(editable) ||
      isDisabledOrReadonly(editable) ||
      isSearchField(editable) ||
      !isLikelyWritingInput(editable)
    ) {
      return null;
    }

    return editable;
  }

  function labelForAction(element) {
    const text = [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("value"),
      element.textContent
    ].filter(Boolean).join(" ");

    return normalizeText(text);
  }

  function hasNearbyWritingArea(element) {
    let current = element;

    for (let depth = 0; current && depth < 7; depth += 1) {
      if (current.querySelectorAll) {
        const editors = Array.from(current.querySelectorAll(WRITING_SELECTOR));
        if (editors.some((editor) => (
          !isDisabledOrReadonly(editor) &&
          !isSearchField(editor) &&
          isLikelyWritingInput(editor)
        ))) {
          return true;
        }
      }

      current = current.parentElement;
    }

    return false;
  }

  function findBlockedAction(target) {
    const element = getElement(target);
    if (!element || isInsideOwnUi(element)) {
      return null;
    }

    const action = element.closest("button, [role='button'], input[type='submit'], input[type='button']");
    if (!action || isInsideOwnUi(action)) {
      return null;
    }

    const label = labelForAction(action);
    const looksLikeSubmit = SUBMIT_ACTION_PATTERN.test(label) && hasNearbyWritingArea(action);
    const looksLikeComposerTrigger = COMPOSER_TRIGGER_PATTERN.test(label);

    return looksLikeSubmit || looksLikeComposerTrigger ? action : null;
  }

  function blockEvent(event, target) {
    if (event.cancelable) {
      event.preventDefault();
    }

    event.stopImmediatePropagation();

    if (target && typeof target.blur === "function") {
      target.blur();
    }

    showOverlay("blocked");
  }

  function handleFocus(event) {
    if (!shouldBlock()) {
      return;
    }

    const target = findWritingTarget(event.target);
    if (target) {
      blockEvent(event, target);
    }
  }

  function handleInputAttempt(event) {
    if (!shouldBlock()) {
      return;
    }

    const target = findWritingTarget(event.target);
    if (target) {
      blockEvent(event, target);
    }
  }

  function handleKeydown(event) {
    if (!shouldBlock()) {
      return;
    }

    const target = findWritingTarget(event.target);
    if (target) {
      blockEvent(event, target);
    }
  }

  function handleClick(event) {
    if (!shouldBlock()) {
      return;
    }

    const writingTarget = findWritingTarget(event.target);
    if (writingTarget) {
      blockEvent(event, writingTarget);
      return;
    }

    const blockedAction = findBlockedAction(event.target);
    if (blockedAction) {
      blockEvent(event, blockedAction);
    }
  }

  function closeOverlay() {
    document.querySelectorAll("#midnight-drambler-overlay").forEach((element) => element.remove());
    overlayEl = null;
    overlayMode = null;
  }

  async function showOverlay(mode) {
    await refreshLocale().catch(() => false);
    settings = normalizeSettings(settings);

    if (!shouldBlock() && mode !== "confirm") {
      return;
    }

    closeOverlay();
    overlayMode = mode;

    overlayEl = document.createElement("div");
    overlayEl.id = "midnight-drambler-overlay";
    overlayEl.setAttribute("role", "dialog");
    overlayEl.setAttribute("aria-modal", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "midnight-drambler-backdrop";

    const dialog = document.createElement("section");
    dialog.className = "midnight-drambler-dialog";

    overlayEl.append(backdrop, dialog);
    document.documentElement.append(overlayEl);

    if (mode === "confirm") {
      renderConfirmDialog(dialog);
    } else {
      renderBlockedDialog(dialog);
    }
  }

  function renderBlockedDialog(dialog) {
    const title = document.createElement("h2");
    title.textContent = i18n("extensionName");

    const message = document.createElement("p");
    message.textContent = settings.message;

    const actions = document.createElement("div");
    actions.className = "midnight-drambler-actions";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "midnight-drambler-button midnight-drambler-button--secondary";
    closeButton.textContent = i18n("closeButton");
    closeButton.addEventListener("click", closeOverlay);

    const unlockButton = document.createElement("button");
    unlockButton.type = "button";
    unlockButton.className = "midnight-drambler-button midnight-drambler-button--primary";
    unlockButton.textContent = i18n("emergencyUnlockButton");
    unlockButton.addEventListener("click", () => showOverlay("confirm"));

    actions.append(closeButton, unlockButton);
    dialog.append(title, message, actions);
    closeButton.focus();
  }

  function renderConfirmDialog(dialog) {
    const title = document.createElement("h2");
    title.textContent = i18n("emergencyUnlockTitle");

    const intro = document.createElement("p");
    intro.textContent = i18n("emergencyUnlockIntro");

    const phrase = document.createElement("strong");
    phrase.className = "midnight-drambler-phrase";
    phrase.textContent = i18n("emergencyUnlockPhrase");

    const form = document.createElement("form");
    form.className = "midnight-drambler-confirmation";

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", i18n("emergencyUnlockInputLabel"));

    const error = document.createElement("p");
    error.className = "midnight-drambler-error";
    error.setAttribute("role", "alert");

    const actions = document.createElement("div");
    actions.className = "midnight-drambler-actions";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "midnight-drambler-button midnight-drambler-button--secondary";
    backButton.textContent = i18n("backButton");
    backButton.addEventListener("click", () => showOverlay("blocked"));

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "midnight-drambler-button midnight-drambler-button--primary";
    submitButton.textContent = i18n("emergencyUnlockSubmitButton");

    actions.append(backButton, submitButton);
    form.append(input, error, actions);
    dialog.append(title, intro, phrase, form);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (input.value !== i18n("emergencyUnlockPhrase")) {
        error.textContent = i18n("emergencyUnlockMismatchError");
        return;
      }

      await unlockTemporarily();
    });

    input.focus();
  }

  async function unlockTemporarily() {
    const unlockUntil = Date.now() + UNLOCK_DURATION_MS;
    settings = { ...settings, unlockUntil };
    await browser.storage.local.set({ unlockUntil });
    closeOverlay();
    updateCountdown();
  }

  function remainingMinutes() {
    return Math.max(1, Math.ceil((settings.unlockUntil - Date.now()) / 60000));
  }

  function updateCountdownText() {
    if (!countdownEl) {
      return;
    }

    countdownEl.textContent = i18n("countdownText", [String(remainingMinutes())]);
  }

  function hideCountdown() {
    if (countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = 0;
    }

    document.querySelectorAll("#midnight-drambler-countdown").forEach((element) => element.remove());
    countdownEl = null;
  }

  function updateCountdown() {
    if (!shouldShowCountdown()) {
      hideCountdown();
      return;
    }

    if (!countdownEl || !countdownEl.isConnected) {
      countdownEl = document.getElementById("midnight-drambler-countdown") || document.createElement("div");
      countdownEl.id = "midnight-drambler-countdown";
      countdownEl.setAttribute("role", "status");
      if (!countdownEl.isConnected) {
        document.documentElement.append(countdownEl);
      }
    }

    updateCountdownText();

    if (!countdownTimer) {
      countdownTimer = window.setInterval(() => {
        if (!shouldShowCountdown()) {
          hideCountdown();
          enforceActiveEditor();
          return;
        }

        updateCountdownText();
      }, 1000);
    }
  }

  function enforceActiveEditor() {
    if (!shouldBlock()) {
      return;
    }

    const activeTarget = findWritingTarget(document.activeElement);
    if (activeTarget) {
      activeTarget.blur();
      showOverlay("blocked");
    }
  }

  function scanForEditors(root = document) {
    if (!root.querySelectorAll) {
      return;
    }

    const editors = [];

    if (isEditableElement(root)) {
      editors.push(root);
    }

    editors.push(...root.querySelectorAll(WRITING_SELECTOR));

    for (const editor of editors) {
      if (!isDisabledOrReadonly(editor) && !isSearchField(editor) && isLikelyWritingInput(editor)) {
        editor.dataset.midnightDramblerGuarded = "true";
      }
    }

    enforceActiveEditor();
  }

  function scheduleEditorScan(root) {
    const element = getElement(root);
    if (!element) {
      return;
    }

    pendingScanRoots.add(element);

    if (scanTimer) {
      return;
    }

    scanTimer = window.setTimeout(() => {
      scanTimer = 0;

      if (!shouldBlock()) {
        pendingScanRoots.clear();
        return;
      }

      for (const scanRoot of pendingScanRoots) {
        scanForEditors(scanRoot);
      }

      pendingScanRoots.clear();
    }, DOM_SCAN_DELAY_MS);
  }

  async function loadSettings() {
    const values = await browser.storage.local.get(defaultSettings());
    settings = normalizeSettings(values);
    updateCountdown();
    enforceActiveEditor();
  }

  function watchStorage() {
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") {
        return;
      }

      const next = { ...settings };

      for (const [key, change] of Object.entries(changes)) {
        next[key] = change.newValue;
      }

      settings = normalizeSettings(next);
      updateCountdown();
      enforceActiveEditor();
    });
  }

  function watchDom() {
    const observer = new MutationObserver((mutations) => {
      if (!shouldBlock()) {
        return;
      }

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          const element = getElement(node);
          scheduleEditorScan(node);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function installEventGuards() {
    document.addEventListener("focusin", handleFocus, true);
    document.addEventListener("pointerdown", handleClick, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("beforeinput", handleInputAttempt, true);
    document.addEventListener("paste", handleInputAttempt, true);
    document.addEventListener("drop", handleInputAttempt, true);
    document.addEventListener("compositionstart", handleInputAttempt, true);
    document.addEventListener("keydown", handleKeydown, true);
  }

  function startScheduleLoop() {
    window.setInterval(() => {
      updateCountdown();
      enforceActiveEditor();
    }, CHECK_INTERVAL_MS);
  }

  function startLocaleLoop() {
    window.setInterval(() => {
      refreshLocale().then((changed) => {
        if (!changed) {
          return;
        }

        settings = normalizeSettings(settings);
        updateCountdown();

        if (overlayEl && overlayMode) {
          showOverlay(overlayMode);
        }
      }).catch(() => {});
    }, LOCALE_CHECK_INTERVAL_MS);
  }

  removeExistingUi();
  installEventGuards();
  watchStorage();
  watchDom();
  startScheduleLoop();
  startLocaleLoop();
  refreshLocale()
    .then(loadSettings)
    .then(() => scanForEditors())
    .catch(() => {
      settings = { ...defaultSettings() };
    });
})();
