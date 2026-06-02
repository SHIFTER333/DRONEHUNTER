import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const src = path.join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const outDir = path.join(root, "dist-android");
const dest = path.join(outDir, `DRONEHUNTERS-Android-${pkg.version}.apk`);

if (!fs.existsSync(src)) {
  console.error("APK не знайдено. Спочатку: npm run android:build");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, dest);
const mb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
console.log(`\n✓ ${dest} (${mb} MB)\n`);
