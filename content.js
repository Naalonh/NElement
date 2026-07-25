(() => {
  if (window.__selectElementInspector?.loaded) {
    return;
  }

  const state = {
    loaded: true,
    active: false,
    hoverBox: null,
    panel: null,
    lastElement: null,
    capturing: false
  };

  window.__selectElementInspector = state;

  const robotoFontFaces = [400, 500, 700, 800, 900]
    .map((weight) => `
      @font-face {
        font-family: "Roboto";
        font-style: normal;
        font-weight: ${weight};
        font-display: swap;
        src: url("${chrome.runtime.getURL(`fonts/Roboto-${weight}.ttf`)}") format("truetype");
      }
    `)
    .join("");

  const style = document.createElement("style");
  style.textContent = `
    ${robotoFontFaces}

    .sei-hover-box {
      position: fixed;
      z-index: 2147483646;
      pointer-events: none;
      border: 2px solid #13c4c8;
      background: rgba(19, 196, 200, 0.14);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.95),
        0 0 0 5px rgba(47, 208, 103, 0.14),
        0 10px 25px rgba(0, 27, 61, 0.18);
      display: none;
    }

    .sei-toast,
    .sei-panel {
      position: fixed;
      z-index: 2147483647;
      box-sizing: border-box;
      font-family: Roboto, Arial, ui-sans-serif, system-ui, sans-serif;
      color: #071a32;
    }

    .sei-toast {
      left: 50%;
      top: 18px;
      transform: translateX(-50%);
      border-radius: 8px;
      background: #001b3d;
      color: #ffffff;
      padding: 9px 12px;
      font-size: 13px;
      box-shadow: 0 12px 30px rgba(0, 27, 61, 0.24);
      pointer-events: none;
    }

    .sei-panel {
      right: 18px;
      bottom: 18px;
      display: flex;
      flex-direction: column;
      width: min(720px, calc(100vw - 36px));
      max-height: min(560px, calc(100vh - 36px));
      overflow: hidden;
      border: 1px solid #c9e6f6;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 20px 60px rgba(0, 27, 61, 0.24);
      scrollbar-width: thin;
      scrollbar-color: #13c4c8 transparent;
    }

    .sei-capture-panel {
      width: min(760px, calc(100vw - 36px));
    }

    .sei-panel * {
      box-sizing: border-box;
      font-family: inherit;
      letter-spacing: 0;
    }

    .sei-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid #d8e7f3;
      background:
        linear-gradient(90deg, rgba(11, 143, 240, 0.1) 0%, rgba(19, 196, 200, 0.1) 56%, rgba(47, 208, 103, 0.12) 100%),
        linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
      position: sticky;
      top: 0;
    }

    .sei-heading {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sei-tag-badge {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #0b8ff0 0%, #13c4c8 56%, #2fd067 100%);
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      box-shadow: 0 8px 18px rgba(11, 143, 240, 0.18);
    }

    .sei-title {
      min-width: 0;
      margin: 0;
      font-size: 15px;
      line-height: 1.25;
      font-weight: 800;
      color: #001b3d;
      overflow-wrap: anywhere;
    }

    .sei-subtitle {
      margin: 2px 0 0;
      color: #5c6f84;
      font-size: 12px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .sei-close {
      width: 30px;
      height: 30px;
      border: 1px solid #c5d9e9;
      border-radius: 8px;
      background: #ffffff;
      color: #001b3d;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .sei-close:hover {
      border-color: rgba(19, 196, 200, 0.45);
      background: #effcff;
      color: #087ecf;
    }

    .sei-body {
      flex: 1 1 auto;
      overflow: auto;
      padding: 14px 16px 16px;
      background: #f6fbff;
      scrollbar-width: thin;
      scrollbar-color: #13c4c8 transparent;
    }

    .sei-body::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .sei-body::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #13c4c8;
    }

    .sei-row {
      margin-bottom: 10px;
      border: 1px solid #d8e7f3;
      border-radius: 8px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 27, 61, 0.04);
    }

    .sei-row-grid {
      display: grid;
      grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
      gap: 10px;
      margin-bottom: 10px;
    }

    .sei-row-grid .sei-row {
      min-width: 0;
      margin-bottom: 0;
    }

    .sei-label {
      display: flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      padding: 9px 10px;
      border-bottom: 1px solid #e6f2fa;
      background: #edf8ff;
      color: #36536d;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .sei-label::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: #13c4c8;
      box-shadow: 0 0 0 3px rgba(19, 196, 200, 0.12);
    }

    .sei-value {
      width: 100%;
      margin: 0;
      border: 0;
      background: transparent;
      color: #071a32;
      padding: 10px 12px 12px;
      font: 500 12px/1.55 Roboto, Arial, ui-sans-serif, system-ui, sans-serif;
      white-space: pre;
      overflow: auto;
      overflow-wrap: normal;
      scrollbar-width: thin;
      scrollbar-color: #13c4c8 transparent;
    }

    .sei-value::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .sei-value::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #13c4c8;
    }

    .sei-value::-webkit-scrollbar-track {
      background: transparent;
    }

    .sei-actions {
      flex: 0 0 auto;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin: 0;
      padding: 12px 16px 16px;
      border-top: 1px solid #d8e7f3;
      background: #f6fbff;
    }

    .sei-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 34px;
      border: 1px solid #087ecf;
      border-radius: 8px;
      background: linear-gradient(135deg, #0b8ff0 0%, #13c4c8 54%, #2fd067 100%);
      color: #ffffff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 800;
      padding: 0 12px;
      text-decoration: none;
      box-shadow: 0 8px 18px rgba(11, 143, 240, 0.16);
    }

    .sei-button:hover {
      background: linear-gradient(135deg, #087fde 0%, #0db7be 54%, #25be5c 100%);
    }

    .sei-preview {
      display: block;
      width: 100%;
      max-height: 260px;
      object-fit: contain;
      border: 1px solid #d8e7f3;
      border-radius: 8px;
      background: #f6fbff;
    }

    @media (max-width: 560px) {
      .sei-row-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.documentElement.appendChild(style);

  const hoverBox = document.createElement("div");
  hoverBox.className = "sei-hover-box";
  document.documentElement.appendChild(hoverBox);
  state.hoverBox = hoverBox;

  state.start = startPicker;

  document.addEventListener("keydown", onGlobalKeyDown, true);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "SELECT_ELEMENT_INSPECTOR_START") {
      startPicker();
      sendResponse({ ok: true, active: state.active });
      return false;
    }

    if (message?.type === "SELECT_ELEMENT_INSPECTOR_STOP") {
      stopPicker();
      removePanel();
      sendResponse({ ok: true, active: state.active });
      return false;
    }

    if (message?.type === "SELECT_ELEMENT_INSPECTOR_TOGGLE") {
      if (state.active) {
        stopPicker();
        showToast("Element picker stopped.");
      } else {
        startPicker();
      }

      sendResponse({ ok: true, active: state.active });
      return false;
    }

    if (message?.type === "SELECT_ELEMENT_INSPECTOR_STATE") {
      sendResponse({ ok: true, active: state.active });
      return false;
    }
  });

  function startPicker() {
    removePanel();
    state.active = true;
    state.lastElement = null;
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    showToast("Select an element to inspect. Shift + S or Esc to stop.");
  }

  function stopPicker() {
    state.active = false;
    hoverBox.style.display = "none";
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
  }

  function onMouseMove(event) {
    if (!state.active || shouldIgnore(event.target)) {
      return;
    }

    state.lastElement = event.target;
    drawHoverBox(event.target);
  }

  function onClick(event) {
    if (!state.active || shouldIgnore(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const element = state.lastElement || event.target;
    stopPicker();
    drawHoverBox(element);
    showPanel(inspectElement(element), element);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      stopPicker();
      showToast("Element picker cancelled.");
    }
  }

  function onGlobalKeyDown(event) {
    if (!event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (isEditableTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === "r") {
      event.preventDefault();
      event.stopPropagation();
      captureVisiblePage({ copyAfterCapture: true });
      return;
    }

    if (key === "s") {
      event.preventDefault();
      event.stopPropagation();

      if (state.active) {
        stopPicker();
        showToast("Element picker stopped.");
      } else {
        startPicker();
      }

      return;
    }

    if (key === "e") {
      event.preventDefault();
      event.stopPropagation();
      startPicker();
    }
  }

  function isEditableTarget(target) {
    const element = target instanceof Element ? target : null;
    return Boolean(element?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable='true']"));
  }

  function shouldIgnore(target) {
    return target === hoverBox || target?.closest?.(".sei-panel, .sei-toast");
  }

  function drawHoverBox(element) {
    const rect = element.getBoundingClientRect();
    hoverBox.style.display = "block";
    hoverBox.style.left = `${Math.max(rect.left, 0)}px`;
    hoverBox.style.top = `${Math.max(rect.top, 0)}px`;
    hoverBox.style.width = `${Math.max(rect.width, 0)}px`;
    hoverBox.style.height = `${Math.max(rect.height, 0)}px`;
  }

  function inspectElement(element) {
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);
    const attributes = Array.from(element.attributes || []).reduce((record, attribute) => {
      record[attribute.name] = attribute.value;
      return record;
    }, {});

    return {
      tag: element.tagName.toLowerCase(),
      selector: buildSelector(element),
      text: (element.innerText || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 500),
      attributes,
      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      styles: {
        display: computed.display,
        position: computed.position,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing
      }
    };
  }

  function showPanel(details, element) {
    removePanel();

    const panel = document.createElement("aside");
    panel.className = "sei-panel";
    panel.innerHTML = `
      <div class="sei-panel-header">
        <div class="sei-heading">
          <span class="sei-tag-badge"></span>
          <div>
            <h2 class="sei-title">NElement inspect</h2>
            <p class="sei-subtitle"></p>
          </div>
        </div>
        <button class="sei-close" type="button" aria-label="Close inspector">&times;</button>
      </div>
      <div class="sei-body">
        ${renderRow("Selector", details.selector, true)}
        ${renderRow("Text", details.text || "(no visible text)")}
        <div class="sei-row-grid">
          ${renderRow("Bounds", JSON.stringify(details.bounds, null, 2))}
          ${renderRow("Computed styles", JSON.stringify(details.styles, null, 2))}
        </div>
        ${renderRow("Attributes", JSON.stringify(details.attributes, null, 2))}
      </div>
      <div class="sei-actions">
        <button class="sei-button" data-capture type="button">Capture page</button>
        <button class="sei-button" data-copy-selector type="button">Copy selector</button>
        <button class="sei-button" data-copy-json type="button">Copy JSON</button>
      </div>
    `;

    panel.querySelector(".sei-tag-badge").textContent = details.tag.slice(0, 6);
    panel.querySelector(".sei-subtitle").textContent = details.selector;
    panel.querySelector(".sei-close").addEventListener("click", removePanel);
    panel.querySelector("[data-capture]").addEventListener("click", captureVisiblePage);
    panel.querySelector("[data-copy-selector]").addEventListener("click", () => copyText(details.selector));
    panel.querySelector("[data-copy-json]").addEventListener("click", () => copyText(JSON.stringify(details, null, 2)));

    document.documentElement.appendChild(panel);
    state.panel = panel;
    placePanelBelowElement(panel, element);
  }

  async function captureVisiblePage(options = {}) {
    if (state.capturing) {
      return;
    }

    state.capturing = true;

    try {
      await waitForPaint();
      const response = await chrome.runtime.sendMessage({ type: "SELECT_ELEMENT_INSPECTOR_CAPTURE" });

      if (!response?.ok) {
        throw new Error(response?.error || "Capture failed.");
      }

      showCapturePanel(response.dataUrl);
      if (options.copyAfterCapture) {
        await copyImage(response.dataUrl);
      } else {
        showToast("Page captured.");
      }
    } catch (error) {
      showToast(error.message || "Could not capture this page.");
    } finally {
      state.capturing = false;
    }
  }

  function showCapturePanel(dataUrl) {
    removePanel();

    const panel = document.createElement("aside");
    panel.className = "sei-panel sei-capture-panel";
    panel.innerHTML = `
      <div class="sei-panel-header">
        <h2 class="sei-title">Captured page</h2>
        <button class="sei-close" type="button" aria-label="Close capture preview">&times;</button>
      </div>
      <div class="sei-body">
        <img class="sei-preview" alt="Captured visible page preview">
      </div>
      <div class="sei-actions">
        <a class="sei-button" data-download download="web-page-capture.png">Download PNG</a>
        <button class="sei-button" data-copy-image type="button">Copy image</button>
      </div>
    `;

    panel.querySelector(".sei-preview").src = dataUrl;
    panel.querySelector("[data-download]").href = dataUrl;
    panel.querySelector(".sei-close").addEventListener("click", removePanel);
    panel.querySelector("[data-copy-image]").addEventListener("click", () => copyImage(dataUrl));

    document.documentElement.appendChild(panel);
    state.panel = panel;
    placePanelNearViewportCenter(panel);
  }

  async function copyImage(dataUrl) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      showToast("Image copied.");
    } catch {
      showToast("Could not copy image. Use Download PNG.");
    }
  }

  function placePanelNearViewportCenter(panel) {
    const margin = 18;
    const panelRect = panel.getBoundingClientRect();
    const left = Math.max((window.innerWidth - panelRect.width) / 2, margin);
    const top = Math.max((window.innerHeight - panelRect.height) / 2, margin);

    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  function waitForPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  function placePanelBelowElement(panel, element) {
    const rect = element.getBoundingClientRect();
    const margin = 10;
    const panelRect = panel.getBoundingClientRect();
    const maxLeft = window.innerWidth - panelRect.width - margin;
    const left = Math.min(Math.max(rect.left, margin), Math.max(maxLeft, margin));
    const top = Math.min(
      Math.max(rect.bottom + margin, margin),
      Math.max(window.innerHeight - panelRect.height - margin, margin)
    );

    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  function renderRow(label, value) {
    return `
      <section class="sei-row">
        <span class="sei-label">${escapeHtml(label)}</span>
        <pre class="sei-value">${escapeHtml(value)}</pre>
      </section>
    `;
  }

  function removePanel() {
    state.panel?.remove();
    state.panel = null;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied.");
    } catch {
      showToast("Could not copy from this page.");
    }
  }

  function showToast(message) {
    document.querySelectorAll(".sei-toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = "sei-toast";
    toast.textContent = message;
    document.documentElement.appendChild(toast);

    window.setTimeout(() => toast.remove(), 2200);
  }

  function buildSelector(element) {
    if (element.id) {
      return `#${cssEscape(element.id)}`;
    }

    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      let part = current.tagName.toLowerCase();
      const classNames = Array.from(current.classList || []).filter(Boolean).slice(0, 3);

      if (classNames.length) {
        part += `.${classNames.map(cssEscape).join(".")}`;
      }

      const sameTagSiblings = Array.from(current.parentElement?.children || [])
        .filter((sibling) => sibling.tagName === current.tagName);

      if (sameTagSiblings.length > 1) {
        part += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
      }

      parts.unshift(part);
      current = current.parentElement;

      const candidate = parts.join(" > ");
      if (document.querySelectorAll(candidate).length === 1) {
        return candidate;
      }
    }

    return parts.join(" > ") || element.tagName.toLowerCase();
  }

  function cssEscape(value) {
    if (window.CSS?.escape) {
      return window.CSS.escape(value);
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
