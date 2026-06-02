/**
 * Build-time: download bundled offline map tiles (Ukraine + offense Russia).
 * Source: CARTO Voyager (OSM). Run: npm run fetch-map-tiles
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "assets", "map-tiles");

/** Ukraine + western/central Russia (offense mode) */
const BBOX = { minLon: 21.8, maxLon: 41.2, minLat: 44.2, maxLat: 56.5 };
const ZOOM_MIN = 6;
const ZOOM_MAX = 10;
const TILE_URL = "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const DELAY_MS = 80;
const MAX_RETRIES = 2;

function lon2tileX(lon, z) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, z));
}
function lat2tileY(lat, z) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z)
  );
}

function tileRange(bbox, z) {
  const xMin = lon2tileX(bbox.minLon, z);
  const xMax = lon2tileX(bbox.maxLon, z);
  const yMin = lat2tileY(bbox.maxLat, z);
  const yMax = lat2tileY(bbox.minLat, z);
  return { xMin, xMax, yMin, yMax };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadTile(z, x, y) {
  const dir = path.join(outDir, String(z), String(x));
  const file = path.join(dir, `${y}.png`);
  if (fs.existsSync(file)) return "skip";
  fs.mkdirSync(dir, { recursive: true });
  const url = TILE_URL.replace("{z}", z).replace("{x}", x).replace("{y}", y);
  let lastStatus = 0;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "PVOFALL-tile-fetch/1.0 (build-time only)" }
      });
      lastStatus = res.status;
      if (!res.ok) {
        if (attempt < MAX_RETRIES) {
          await sleep(400);
          continue;
        }
        return `fail ${res.status}`;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(file, buf);
      return "ok";
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        await sleep(400);
        continue;
      }
      return `fail ${e.message}`;
    }
  }
  return `fail ${lastStatus}`;
}

function writeEmptyTile() {
  const emptyPath = path.join(outDir, "empty.png");
  if (fs.existsSync(emptyPath)) return;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(emptyPath, png);
}

function countTiles(bbox) {
  let n = 0;
  for (let z = ZOOM_MIN; z <= ZOOM_MAX; z++) {
    const { xMin, xMax, yMin, yMax } = tileRange(bbox, z);
    n += (xMax - xMin + 1) * (yMax - yMin + 1);
  }
  return n;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  writeEmptyTile();
  const total = countTiles(BBOX);
  console.log(`Tiles to fetch (z${ZOOM_MIN}–${ZOOM_MAX}): ~${total}`);
  let ok = 0;
  let skip = 0;
  let fail = 0;
  for (let z = ZOOM_MIN; z <= ZOOM_MAX; z++) {
    const { xMin, xMax, yMin, yMax } = tileRange(BBOX, z);
    console.log(`Zoom ${z}: x ${xMin}-${xMax}, y ${yMin}-${yMax}`);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const r = await downloadTile(z, x, y);
        if (r === "ok") ok++;
        else if (r === "skip") skip++;
        else {
          fail++;
          if (fail <= 8) console.warn(`  ${z}/${x}/${y}: ${r}`);
        }
        await sleep(DELAY_MS);
      }
    }
  }
  console.log(`Done: ${ok} downloaded, ${skip} skipped, ${fail} failed → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
