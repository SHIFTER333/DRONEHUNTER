/**
 * Двокрокова збірка:
 * 1) Збираємо гру + перший Setup.exe + latest.yml
 * 2) Кладемо latest.yml у resources/ і перезбираємо NSIS —
 *    після встановлення latest.yml лежить поруч з app-update.yml
 *
 * На GitHub latest.yml все одно потрібен окремим файлом релізу (для electron-updater).
 * Гравцям достатньо лише Setup.exe.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const versionJsonPath = path.join(root, "assets", "version.json");
fs.mkdirSync(path.dirname(versionJsonPath), { recursive: true });
fs.writeFileSync(versionJsonPath, `${JSON.stringify({ version: pkg.version }, null, 2)}\n`, "utf8");
console.log(`\n✓ assets/version.json → ${pkg.version}`);
const androidLatestPath = path.join(root, "assets", "android-latest.json");
const androidLatest = {
  version: pkg.version,
  bundleUrl: `https://github.com/SHIFTER333/DRONEHUNTER/releases/download/v${pkg.version}/android-www-${pkg.version}.zip`,
  apkUrl: `https://github.com/SHIFTER333/DRONEHUNTER/releases/download/v${pkg.version}/DRONEHUNTERS-Android-${pkg.version}.apk`,
  manifestUrl:
    "https://github.com/SHIFTER333/DRONEHUNTER/releases/latest/download/android-latest.json"
};
fs.writeFileSync(androidLatestPath, `${JSON.stringify(androidLatest, null, 2)}\n`, "utf8");
console.log(`✓ assets/android-latest.json → ${pkg.version}`);
const publish = process.argv.includes("--publish");
const outDir = path.join(root, "dist-installer");
const unpackedDir = path.join(outDir, "win-unpacked");
const latestYml = path.join(outDir, "latest.yml");
const builderBase =
  "cross-env CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --win";
const builderEnv = { ...process.env };

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit", env: builderEnv });
}

console.log("\n[1/2] Збірка гри та першого інсталятора…");
run(`${builderBase} --publish never`);

if (!fs.existsSync(latestYml)) {
  console.error("\nНе знайдено latest.yml після збірки.");
  process.exit(1);
}
if (!fs.existsSync(unpackedDir)) {
  console.error("\nНе знайдено win-unpacked після збірки.");
  process.exit(1);
}

const resourcesDir = path.join(unpackedDir, "resources");
fs.mkdirSync(resourcesDir, { recursive: true });
fs.copyFileSync(latestYml, path.join(resourcesDir, "latest.yml"));
console.log("\n[2/2] latest.yml вбудовано в resources — перезбірка NSIS…");

run(`${builderBase} --prepackaged "${unpackedDir}" --publish ${publish ? "always" : "never"}`);

if (!fs.existsSync(latestYml)) {
  console.error("\nНе знайдено latest.yml після перезбірки.");
  process.exit(1);
}

// Фінальний latest.yml → знову в resources і остання перезбірка NSIS (швидко)
fs.copyFileSync(latestYml, path.join(resourcesDir, "latest.yml"));
console.log("\n[3/3] Актуальний latest.yml в resources — фінальний інсталятор…");
run(`${builderBase} --prepackaged "${unpackedDir}" --publish ${publish ? "always" : "never"}`);

if (!fs.existsSync(latestYml)) {
  console.error("\nНе знайдено latest.yml після фінальної збірки.");
  process.exit(1);
}

const setupName = `DRONEHUNTERS-Setup-${pkg.version}-x64.exe`;
console.log(`\n✓ Готово: ${path.join(outDir, setupName)}`);
console.log("  latest.yml всередині інсталятора (resources/) + у dist-installer/ для GitHub\n");
