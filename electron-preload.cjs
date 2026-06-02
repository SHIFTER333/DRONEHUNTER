"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApp", {
  isPackaged: () => ipcRenderer.sendSync("app-is-packaged"),
  onUpdateState: (callback) => {
    if (typeof callback !== "function") return () => {};
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("app-update-state", handler);
    return () => ipcRenderer.removeListener("app-update-state", handler);
  },
  installUpdateNow: () => ipcRenderer.invoke("app-update-install"),
  deferUpdate: () => ipcRenderer.invoke("app-update-defer")
});
