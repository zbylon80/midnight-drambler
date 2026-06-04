const DEFAULT_MESSAGE = "Jest po północy. Rano zdecydujesz, czy naprawdę chcesz to wysłać.";

const DEFAULT_SETTINGS = {
  enabled: true,
  startTime: "00:00",
  endTime: "07:00",
  message: DEFAULT_MESSAGE
};

const form = document.querySelector("#settings-form");
const enabledInput = document.querySelector("#enabled");
const startInput = document.querySelector("#start-time");
const endInput = document.querySelector("#end-time");
const messageInput = document.querySelector("#custom-message");
const statusEl = document.querySelector("#status");

function normalizeSettings(values) {
  return {
    enabled: Boolean(values.enabled),
    startTime: isTime(values.startTime) ? values.startTime : DEFAULT_SETTINGS.startTime,
    endTime: isTime(values.endTime) ? values.endTime : DEFAULT_SETTINGS.endTime,
    message: typeof values.message === "string" && values.message.trim()
      ? values.message
      : DEFAULT_SETTINGS.message
  };
}

function isTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function loadSettings() {
  const values = await browser.storage.local.get(DEFAULT_SETTINGS);
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
  statusEl.textContent = "Zapisano.";
  window.setTimeout(() => {
    statusEl.textContent = "";
  }, 1800);
}

form.addEventListener("submit", saveSettings);
loadSettings().catch(() => {
  statusEl.textContent = "Nie udało się wczytać ustawień.";
});
