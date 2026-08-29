(() => {
  "use strict";

  function isImg(element) {
    return (
      !!element &&
      element.nodeType === 1 &&
      String(element.tagName).toUpperCase() === "IMG"
    );
  }

  function normalizeHttpUrl(value) {
    if (!value) return null;

    try {
      const url = new URL(value, location.href);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  function parseSrcset(srcset) {
    if (!srcset) return [];

    return srcset
      .split(",")
      .map((part) => {
        const bits = part.trim().split(/\s+/);
        const url = normalizeHttpUrl(bits[0]);
        if (!url) return null;
        let w = 0;
        if (bits[1] && /w$/i.test(bits[1])) {
          w = parseInt(bits[1], 10) || 0;
        }
        return { url, w };
      })
      .filter(Boolean);
  }

  function getImgUrl(img) {
    if (!isImg(img)) return null;

    const candidates = parseSrcset(img.getAttribute("srcset") || "");
    const current = normalizeHttpUrl(img.currentSrc || img.getAttribute("src") || img.src || "");
    if (current) {
      candidates.push({ url: current, w: img.naturalWidth || 0 });
    }
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.w - a.w);
    return candidates[0].url;
  }

  function isVisibleImage(img) {
    if (!isImg(img) || !getImgUrl(img)) return false;

    const rect = img.getBoundingClientRect();

    return (
      rect.width > 10 &&
      rect.height > 10 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < innerHeight &&
      rect.left < innerWidth
    );
  }

  function containsPoint(img, x, y) {
    if (!isVisibleImage(img)) return false;

    const rect = img.getBoundingClientRect();

    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  function bestImgIn(container, x, y) {
    if (!container || container.nodeType !== 1) return null;

    const images = [];

    if (isImg(container)) {
      images.push(container);
    }

    try {
      images.push(...container.querySelectorAll("img"));
    } catch {
      return null;
    }

    const underPoint = images.filter((img) => containsPoint(img, x, y));

    if (underPoint.length) {
      underPoint.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();

        return (
          rectB.width * rectB.height -
          rectA.width * rectA.height
        );
      });

      return underPoint[0];
    }

    const visible = images.filter(isVisibleImage);
    return visible.length === 1 ? visible[0] : null;
  }

  function findFromEvent(event) {
    const x = event.clientX;
    const y = event.clientY;

    const path =
      typeof event.composedPath === "function"
        ? event.composedPath()
        : [];

    for (const node of path) {
      if (!node || node.nodeType !== 1) continue;

      if (isImg(node) && isVisibleImage(node)) {
        return node;
      }

      const parent = node.parentElement;

      if (parent) {
        const hit = bestImgIn(parent, x, y);
        if (hit) return hit;
      }

      const hit = bestImgIn(node, x, y);
      if (hit) return hit;

      if (String(node.tagName).toUpperCase() === "ARTICLE") {
        break;
      }
    }

    for (const node of document.elementsFromPoint(x, y)) {
      if (isImg(node) && isVisibleImage(node)) {
        return node;
      }

      const hit = bestImgIn(node.parentElement || node, x, y);
      if (hit) return hit;
    }

    const images = Array.from(document.getElementsByTagName("img"));
    const hits = images.filter((img) => containsPoint(img, x, y));

    hits.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();

      return (
        rectB.width * rectB.height -
        rectA.width * rectA.height
      );
    });

    return hits[0] || null;
  }

  function guessFilename(url) {
    try {
      const parsed = new URL(url);
      const last =
        parsed.pathname.split("/").filter(Boolean).pop() ||
        "instagram";

      const clean = last
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 180);

      if (/\.(jpe?g|png|webp|gif)$/i.test(clean)) {
        return clean;
      }

      return `${clean || "instagram"}.jpg`;
    } catch {
      return `instagram-${Date.now()}.jpg`;
    }
  }

  let lastImgUrl = null;
  let lastPoint = null;

  document.addEventListener(
    "contextmenu",
    (event) => {
      lastPoint = {
        x: event.clientX,
        y: event.clientY
      };

      const img = findFromEvent(event);
      lastImgUrl = img ? getImgUrl(img) : null;
    },
    true
  );

  browser.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== "ig-get-image") {
      return false;
    }

    return Promise.resolve().then(() => {
      if (!lastImgUrl && lastPoint) {
        const images = Array.from(
          document.getElementsByTagName("img")
        );

        const hits = images.filter((img) =>
          containsPoint(img, lastPoint.x, lastPoint.y)
        );

        if (hits.length) {
          lastImgUrl = getImgUrl(hits[0]);
        }
      }

      if (!lastImgUrl) {
        return {
          ok: false
        };
      }

      return {
        ok: true,
        url: lastImgUrl,
        filename: guessFilename(lastImgUrl)
      };
    });
  });
})();
