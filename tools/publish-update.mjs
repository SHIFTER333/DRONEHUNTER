/**
 * Одна команда «залити онову»:
 *   npm run update
 *
 * 1) +1 patch у package.json
 * 2) збірка Setup + latest.yml в інсталяторі
 * 3) заливка на GitHub (tools/.gh-token або GH_TOKEN)
 *
 * Без bump: npm run update -- --no-bump
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyGhTokenToEnv } from "./load-gh-token.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkgPath = path.join(root, "package.json");
const noBump = process.argv.includes("--no-bump");

function bumpPatch(v) {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)(.*)?$/);
  if (!m) throw new Error(`Невідомий формат версії: ${v}`);
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}${m[4] || ""}`;
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const prev = pkg.version;
if (!noBump) {
  pkg.version = bumpPatch(pkg.version);
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log(`\nВерсія: ${prev} → ${pkg.version}\n`);
} else {
  console.log(`\nВерсія без змін: ${pkg.version}\n`);
}

applyGhTokenToEnv();

execSync("node tools/sync-android-version.mjs", { cwd: root, stdio: "inherit" });
execSync("npm run dist", { cwd: root, stdio: "inherit" });
console.log("\n[Android] Підготовка OTA-бандлу…\n");
execSync("npm run android:prepare", { cwd: root, stdio: "inherit" });
execSync("npm run android:bundle", { cwd: root, stdio: "inherit" });
const apkPath = path.join(root, "dist-android", `DRONEHUNTERS-Android-${pkg.version}.apk`);
if (!fs.existsSync(apkPath)) {
  console.log("\n[Android] APK не знайдено — спроба збірки (gradlew)…\n");
  try {
    execSync("npm run android:apk", { cwd: root, stdio: "inherit" });
  } catch {
    console.warn("\n⚠ APK не зібрано — на телефонах буде лише OTA (zip). Зберіть APK пізніше: npm run android:apk\n");
  }
}
execSync("node tools/verify-release.mjs", { cwd: root, stdio: "inherit" });

const token = applyGhTokenToEnv();
if (!token) {
  console.error("\nНемає GH_TOKEN. Створіть tools/.gh-token (див. tools/.gh-token.example)\n");
  process.exit(1);
}

execSync("node tools/upload-github-release.mjs", { cwd: root, stdio: "inherit" });

const tag = `v${pkg.version}`;
console.log(`\n✓ Оновлення ${pkg.version} на GitHub (ПК + телефон).`);
console.log("  ПК: при запуску гри — автооновлення з GitHub Releases.");
console.log("  Android: OTA при запуску (Capgo); APK — якщо зібрано.");
console.log(`  https://github.com/SHIFTER333/DRONEHUNTER/releases/tag/${tag}\n`);
