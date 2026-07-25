const startButton = document.getElementById("startPicker");
const buttonText = document.getElementById("buttonText");
const statusText = document.getElementById("status");
const statusDot = document.getElementById("statusDot");

let activeTabId = null;
let pickerActive = false;

init();

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  setStatus(pickerActive ? "Stopping picker..." : "Starting picker...");

  try {
    await ensureContentScript(activeTabId);
    const response = await chrome.tabs.sendMessage(activeTabId, {
      type: "SELECT_ELEMENT_INSPECTOR_TOGGLE"
    });

    if (!response?.ok) {
      throw new Error("Could not toggle picker.");
    }

    updateButton(response.active);
    setStatus(response.active ? "Picker is active. Shift + S stops it." : "Picker stopped. Shift + S starts it.");
    window.setTimeout(() => window.close(), 250);
  } catch (error) {
    setStatus(error.message || "Could not control picker on this page.");
  } finally {
    startButton.disabled = false;
  }
});

async function init() {
  try {
    const tab = await getActiveTab();
    activeTabId = tab.id;

    await ensureContentScript(activeTabId);
    const response = await chrome.tabs.sendMessage(activeTabId, {
      type: "SELECT_ELEMENT_INSPECTOR_STATE"
    });

    updateButton(Boolean(response?.active));
    setStatus(response?.active ? "Picker is running. Hotkey: Shift + S." : "Ready. Hotkey: Shift + S.");
  } catch (error) {
    startButton.disabled = true;
    setStatus(error.message || "This page cannot run the picker.");
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error("No active tab found.");
  }

  return tab;
}

async function ensureContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}

function updateButton(active) {
  pickerActive = active;
  startButton.classList.toggle("is-active", active);
  statusDot.classList.toggle("is-active", active);
  buttonText.textContent = active ? "Stop selecting" : "Start selecting";
  startButton.setAttribute("aria-pressed", String(active));
}

function setStatus(message) {
  statusText.textContent = message;
}
