/**
 * GitHub Release upload via REST API (без gh CLI).
 * Потрібен GH_TOKEN з правами repo.
 *
 *   set GH_TOKEN=ghp_...
 *   node tools/upload-github-release.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyGhTokenToEnv } from "./load-gh-token.mjs";

applyGhTokenToEnv();

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const owner = pkg.build?.publish?.[0]?.owner || "SHIFTER333";
const repo = pkg.build?.publish?.[0]?.repo || "DRONEHUNTER";
const version = pkg.version;
const tag = `v${version}`;
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

const outDir = path.join(root, "dist-installer");
const setupName = `DRONEHUNTERS-Setup-${version}-x64.exe`;
const setupPath = path.join(outDir, setupName);
const latestYml = path.join(outDir, "latest.yml");

if (!token) {
  console.error("Потрібен GH_TOKEN (Settings → Developer settings → Personal access tokens → repo).");
  process.exit(1);
}
for (const p of [setupPath, latestYml]) {
  if (!fs.existsSync(p)) {
    console.error(`Не знайдено: ${p}\nСпочатку: npm run dist`);
    process.exit(1);
  }
}

const api = `https://api.github.com/repos/${owner}/${repo}`;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "DRONEHUNTERS-release-uploader"
};

async function gh(method, urlPath, body) {
  const res = await fetch(`${api}${urlPath}`, {
    method,
    headers: body instanceof FormData
      ? { Authorization: headers.Authorization, Accept: "application/vnd.github+json", "User-Agent": headers["User-Agent"] }
      : { ...headers, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    throw new Error(`${method} ${urlPath} → ${res.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`);
  }
  return data;
}

async function uploadAsset(releaseId, filePath) {
  const name = path.basename(filePath);
  const stat = fs.statSync(filePath);
  const res = await fetch(
    `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/octet-stream",
        "Content-Length": String(stat.size),
        "User-Agent": "DRONEHUNTERS-release-uploader"
      },
      body: fs.readFileSync(filePath)
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Upload ${name} → ${res.status}: ${JSON.stringify(data)}`);
  console.log(`  ✓ ${name}`);
}

console.log(`\nЗавантаження ${tag} → ${owner}/${repo}\n`);

let release = null;
try {
  release = await gh("GET", `/releases/tags/${tag}`);
  console.log(`Release ${tag} вже існує — додаємо/оновлюємо assets…`);
} catch {
  release = await gh("POST", "/releases", {
    tag_name: tag,
    name: `DRONEHUNTERS ${version}`,
    body: `DRONEHUNTERS ${version}\n\nАвтооновлення через GitHub Releases.`,
    draft: false,
    prerelease: false
  });
  console.log(`✓ Створено release ${tag}`);
}

const androidZip = path.join(root, "dist-android", `android-www-${version}.zip`);
const androidManifest = path.join(root, "assets", "android-latest.json");
const androidApk = path.join(root, "dist-android", `DRONEHUNTERS-Android-${version}.apk`);

const filesToUpload = [setupPath, latestYml];
if (fs.existsSync(androidManifest)) filesToUpload.push(androidManifest);
if (fs.existsSync(androidZip)) filesToUpload.push(androidZip);
if (fs.existsSync(androidApk)) filesToUpload.push(androidApk);

for (const filePath of filesToUpload) {
  const name = path.basename(filePath);
  const assets = release.assets || [];
  const existing = assets.find(a => a.name === name);
  if (existing) {
    await gh("DELETE", `/releases/assets/${existing.id}`);
  }
  await uploadAsset(release.id, filePath);
  release = await gh("GET", `/releases/tags/${tag}`);
}

console.log(`\n✓ Готово: https://github.com/${owner}/${repo}/releases/tag/${tag}\n`);
