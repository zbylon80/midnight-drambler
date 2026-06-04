(() => {
  const DEFAULT_MESSAGE = "Jest po północy. Rano zdecydujesz, czy naprawdę chcesz to wysłać.";
  const UNLOCK_PHRASE = "JUTRO TEŻ BĘDĘ CHCIAŁ TO WYSŁAĆ";
  const UNLOCK_DURATION_MS = 15 * 60 * 1000;
  const CHECK_INTERVAL_MS = 30 * 1000;

  const DEFAULT_SETTINGS = {
    enabled: true,
    startTime: "00:00",
    endTime: "07:00",
    message: DEFAULT_MESSAGE,
    unlockUntil: 0
  };

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

  const SUBMIT_ACTION_PATTERN = /\b(send|wyslij|opublikuj|publikuj|post|comment|skomentuj|reply|odpowiedz)\b/i;
  const COMPOSER_TRIGGER_PATTERN = /(what'?s on your mind|o czym myslisz|co slychac|utworz post|create post|napisz cos|write something)/i;

  let settings = { ...DEFAULT_SETTINGS };
  let overlayEl = null;
  let countdownEl = null;
  let countdownTimer = 0;

  function isTime(value) {
    return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function normalizeSettings(values) {
    return {
      enabled: Boolean(values.enabled),
      startTime: isTime(values.startTime) ? values.startTime : DEFAULT_SETTINGS.startTime,
      endTime: isTime(values.endTime) ? values.endTime : DEFAULT_SETTINGS.endTime,
      message: typeof values.message === "string" && values.message.trim()
        ? values.message
        : DEFAULT_SETTINGS.message,
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

  function findWritingTarget(target) {
    const element = getElement(target);
    if (!element || isInsideOwnUi(element)) {
      return null;
    }

    const editable = isEditableElement(element)
      ? element
      : element.closest(WRITING_SELECTOR);

    if (!editable || isInsideOwnUi(editable) || isDisabledOrReadonly(editable) || isSearchField(editable)) {
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
        if (editors.some((editor) => !isDisabledOrReadonly(editor) && !isSearchField(editor))) {
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
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
  }

  function showOverlay(mode) {
    if (!shouldBlock() && mode !== "confirm") {
      return;
    }

    closeOverlay();

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
    title.textContent = "Midnight Drambler";

    const message = document.createElement("p");
    message.textContent = settings.message;

    const actions = document.createElement("div");
    actions.className = "midnight-drambler-actions";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "midnight-drambler-button midnight-drambler-button--secondary";
    closeButton.textContent = "Zamknij";
    closeButton.addEventListener("click", closeOverlay);

    const unlockButton = document.createElement("button");
    unlockButton.type = "button";
    unlockButton.className = "midnight-drambler-button midnight-drambler-button--primary";
    unlockButton.textContent = "Odblokuj wyjątkowo";
    unlockButton.addEventListener("click", () => showOverlay("confirm"));

    actions.append(closeButton, unlockButton);
    dialog.append(title, message, actions);
    closeButton.focus();
  }

  function renderConfirmDialog(dialog) {
    const title = document.createElement("h2");
    title.textContent = "Odblokowanie wyjątkowe";

    const intro = document.createElement("p");
    intro.textContent = "Jeśli to naprawdę pilne, przepisz dokładnie zdanie poniżej.";

    const phrase = document.createElement("strong");
    phrase.className = "midnight-drambler-phrase";
    phrase.textContent = UNLOCK_PHRASE;

    const form = document.createElement("form");
    form.className = "midnight-drambler-confirmation";

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", "Potwierdzenie odblokowania");

    const error = document.createElement("p");
    error.className = "midnight-drambler-error";
    error.setAttribute("role", "alert");

    const actions = document.createElement("div");
    actions.className = "midnight-drambler-actions";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "midnight-drambler-button midnight-drambler-button--secondary";
    backButton.textContent = "Wróć";
    backButton.addEventListener("click", () => showOverlay("blocked"));

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "midnight-drambler-button midnight-drambler-button--primary";
    submitButton.textContent = "Odblokuj na 15 min";

    actions.append(backButton, submitButton);
    form.append(input, error, actions);
    dialog.append(title, intro, phrase, form);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (input.value !== UNLOCK_PHRASE) {
        error.textContent = "Zdanie musi być wpisane dokładnie tak samo.";
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

    countdownEl.textContent = `Midnight Drambler wyłączony. Pozostało: ${remainingMinutes()} min.`;
  }

  function hideCountdown() {
    if (countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = 0;
    }

    if (countdownEl) {
      countdownEl.remove();
      countdownEl = null;
    }
  }

  function updateCountdown() {
    if (!shouldShowCountdown()) {
      hideCountdown();
      return;
    }

    if (!countdownEl) {
      countdownEl = document.createElement("div");
      countdownEl.id = "midnight-drambler-countdown";
      countdownEl.setAttribute("role", "status");
      document.documentElement.append(countdownEl);
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
      if (!isDisabledOrReadonly(editor) && !isSearchField(editor)) {
        editor.dataset.midnightDramblerGuarded = "true";
      }
    }

    enforceActiveEditor();
  }

  async function loadSettings() {
    const values = await browser.storage.local.get(DEFAULT_SETTINGS);
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
          if (element) {
            scanForEditors(element);
          }
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

  installEventGuards();
  watchStorage();
  watchDom();
  startScheduleLoop();
  loadSettings().then(() => scanForEditors()).catch(() => {
    settings = { ...DEFAULT_SETTINGS };
  });
})();
