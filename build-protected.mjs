/**
 * Збирає index.protected.html: той самий HTML/CSS, JS пропущено через obfuscator.
 * Оригінальний index.html не змінюється. Це не «шифрування»: логіку з браузера
 * теоретично можна відновити, але читати й копіювати важче.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import JavaScriptObfuscator from "javascript-obfuscator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "index.html");
const outPath = path.join(__dirname, "index.protected.html");

const html = fs.readFileSync(htmlPath, "utf8");
const open = "<script>";
const close = "</script>";
const start = html.indexOf(open);
const end = html.indexOf(close, start);
if (start === -1 || end === -1) {
  console.error("Не знайдено тега <script> у index.html");
  process.exit(1);
}

const before = html.slice(0, start + open.length);
const js = html.slice(start + open.length, end);
const after = html.slice(end);

const obfuscationResult = JavaScriptObfuscator.obfuscate(js, {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 4,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.85,
  transformObjectKeys: false,
  unicodeEscapeSequence: false
});

const obfuscatedCode = obfuscationResult.getObfuscatedCode();
fs.writeFileSync(outPath, `${before}\n${obfuscatedCode}\n${after}`, "utf8");
console.log("OK:", outPath);
console.log("Діліться index.protected.html; index.html лишайте собі для правок.");
