/**
 * Перевірка збірки перед релізом.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const outDir = path.join(root, "dist-installer");
const setupPath = path.join(outDir, `DRONEHUNTERS-Setup-${version}-x64.exe`);
const latestYml = path.join(outDir, "latest.yml");
const embeddedYml = path.join(outDir, "win-unpacked", "resources", "latest.yml");
const appUpdateYml = path.join(outDir, "win-unpacked", "resources", "app-update.yml");

let ok = true;
function check(cond, msg) {
  if (!cond) { console.error(`✗ ${msg}`); ok = false; }
  else console.log(`✓ ${msg}`);
}

console.log(`\nПеревірка DRONEHUNTERS ${version}\n`);

check(fs.existsSync(setupPath), `Setup.exe існує (${setupPath})`);
if (fs.existsSync(setupPath)) {
  const mb = (fs.statSync(setupPath).size / 1024 / 1024).toFixed(1);
  check(fs.statSync(setupPath).size > 10_000_000, `Setup.exe розмір OK (${mb} MB)`);
}

check(fs.existsSync(latestYml), "latest.yml для GitHub");
check(fs.existsSync(embeddedYml), "latest.yml вбудовано в resources/");
check(fs.existsSync(appUpdateYml), "app-update.yml (GitHub updater)");

if (fs.existsSync(latestYml)) {
  const yml = fs.readFileSync(latestYml, "utf8");
  check(yml.includes(`version: ${version}`), `latest.yml версія ${version}`);
  check(yml.includes(`DRONEHUNTERS-Setup-${version}-x64.exe`), "latest.yml посилається на Setup.exe");
}

if (fs.existsSync(appUpdateYml)) {
  const yml = fs.readFileSync(appUpdateYml, "utf8");
  check(yml.includes("provider: github"), "app-update.yml provider github");
  check(yml.includes("owner: SHIFTER333"), "app-update.yml owner");
  check(yml.includes("repo: DRONEHUNTER"), "app-update.yml repo");
}

console.log(ok ? "\n✓ Збірка готова до релізу\n" : "\n✗ Є проблеми — перезберіть: npm run dist\n");
process.exit(ok ? 0 : 1);
