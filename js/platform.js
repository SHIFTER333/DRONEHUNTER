/**
 * Платформа: Electron / Capacitor Android / браузер.
 */
(function () {
  const cap = typeof Capacitor !== "undefined" ? Capacitor : null;
  const platform = cap?.getPlatform?.() || "web";
  const isNative = Boolean(cap?.isNativePlatform?.());
  const isAndroid = platform === "android";
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (isAndroid || (isMobileUa && isNative)) {
    document.documentElement.classList.add("is-android", "is-mobile");
  } else if (isMobileUa) {
    document.documentElement.classList.add("is-mobile");
  }

  function usesAssetTiles() {
    return isNative || location.protocol === "file:";
  }

  window.nativeApp = {
    platform,
    isNative,
    isAndroid,
    isMobile: isAndroid || isMobileUa,
    usesAssetTiles,
    isPackaged: () => isNative,
    getAppVersion: () => window.__APP_VERSION__ || ""
  };
})();
