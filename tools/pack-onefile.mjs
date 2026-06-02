import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const DIST_DIR = path.join(ROOT, "dist-installer");
const OUT_DIR = path.join(ROOT, "release");

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function listExeCandidates(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith(".exe"))
    .map((n) => path.join(dir, n))
    .filter(isFile);
}

function newestByMtime(files) {
  let best = null;
  let bestMtime = -Infinity;
  for (const f of files) {
    const st = fs.statSync(f);
    const mt = st.mtimeMs || 0;
    if (mt > bestMtime) {
      bestMtime = mt;
      best = f;
    }
  }
  return best;
}

const exes = listExeCandidates(DIST_DIR);
if (exes.length === 0) {
  console.error(`No .exe found in: ${DIST_DIR}`);
  process.exit(1);
}

const setupExes = exes.filter((p) => /setup/i.test(path.basename(p)));
const picked = setupExes.length
  ? newestByMtime(setupExes)
  : newestByMtime(exes);
const outName = path.basename(picked);
fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, outName);
fs.copyFileSync(picked, outPath);

console.log(`Packed one-file installer: ${outPath}`);

