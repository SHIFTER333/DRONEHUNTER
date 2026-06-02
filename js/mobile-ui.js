/**
 * Мобільний UI: touch-жести, нижня панель керування, drawer бокової панелі.
 */
(function () {
  if (!window.nativeApp?.isMobile) return;

  const MOBILE_PANEL_KEY = "dh_mobile_panel_open";

  function getCanvas() {
    return document.getElementById("gameCanvas");
  }

  function initMobileChrome() {
    const layout = document.querySelector(".layout");
    if (!layout || document.getElementById("mobileControls")) return;

    const bar = document.createElement("div");
    bar.id = "mobileControls";
    bar.className = "mobile-controls";
    bar.innerHTML = `
      <button type="button" id="mobBtnPanel" class="mob-btn" aria-label="Panel">☰</button>
      <button type="button" id="mobBtnWave" class="mob-btn mob-btn--accent" aria-label="Wave">▶</button>
      <button type="button" id="mobBtnShop" class="mob-btn" aria-label="Shop">🛒</button>
      <button type="button" id="mobBtnPause" class="mob-btn" aria-label="Pause">⏸</button>
      <button type="button" id="mobBtnMenu" class="mob-btn" aria-label="Menu">⌂</button>
    `;
    document.body.appendChild(bar);

    const backdrop = document.createElement("div");
    backdrop.id = "mobilePanelBackdrop";
    backdrop.className = "mobile-panel-backdrop";
    document.body.appendChild(backdrop);

    const panel = document.querySelector(".panel");
    if (panel) panel.classList.add("panel--mobile-drawer");

    function setPanelOpen(open) {
      if (panel) panel.classList.toggle("panel--open", open);
      backdrop.classList.toggle("visible", open);
      try {
        localStorage.setItem(MOBILE_PANEL_KEY, open ? "1" : "0");
      } catch (e) { /* ignore */ }
    }

    let panelOpen = false;
    try {
      panelOpen = localStorage.getItem(MOBILE_PANEL_KEY) === "1";
    } catch (e) { /* ignore */ }
    setPanelOpen(panelOpen);

    document.getElementById("mobBtnPanel")?.addEventListener("click", () => {
      panelOpen = !panelOpen;
      setPanelOpen(panelOpen);
    });
    backdrop.addEventListener("click", () => {
      panelOpen = false;
      setPanelOpen(false);
    });

    document.getElementById("mobBtnWave")?.addEventListener("click", () => {
      document.getElementById("startWaveBtn")?.click();
    });
    document.getElementById("mobBtnShop")?.addEventListener("click", () => {
      document.getElementById("openShopBtn")?.click();
      panelOpen = false;
      setPanelOpen(false);
    });
    document.getElementById("mobBtnPause")?.addEventListener("click", () => {
      document.getElementById("pauseBtn")?.click();
    });
    document.getElementById("mobBtnMenu")?.addEventListener("click", () => {
      document.getElementById("menuBtn")?.click();
    });

    window.__mobileUi = { setPanelOpen, closePanel: () => { panelOpen = false; setPanelOpen(false); } };

    let musicUnlocked = false;
    document.addEventListener(
      "touchstart",
      () => {
        if (musicUnlocked) return;
        musicUnlocked = true;
        if (typeof window.__ensureMusicPlaying === "function") window.__ensureMusicPlaying();
      },
      { passive: true, once: true }
    );
  }

  function installTouchControls() {
    const canvas = getCanvas();
    if (!canvas || canvas.dataset.mobileTouch === "1") return;
    canvas.dataset.mobileTouch = "1";

    const touch = {
      mode: null,
      startDist: 0,
      startZoom: 1,
      panStart: null,
      lastTap: 0,
      suppressClickUntil: 0
    };

    function dist(a, b) {
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function center(touches) {
      const a = touches[0];
      const b = touches[1];
      return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
    }

    function getState() {
      return window.__gameStateRef;
    }

    function usesOsmMap() {
      const s = getState();
      return s && s.leafletMap && typeof s.leafletMap.getZoom === "function";
    }

    function leafletZoomAt(factor, cx, cy) {
      if (typeof window.__leafletZoomAt === "function") window.__leafletZoomAt(factor, cx, cy);
    }

    function leafletPanBy(dx, dy) {
      if (typeof window.__leafletPanBy === "function") window.__leafletPanBy(dx, dy);
    }

    function screenToWorld(mx, my) {
      if (typeof window.__screenToWorld === "function") return window.__screenToWorld(mx, my);
      return { x: 0, y: 0 };
    }

    function dispatchCanvasClick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      canvas.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          button: 0
        })
      );
    }

    canvas.addEventListener(
      "touchstart",
      (e) => {
        const st = getState();
        if (!st || st.mainMenuOpen) return;
        if (e.touches.length === 1) {
          touch.mode = "pan";
          const t0 = e.touches[0];
          touch.panStart = {
            startX: t0.clientX,
            startY: t0.clientY,
            pan0x: st.camera.panX,
            pan0y: st.camera.panY,
            didDrag: false
          };
        } else if (e.touches.length === 2) {
          touch.mode = "pinch";
          touch.startDist = dist(e.touches[0], e.touches[1]);
          touch.startZoom = st.camera.zoom;
          const c = center(e.touches);
          const rect = canvas.getBoundingClientRect();
          touch.pinchCenter = { x: c.x - rect.left, y: c.y - rect.top };
        }
        if (e.cancelable) e.preventDefault();
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        const st = getState();
        if (!st || st.mainMenuOpen) return;
        if (touch.mode === "pan" && e.touches.length === 1 && touch.panStart) {
          const t0 = e.touches[0];
          const dx = t0.clientX - touch.panStart.startX;
          const dy = t0.clientY - touch.panStart.startY;
          if (!touch.panStart.didDrag && dx * dx + dy * dy > 64) {
            touch.panStart.didDrag = true;
            canvas.classList.add("panning");
          }
          if (touch.panStart.didDrag) {
            if (usesOsmMap()) leafletPanBy(dx - (touch.lastDx || 0), dy - (touch.lastDy || 0));
            else {
              st.camera.panX = touch.panStart.pan0x + dx;
              st.camera.panY = touch.panStart.pan0y + dy;
            }
            touch.lastDx = dx;
            touch.lastDy = dy;
          }
          st.mouseScreen = st.mouseScreen || { x: 0, y: 0 };
          const rect = canvas.getBoundingClientRect();
          st.mouseScreen.x = t0.clientX - rect.left;
          st.mouseScreen.y = t0.clientY - rect.top;
        } else if (touch.mode === "pinch" && e.touches.length === 2) {
          const d = dist(e.touches[0], e.touches[1]);
          const factor = d / (touch.startDist || d);
          const rect = canvas.getBoundingClientRect();
          const cx = touch.pinchCenter?.x ?? rect.width / 2;
          const cy = touch.pinchCenter?.y ?? rect.height / 2;
          if (usesOsmMap()) {
            leafletZoomAt(factor > 1 ? 1.05 : 0.95, cx, cy);
          } else {
            const w0 = screenToWorld(cx, cy);
            st.camera.zoom = Math.min(6, Math.max(0.35, touch.startZoom * factor));
            if (typeof window.__applyZoomPan === "function") {
              window.__applyZoomPan(w0, cx, cy);
            }
          }
          touch.startDist = d;
          touch.startZoom = st.camera.zoom;
        }
        if (e.cancelable) e.preventDefault();
      },
      { passive: false }
    );

    function endTouch(e) {
      const st = getState();
      canvas.classList.remove("panning");
      touch.lastDx = 0;
      touch.lastDy = 0;
      if (touch.mode === "pan" && touch.panStart && !touch.panStart.didDrag && e.changedTouches[0]) {
        const t0 = e.changedTouches[0];
        const now = Date.now();
        touch.suppressClickUntil = now + 450;
        dispatchCanvasClick(t0.clientX, t0.clientY);
        touch.lastTap = now;
      }
      touch.mode = null;
      touch.panStart = null;
    }

    canvas.addEventListener("touchend", endTouch, { passive: true });
    canvas.addEventListener("touchcancel", endTouch, { passive: true });

    canvas.addEventListener(
      "click",
      (e) => {
        if (Date.now() < touch.suppressClickUntil) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true
    );
  }

  function boot() {
    initMobileChrome();
    installTouchControls();
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => {
        const st = getState();
        if (st?.leafletMap) st.leafletMap.invalidateSize();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
