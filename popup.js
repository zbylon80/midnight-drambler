const FALLBACK_MESSAGES = {
  extensionName: "Midnight Drambler",
  defaultBlockMessage: "Jest po północy. Rano zdecydujesz, czy naprawdę chcesz to wysłać.",
  htmlLang: "pl",
  popupTagline: "Nocna pauza przed wysłaniem.",
  enableBlockerLabel: "Włącz blokadę",
  startTimeLabel: "Od",
  endTimeLabel: "Do",
  customMessageLabel: "Wiadomość",
  saveButton: "Zapisz",
  settingsSaved: "Zapisano.",
  settingsLoadError: "Nie udało się wczytać ustawień."
};

const DEFAULT_LOCALE = "pl";
const SUPPORTED_LOCALES = ["pl", "en"];
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
  const languages = [
    navigator.language,
    ...(navigator.languages || []),
    browser.i18n.getUILanguage()
  ].filter(Boolean).map((language) => language.toLowerCase());

  return SUPPORTED_LOCALES.find((locale) => (
    languages.some((language) => language === locale || language.startsWith(`${locale}-`))
  )) || DEFAULT_LOCALE;
}

async function loadLocale() {
  const nextLocale = getPreferredLocale();
  if (nextLocale === currentLocale && Object.keys(localeMessages).length) {
    return;
  }

  const response = await fetch(browser.runtime.getURL(`_locales/${nextLocale}/messages.json`));
  if (!response.ok) {
    throw new Error(`Could not load locale: ${nextLocale}`);
  }

  localeMessages = await response.json();
  currentLocale = nextLocale;
}

const form = document.querySelector("#settings-form");
const enabledInput = document.querySelector("#enabled");
const startInput = document.querySelector("#start-time");
const endInput = document.querySelector("#end-time");
const messageInput = document.querySelector("#custom-message");
const statusEl = document.querySelector("#status");

function defaultSettings() {
  return {
    enabled: true,
    startTime: "00:00",
    endTime: "07:00",
    message: i18n("defaultBlockMessage")
  };
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
      : defaults.message
  };
}

function isTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function loadSettings() {
  const values = await browser.storage.local.get(defaultSettings());
  const settings = normalizeSettings(values);

  enabledInput.checked = settings.enabled;
  startInput.value = settings.startTime;
  endInput.value = settings.endTime;
  messageInput.value = settings.message;
}

async function saveSettings(event) {
  event.preventDefault();

  const settings = normalizeSettings({
    enabled: enabledInput.checked,
    startTime: startInput.value,
    endTime: endInput.value,
    message: messageInput.value
  });

  await browser.storage.local.set(settings);
  statusEl.textContent = i18n("settingsSaved");
  window.setTimeout(() => {
    statusEl.textContent = "";
  }, 1800);
}

function localizeDocument() {
  document.documentElement.lang = i18n("htmlLang");

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = i18n(element.dataset.i18n);
  }
}

async function initialize() {
  await loadLocale();
  localizeDocument();
  form.addEventListener("submit", saveSettings);
  await loadSettings();
}

initialize().catch(() => {
  localizeDocument();
  statusEl.textContent = i18n("settingsLoadError");
});
