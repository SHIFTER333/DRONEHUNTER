/**
 * Збірка + GitHub Release (потрібен GH_TOKEN або gh auth login).
 *
 *   npm run release
 *
 * Або вручну:
 *   set GH_TOKEN=ghp_...
 *   npm run dist:publish
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyGhTokenToEnv } from "./load-gh-token.mjs";

applyGhTokenToEnv();

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const tag = `v${version}`;
const outDir = path.join(root, "dist-installer");
const setupName = `DRONEHUNTERS-Setup-${version}-x64.exe`;
const setupPath = path.join(outDir, setupName);
const latestYml = path.join(outDir, "latest.yml");

console.log(`\nDRONEHUNTERS ${version} → GitHub SHIFTER333/DRONEHUNTER\n`);

execSync("npm run dist", { cwd: root, stdio: "inherit", env: process.env });

if (!fs.existsSync(setupPath)) {
  console.error(`\nНе знайдено: ${setupPath}`);
  process.exit(1);
}

execSync("node tools/verify-release.mjs", { cwd: root, stdio: "inherit" });

const token = applyGhTokenToEnv();
if (token) {
  execSync("node tools/upload-github-release.mjs", { cwd: root, stdio: "inherit", env: process.env });
  console.log(`\n✓ Готово: https://github.com/SHIFTER333/DRONEHUNTER/releases/tag/${tag}\n`);
  process.exit(0);
}

try {
  execSync("gh auth status", { stdio: "pipe" });
} catch {
  console.log("\n✓ Збірка готова. Залийте на GitHub Releases (або npm run dist:publish з GH_TOKEN):");
  console.log(`  ${setupPath}`);
  if (fs.existsSync(latestYml)) console.log(`  ${latestYml}  (для GitHub; гравцям достатньо лише Setup.exe)`);
  console.log(`\n  https://github.com/SHIFTER333/DRONEHUNTER/releases/new?tag=${tag}`);
  process.exit(0);
}

try {
  execSync(`gh release view ${tag}`, { cwd: root, stdio: "pipe" });
  console.log(`\nRelease ${tag} вже існує — electron-builder міг залити файли.`);
} catch {
  execSync(
    `gh release create ${tag} "${setupPath}" "${latestYml}" --title "DRONEHUNTERS ${version}" --notes "Оновлення DRONEHUNTERS ${version}"`,
    { cwd: root, stdio: "inherit" }
  );
}

console.log(`\n✓ Готово: https://github.com/SHIFTER333/DRONEHUNTER/releases/tag/${tag}\n`);
