/**
 * Онлайн-оновлення для Android: OTA web-bundle (Capgo) + APK fallback.
 */
(function () {
  const MANIFEST_URL =
    "https://github.com/SHIFTER333/DRONEHUNTER/releases/latest/download/android-latest.json";
  const DEFER_KEY = "dh_android_update_deferred";

  function semverCompare(a, b) {
    const pa = String(a || "")
      .match(/^(\d+)\.(\d+)\.(\d+)/);
    const pb = String(b || "")
      .match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!pa || !pb) return 0;
    for (let i = 1; i <= 3; i++) {
      const d = Number(pa[i]) - Number(pb[i]);
      if (d) return d;
    }
    return 0;
  }

  async function getLocalVersion() {
    try {
      const res = await fetch("assets/version.json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return String(data.version || "").trim();
      }
    } catch (e) { /* ignore */ }
    return window.__APP_VERSION__ || "";
  }

  async function fetchManifest() {
    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function getCapgo() {
    return window.Capacitor?.Plugins?.CapacitorUpdater || null;
  }

  async function downloadBundle(manifest, onProgress) {
    const Updater = getCapgo();
    if (!Updater?.download) throw new Error("CapacitorUpdater unavailable");
    const version = manifest.version;
    const url = manifest.bundleUrl;
    if (!url) throw new Error("No bundleUrl");
    onProgress?.(5);
    const result = await Updater.download({ url, version });
    onProgress?.(90);
    return result;
  }

  async function applyBundle(version) {
    const Updater = getCapgo();
    if (!Updater?.set) throw new Error("CapacitorUpdater unavailable");
    await Updater.set({ id: version });
    if (Updater.reload) await Updater.reload();
    else location.reload();
  }

  async function installApk(url) {
    const Browser = window.Capacitor?.Plugins?.Browser;
    if (Browser?.open) {
      await Browser.open({ url, presentationStyle: "popover" });
      return;
    }
    window.open(url, "_system");
  }

  window.androidUpdateApi = {
    MANIFEST_URL,
    semverCompare,
    getLocalVersion,
    fetchManifest,
    checkAndApply: async function (handlers) {
      if (!window.nativeApp?.isAndroid) return { status: "skip" };
      let deferred = null;
      try {
        deferred = localStorage.getItem(DEFER_KEY);
      } catch (e) { /* ignore */ }
      const local = await getLocalVersion();
      const manifest = await fetchManifest();
      const remote = String(manifest.version || "").trim();
      if (!remote || semverCompare(local, remote) >= 0) {
        return { status: "latest", local, remote };
      }
      if (deferred === remote) {
        return { status: "deferred", local, remote, manifest };
      }
      handlers?.onAvailable?.({ local, remote, manifest });
      return { status: "available", local, remote, manifest };
    },
    runOtaUpdate: async function (manifest, onProgress) {
      onProgress?.({ phase: "downloading", percent: 0, version: manifest.version });
      await downloadBundle(manifest, (pct) => {
        onProgress?.({ phase: "downloading", percent: pct, version: manifest.version });
      });
      onProgress?.({ phase: "ready", percent: 100, version: manifest.version });
      return manifest.version;
    },
    applyReadyBundle: async function (version) {
      await applyBundle(version);
    },
    openApkDownload: installApk,
    deferVersion: function (version) {
      try {
        localStorage.setItem(DEFER_KEY, version);
      } catch (e) { /* ignore */ }
    }
  };
})();
