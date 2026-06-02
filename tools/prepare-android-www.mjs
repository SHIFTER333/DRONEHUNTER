/**
 * Копіює веб-ресурси гри в www/ для Capacitor Android.
 *   npm run android:prepare
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const www = path.join(root, "www");

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyGlobFiles(dir, pattern, destDir) {
  if (!fs.existsSync(dir)) return;
  const re = new RegExp(pattern);
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    if (re.test(name)) fs.copyFileSync(path.join(dir, name), path.join(destDir, name));
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;

rmDir(www);
fs.mkdirSync(www, { recursive: true });

copyFile(path.join(root, "index.html"), path.join(www, "index.html"));
copyGlobFiles(root, /\.png$/i, www);

for (const folder of ["МОДЕЛЬКИ", "ЗВУКИ", "assets"]) {
  copyDir(path.join(root, folder), path.join(www, folder));
}

const leafletSrc = path.join(root, "node_modules", "leaflet", "dist");
const leafletDest = path.join(www, "node_modules", "leaflet", "dist");
copyDir(leafletSrc, leafletDest);

copyDir(path.join(root, "js"), path.join(www, "js"));

const androidLatest = {
  version,
  bundleUrl: `https://github.com/SHIFTER333/DRONEHUNTER/releases/download/v${version}/android-www-${version}.zip`,
  apkUrl: `https://github.com/SHIFTER333/DRONEHUNTER/releases/download/v${version}/DRONEHUNTERS-Android-${version}.apk`,
  manifestUrl:
    "https://github.com/SHIFTER333/DRONEHUNTER/releases/latest/download/android-latest.json"
};

fs.writeFileSync(
  path.join(www, "assets", "android-latest.json"),
  `${JSON.stringify(androidLatest, null, 2)}\n`,
  "utf8"
);

fs.writeFileSync(
  path.join(root, "assets", "android-latest.json"),
  `${JSON.stringify(androidLatest, null, 2)}\n`,
  "utf8"
);

const tilesSrc = path.join(root, "assets", "map-tiles");
if (fs.existsSync(tilesSrc)) {
  const count = fs.readdirSync(tilesSrc, { recursive: true }).length;
  if (count > 0) {
    copyDir(tilesSrc, path.join(www, "assets", "map-tiles"));
    console.log("  map-tiles: copied");
  } else {
    console.warn("  map-tiles: empty — run npm run fetch-map-tiles before release");
  }
} else {
  console.warn("  map-tiles: missing — run npm run fetch-map-tiles before release");
}

console.log(`\n✓ www/ prepared (v${version})\n`);
