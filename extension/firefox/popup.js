const setupPrompt = document.getElementById("setupPrompt");
const mainForm = document.getElementById("mainForm");
const addStep = document.getElementById("addStep");
const chooseStep = document.getElementById("chooseStep");
const urlInput = document.getElementById("url");
const categorySelect = document.getElementById("category");
const customTitleInput = document.getElementById("customTitle");
const markReadInput = document.getElementById("markRead");
const feedSelect = document.getElementById("feed");
const discoverBtn = document.getElementById("discoverBtn");
const addBtn = document.getElementById("addBtn");
const backBtn = document.getElementById("backBtn");
const statusEl = document.getElementById("status");
const openOptionsLink = document.getElementById("openOptions");

let config = {};
let discoveredFeeds = [];

function normalizeBaseUrl(value) {
  return value.trim().replace(/\/+$/, "").replace(/\/v1$/, "");
}

function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + type;
}

function clearStatus() {
  statusEl.textContent = "";
  statusEl.className = "status";
}

function setBusy(isBusy, message) {
  discoverBtn.disabled = isBusy;
  addBtn.disabled = isBusy;
  backBtn.disabled = isBusy;
  discoverBtn.textContent = isBusy ? message : "Discover Feeds";
  addBtn.textContent = isBusy ? message : "Add Feed";
}

async function minifluxRequest(path, options = {}) {
  const response = await fetch(`${config.baseUrl}/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": config.apiToken,
      ...(options.headers || {}),
    },
  });

  if (response.ok) {
    if (response.status === 204) return null;
    return response.json().catch(() => null);
  }

  const data = await response.json().catch(() => null);
  const message = data?.error_message || data?.message || `Miniflux returned ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  throw error;
}

function populateCategories(categories) {
  categorySelect.innerHTML = "";

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = String(category.id);
    option.textContent = category.title;
    categorySelect.appendChild(option);
  }
}

function populateFeeds(feeds) {
  feedSelect.innerHTML = "";

  for (let index = 0; index < feeds.length; index += 1) {
    const feed = feeds[index];
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${feed.title || feed.url} (${feed.type || "feed"})`;
    feedSelect.appendChild(option);
  }
}

function showChooseStep() {
  addStep.style.display = "none";
  chooseStep.style.display = "block";
}

function showAddStep() {
  chooseStep.style.display = "none";
  addStep.style.display = "block";
}

async function addFeed(feed) {
  const categoryId = Number(categorySelect.value);
  const customTitle = customTitleInput.value.trim();
  const shouldMarkRead = markReadInput.checked;

  if (!categoryId) {
    showStatus("Choose a category before adding the feed.", "error");
    return;
  }

  setBusy(true, "Adding...");
  clearStatus();

  try {
    const created = await minifluxRequest("/feeds", {
      method: "POST",
      body: JSON.stringify({
        feed_url: feed.url,
        category_id: categoryId,
      }),
    });

    const feedId = created?.feed_id;

    if (!feedId) {
      throw new Error("Miniflux did not return a feed ID.");
    }

    if (customTitle) {
      await minifluxRequest(`/feeds/${feedId}`, {
        method: "PUT",
        body: JSON.stringify({ title: customTitle }),
      });
    }

    if (shouldMarkRead) {
      await minifluxRequest(`/feeds/${feedId}/mark-all-as-read`, {
        method: "PUT",
      });
    }

    showStatus("Feed added to Miniflux.", "success");
    setTimeout(() => window.close(), 1000);
  } catch (err) {
    console.error("Add to Miniflux request failed:", err);
    if (err.status === 401) {
      showStatus("Unauthorized. Check your API token in settings.", "error");
    } else {
      showStatus(err.message, "error");
    }
    setBusy(false);
  }
}

openOptionsLink.addEventListener("click", (event) => {
  event.preventDefault();
  chrome.runtime.openOptionsPage();
});

chrome.storage.sync.get(["baseUrl", "apiToken"], async (result) => {
  if (!result.baseUrl || !result.apiToken) {
    setupPrompt.style.display = "block";
    return;
  }

  config = { ...result, baseUrl: normalizeBaseUrl(result.baseUrl) };
  mainForm.style.display = "block";
  discoverBtn.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      urlInput.value = tabs[0].url;
    }
  });

  try {
    const categories = await minifluxRequest("/categories");

    if (!Array.isArray(categories) || categories.length === 0) {
      showStatus("No Miniflux categories found.", "error");
      return;
    }

    populateCategories(categories);
    discoverBtn.disabled = false;
  } catch (err) {
    console.error("Add to Miniflux category load failed:", err);
    if (err.status === 401) {
      showStatus("Unauthorized. Check your API token in settings.", "error");
    } else {
      showStatus(`Could not load categories: ${err.message}`, "error");
    }
  }
});

discoverBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();

  clearStatus();

  if (!url) {
    showStatus("URL is required.", "error");
    return;
  }

  try {
    new URL(url);
  } catch {
    showStatus("Please enter a valid URL.", "error");
    return;
  }

  setBusy(true, "Discovering...");

  try {
    const feeds = await minifluxRequest("/discover", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    if (!Array.isArray(feeds) || feeds.length === 0) {
      showStatus("No feeds were discovered for this URL.", "error");
      setBusy(false);
      return;
    }

    discoveredFeeds = feeds;

    if (feeds.length === 1) {
      await addFeed(feeds[0]);
      return;
    }

    populateFeeds(feeds);
    showChooseStep();
    showStatus("Multiple feeds found. Choose one to add.", "info");
    setBusy(false);
  } catch (err) {
    console.error("Add to Miniflux discovery failed:", err);
    if (err.status === 401) {
      showStatus("Unauthorized. Check your API token in settings.", "error");
    } else {
      showStatus(err.message, "error");
    }
    setBusy(false);
  }
});

addBtn.addEventListener("click", async () => {
  const selectedFeed = discoveredFeeds[Number(feedSelect.value)];

  if (!selectedFeed) {
    showStatus("Choose a feed before continuing.", "error");
    return;
  }

  await addFeed(selectedFeed);
});

backBtn.addEventListener("click", () => {
  clearStatus();
  showAddStep();
});
