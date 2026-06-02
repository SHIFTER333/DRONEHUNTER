/** Generates *.data.js for file:// fallback (no fetch). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const geoDir = path.join(root, "assets", "geo");

function bundle(name, globalVar) {
  const src = path.join(geoDir, `${name}.geojson`);
  const out = path.join(geoDir, `${name}.data.js`);
  const data = JSON.parse(fs.readFileSync(src, "utf8"));
  fs.writeFileSync(out, `window.${globalVar}=${JSON.stringify(data)};\n`, "utf8");
  console.log("OK:", out);
}

bundle("regiony", "__GEO_REGIONS__");
bundle("rayony", "__GEO_DISTRICTS__");
