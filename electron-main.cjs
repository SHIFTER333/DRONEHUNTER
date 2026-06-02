"use strict";

const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, protocol, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let pendingUpdateVersion = null;
let sessionDeferredVersion = null;
let installing = false;

function getMainWindow() {
  return mainWindow || BrowserWindow.getAllWindows()[0] || null;
}

function sendUpdateState(payload) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send("app-update-state", payload);
  }
}

function shouldSuppressReady(version) {
  return sessionDeferredVersion != null && sessionDeferredVersion === version;
}

function notifyReady(version) {
  pendingUpdateVersion = version;
  if (shouldSuppressReady(version)) {
    sendUpdateState({ phase: "deferred", version });
    return;
  }
  sendUpdateState({ phase: "ready", version });
}

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.logger = console;

  autoUpdater.on("update-available", (info) => {
    const version = info?.version || "";
    pendingUpdateVersion = version;
    sendUpdateState({ phase: "downloading", version, percent: 0 });
  });

  autoUpdater.on("download-progress", (progress) => {
    const version = pendingUpdateVersion || "";
    const percent = Math.min(100, Math.max(0, Math.round(progress?.percent || 0)));
    sendUpdateState({ phase: "downloading", version, percent });
  });

  autoUpdater.on("update-downloaded", (info) => {
    const version = info?.version || pendingUpdateVersion || "";
    notifyReady(version);
  });

  autoUpdater.on("error", (err) => {
    console.error("[autoUpdater]", err?.message || err);
    sendUpdateState({
      phase: "error",
      error: String(err?.message || err || "unknown")
    });
  });

  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 2500);
  setInterval(check, 45 * 60 * 1000);
}

function setupUpdateIpc() {
  ipcMain.on("app-is-packaged", (event) => {
    event.returnValue = app.isPackaged;
  });

  ipcMain.handle("app-update-install", () => {
    if (!app.isPackaged || installing) return { ok: false };
    installing = true;
    setTimeout(() => autoUpdater.quitAndInstall(false, true), 400);
    return { ok: true };
  });

  ipcMain.handle("app-update-defer", () => {
    const version = pendingUpdateVersion;
    if (version) {
      sessionDeferredVersion = version;
      try {
        const deferPath = path.join(app.getPath("userData"), "update-deferred.json");
        fs.writeFileSync(
          deferPath,
          JSON.stringify({ version, deferredAt: Date.now() }),
          "utf8"
        );
      } catch (e) {
        console.warn("[update-defer]", e?.message || e);
      }
    }
    sendUpdateState({ phase: "deferred", version: version || "" });
    return { ok: true };
  });
}

const EMPTY_TILE = path.join(__dirname, "assets", "map-tiles", "empty.png");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "map",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true
    }
  },
  {
    scheme: "game",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true
    }
  }
]);

function registerGameProtocol() {
  const root = path.normalize(__dirname);
  protocol.registerFileProtocol("game", (request, callback) => {
    try {
      const raw = decodeURIComponent(request.url.replace(/^game:\/\//i, ""));
      const rel = raw.replace(/^\/+/, "");
      const filePath = path.normalize(path.join(__dirname, rel));
      if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
        callback({ error: -6 });
        return;
      }
      callback({ path: filePath });
    } catch (e) {
      callback({ error: -2 });
    }
  });
}

function registerMapProtocol() {
  protocol.registerFileProtocol("map", (request, callback) => {
    try {
      const raw = decodeURIComponent(request.url.replace(/^map:\/\//i, ""));
      const rel = raw.replace(/^\/+/, "").replace(/^tiles\//, "");
      const tilePath = path.normalize(path.join(__dirname, "assets", "map-tiles", rel));
      const root = path.normalize(path.join(__dirname, "assets", "map-tiles"));
      if (!tilePath.startsWith(root) || !fs.existsSync(tilePath)) {
        callback(fs.existsSync(EMPTY_TILE) ? { path: EMPTY_TILE } : { error: -6 });
        return;
      }
      callback({ path: tilePath });
    } catch (e) {
      callback(fs.existsSync(EMPTY_TILE) ? { path: EMPTY_TILE } : { error: -2 });
    }
  });
}

function registerFullscreenShortcut(win) {
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1420,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: "DRONEHUNTERS",
    backgroundColor: "#030810",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "electron-preload.cjs")
    }
  });

  const htmlPath = path.join(__dirname, "index.html");
  mainWindow.loadFile(htmlPath);

  registerFullscreenShortcut(mainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupUpdateIpc();
  registerGameProtocol();
  registerMapProtocol();
  createWindow();
  setupAutoUpdater();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
