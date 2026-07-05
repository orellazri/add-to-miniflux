const baseUrlInput = document.getElementById("baseUrl");
const apiTokenInput = document.getElementById("apiToken");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + type;

  setTimeout(() => {
    statusEl.className = "status";
  }, 3000);
}

function normalizeBaseUrl(value) {
  return value.trim().replace(/\/+$/, "").replace(/\/v1$/, "");
}

chrome.storage.sync.get(["baseUrl", "apiToken"], (result) => {
  if (result.baseUrl) baseUrlInput.value = result.baseUrl;
  if (result.apiToken) apiTokenInput.value = result.apiToken;
});

saveBtn.addEventListener("click", () => {
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);
  const apiToken = apiTokenInput.value.trim();

  if (!baseUrl) {
    showStatus("Miniflux base URL is required.", "error");
    return;
  }

  if (!apiToken) {
    showStatus("API token is required.", "error");
    return;
  }

  try {
    new URL(baseUrl);
  } catch {
    showStatus("Please enter a valid URL.", "error");
    return;
  }

  chrome.storage.sync.set({ baseUrl, apiToken }, () => {
    showStatus("Settings saved.", "success");
  });
});
