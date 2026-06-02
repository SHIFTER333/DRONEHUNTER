/**
 * ZIP-архів www/ для OTA-оновлень Android (Capgo).
 *   npm run android:bundle
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const www = path.join(root, "www");
const outDir = path.join(root, "dist-android");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const zipName = `android-www-${version}.zip`;
const zipPath = path.join(outDir, zipName);

if (!fs.existsSync(www)) {
  console.error("Спочатку: npm run android:prepare");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

const isWin = process.platform === "win32";
if (isWin) {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${www.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`,
    { stdio: "inherit", cwd: root }
  );
} else {
  execSync(`cd "${www}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
}

console.log(`\n✓ ${zipPath}\n`);
