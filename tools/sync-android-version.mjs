import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkgPath = path.join(root, "package.json");
const gradlePath = path.join(root, "android", "app", "build.gradle");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const m = String(pkg.version).match(/^(\d+)\.(\d+)\.(\d+)/);
if (!m) throw new Error(`Unsupported version format: ${pkg.version}`);

const major = Number(m[1]);
const minor = Number(m[2]);
const patch = Number(m[3]);
const versionCode = major * 1000 + minor * 100 + patch;
const versionName = `${major}.${minor}.${patch}`;

let gradle = fs.readFileSync(gradlePath, "utf8");
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
fs.writeFileSync(gradlePath, gradle, "utf8");

console.log(`[android-version] ${versionName} (${versionCode}) synced to android/app/build.gradle`);
