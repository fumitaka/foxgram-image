"use strict";

const MENU_SAVE = "ig-save-image";
const MENU_OPEN = "ig-open-image";

function normalizeHttpUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function sanitizeFilename(value) {
  const fallback = `instagram-${Date.now()}.jpg`;

  if (typeof value !== "string" || !value) {
    return fallback;
  }

  const clean = value
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 180);

  return clean || fallback;
}

browser.contextMenus.create({
  id: MENU_SAVE,
  title: "Instagram 画像を保存",
  contexts: ["all"],
  documentUrlPatterns: [
    "*://*.instagram.com/*",
    "*://instagram.com/*"
  ]
});

browser.contextMenus.create({
  id: MENU_OPEN,
  title: "Instagram 画像を新しいタブで開く",
  contexts: ["all"],
  documentUrlPatterns: [
    "*://*.instagram.com/*",
    "*://instagram.com/*"
  ]
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || tab.id == null) return;

  if (info.menuItemId !== MENU_SAVE && info.menuItemId !== MENU_OPEN) {
    return;
  }

  let url = normalizeHttpUrl(info.srcUrl || "");
  let filename = null;

  try {
    const data = await browser.tabs.sendMessage(tab.id, {
      type: "ig-get-image"
    });

    if (data?.ok) {
      const detected = normalizeHttpUrl(data.url);
      if (detected) {
        url = detected;
        filename = data.filename || null;
      }
    }
  } catch {
    // Content script may not be injected yet (page not reloaded after install).
  }

  if (!url) return;

  if (info.menuItemId === MENU_OPEN) {
    await browser.tabs.create({
      url,
      active: true
    });
    return;
  }

  try {
    await browser.downloads.download({
      url,
      filename: `instagram/${sanitizeFilename(filename || "instagram.jpg")}`,
      saveAs: true,
      conflictAction: "uniquify"
    });
  } catch (err) {
    console.error("Foxgram Image download failed", err);
  }
});
