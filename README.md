# NElement

A production-ready Chrome Manifest V3 extension for selecting visible page elements, testing responsive page sizes, inspecting useful frontend details, and capturing the current visible page area.

Created by [Naalonh](https://github.com/Naalonh).

## Overview

NElement helps developers, designers, QA testers, and frontend learners quickly inspect page elements without opening DevTools for every small check.

You can hover over a page, choose an element, and view its selector, visible text, bounds, attributes, and selected computed styles. The extension also includes quick page capture tools for copying or downloading a PNG of the visible tab area.

## Features

- Pick any visible page element with a clean hover highlight.
- Inspect the selected element in an in-page detail panel.
- Generate a practical CSS selector for the selected element.
- Copy the selector with one click.
- Copy the full inspection result as formatted JSON.
- View element bounds, attributes, text, and computed styles.
- Capture the visible page area as a PNG.
- Copy captures to the clipboard when supported by the browser/page.
- Download captures as `web-page-capture.png`.
- Preview the current page in a centered responsive frame.
- Use responsive presets for mobile, tablet, laptop, desktop, and wide layouts.
- Apply a custom width and height without opening DevTools.
- Use keyboard shortcuts for fast repeated workflows.
- Lightweight Manifest V3 implementation with no build step.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Shift + S` | Start or stop element selection |
| `Shift + E` | Select another element after inspecting one |
| `Shift + R` | Capture the visible page area and copy it automatically |
| `Shift + D` | Open or close the responsive resize panel |
| `Esc` | Cancel selection while the picker is active |

## Installation

This extension is currently installed as an unpacked Chrome extension.

1. Download or clone this repository.
2. Open Chrome.
3. Go to `chrome://extensions`.
4. Enable `Developer mode`.
5. Click `Load unpacked`.
6. Select the project folder.
7. Pin the extension from the Chrome extensions menu if you want quick access.

After loading it, open any normal web page and click the extension icon.

## How To Use

1. Open a page you want to inspect.
2. Click the NElement extension icon.
3. Click `Start selecting`, or press `Shift + S`.
4. Hover over the page until the element you want is highlighted.
5. Click the highlighted element.
6. Review the inspection panel that appears on the page.
7. Use `Copy selector`, `Copy JSON`, or `Capture page` as needed.

To inspect another element, press `Shift + E` or start the picker again from the popup.

## Responsive Resize

Open the responsive resize panel from the popup or press `Shift + D` on the page.

The panel includes common size presets:

- Mobile: `390 x 844`
- Small mobile: `360 x 740`
- Tablet landscape: `1024 x 768`
- Tablet portrait: `768 x 1024`
- Laptop: `1280 x 800`
- Desktop: `1440 x 900`
- Wide: `1920 x 1080`

You can also enter a custom width and height, then click `Apply`. NElement opens a centered live preview frame of the current page so the layout reflows at that size without resizing Chrome or opening DevTools.

## Capture Workflow

There are two ways to capture the visible page area:

- Press `Shift + R` to capture the visible page and copy the PNG automatically.
- Click `Capture page` in the inspection panel to show a preview with copy and download actions.

If image copying is blocked by the page or browser, use the `Download PNG` button in the capture preview.

## What The Inspector Shows

For each selected element, the panel includes:

- CSS selector
- Visible text, trimmed for readability
- Element bounds: x, y, width, and height
- HTML attributes
- Computed styles: display, position, color, background color, font family, font size, font weight, line height, and letter spacing

## Browser Support

This project targets Chromium-based browsers that support Manifest V3, including:

- Google Chrome
- Microsoft Edge
- Brave
- Arc

Some browser-protected pages cannot run extensions, including Chrome Web Store pages, internal browser pages, and some restricted `chrome://` URLs.

## Permissions

The extension uses the following permissions:

- `activeTab`: allows the extension to interact with the active tab after user action.
- `scripting`: injects the content script when the popup controls the picker.
- `tabs`: supports active tab lookup and visible tab capture.
- `<all_urls>` host permission: lets the inspector run on regular websites.

The extension does not send inspected page data to an external server. Inspection data stays in the browser page and clipboard actions only happen when you click a copy button or use the capture shortcut.

## Project Structure

```text
.
|-- assets/          Extension icons and logo image
|-- fonts/           Local Roboto font files used by the popup and overlay
|-- background.js    Service worker for visible tab capture
|-- content.js       In-page picker, responsive resize, inspector panel, capture preview, and shortcuts
|-- manifest.json    Chrome Manifest V3 configuration
|-- popup.css        Popup UI styles
|-- popup.html       Extension popup markup
|-- popup.js         Popup behavior and communication with the active tab
`-- README.md        Project documentation
```

## Development

No bundler or package install is required.

After editing files:

1. Go to `chrome://extensions`.
2. Find NElement.
3. Click the reload button.
4. Refresh the page you are testing.

For JavaScript or manifest changes, reloading the extension is recommended before testing again.

## Production Status

This extension is ready for normal local production use as an unpacked Chrome extension. It includes complete icons, popup controls, keyboard shortcuts, inspection UI, capture UI, and Manifest V3 configuration.

Before publishing to the Chrome Web Store, review the store listing requirements, privacy disclosure, screenshots, category, and final permission wording.

## Author

[Naalonh](https://github.com/Naalonh)
