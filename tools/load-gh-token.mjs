import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tokenFile = path.join(root, "tools", ".gh-token");

export function loadGhToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (fs.existsSync(tokenFile)) {
    const t = fs.readFileSync(tokenFile, "utf8").trim();
    if (t) return t;
  }
  return null;
}

export function applyGhTokenToEnv() {
  const token = loadGhToken();
  if (token) {
    process.env.GH_TOKEN = token;
    process.env.GITHUB_TOKEN = token;
  }
  return token;
}
