chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SELECT_ELEMENT_INSPECTOR_RESIZE_VIEWPORT") {
    const tabId = sender.tab?.id;
    const width = clampDimension(message.width, 320, 2560);
    const height = clampDimension(message.height, 480, 1800);

    if (!tabId || !width || !height) {
      sendResponse({ ok: false, error: "Invalid resize target." });
      return false;
    }

    emulateViewport(tabId, width, height, sendResponse);
    return true;
  }

  if (message?.type === "SELECT_ELEMENT_INSPECTOR_RESET_VIEWPORT") {
    const tabId = sender.tab?.id;

    if (!tabId) {
      sendResponse({ ok: false, error: "Invalid resize target." });
      return false;
    }

    clearViewportEmulation(tabId, sendResponse);
    return true;
  }

  if (message?.type !== "SELECT_ELEMENT_INSPECTOR_CAPTURE") {
    return false;
  }

  const windowId = sender.tab?.windowId;

  chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }

    sendResponse({ ok: true, dataUrl });
  });

  return true;
});

function emulateViewport(tabId, width, height, sendResponse) {
  const target = { tabId };

  chrome.debugger.attach(target, "1.3", () => {
    const attachError = chrome.runtime.lastError;

    if (attachError && !attachError.message.includes("Another debugger is already attached")) {
      sendResponse({ ok: false, error: attachError.message });
      return;
    }

    chrome.debugger.sendCommand(
      target,
      "Emulation.setDeviceMetricsOverride",
      {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
        screenWidth: width,
        screenHeight: height
      },
      () => {
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, error: chrome.runtime.lastError.message });
          return;
        }

        sendResponse({ ok: true, width, height, mobile: width < 600 });
      }
    );
  });
}

function clearViewportEmulation(tabId, sendResponse) {
  const target = { tabId };

  chrome.debugger.sendCommand(target, "Emulation.clearDeviceMetricsOverride", () => {
    const clearError = chrome.runtime.lastError;

    chrome.debugger.detach(target, () => {
      const detachError = chrome.runtime.lastError;

      if (clearError && !clearError.message.includes("Debugger is not attached")) {
        sendResponse({ ok: false, error: clearError.message });
        return;
      }

      if (detachError && !detachError.message.includes("Debugger is not attached")) {
        sendResponse({ ok: false, error: detachError.message });
        return;
      }

      sendResponse({ ok: true });
    });
  });
}

function clampDimension(value, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.min(Math.max(Math.round(number), min), max);
}
