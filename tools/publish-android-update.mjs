/**
 * Підготовка файлів Android-оновлення для GitHub Release.
 *   npm run android:publish
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

execSync("npm run android:prepare", { cwd: root, stdio: "inherit" });
execSync("npm run android:bundle", { cwd: root, stdio: "inherit" });

const zip = path.join(root, "dist-android", `android-www-${pkg.version}.zip`);
const manifest = path.join(root, "assets", "android-latest.json");

console.log("\nЗавантажте на GitHub Release v" + pkg.version + ":");
console.log("  • android-latest.json  →", manifest);
if (fs.existsSync(zip)) console.log("  •", path.basename(zip));
console.log("  • DRONEHUNTERS-Android-" + pkg.version + ".apk (збірка Android Studio)");
console.log("\nПісля завантаження гравці отримають OTA при наступному запуску.\n");
