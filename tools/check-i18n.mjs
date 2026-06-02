import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const i18nStart = html.indexOf("const I18N = {");
const i18nEnd = html.indexOf("\n    };", i18nStart) + 6;
const block = html.slice(i18nStart, i18nEnd);
function extractLang(lang) {
  const re = new RegExp(`\\n\\s+${lang}:\\s*\\{`);
  const m = block.match(re);
  if (!m) return {};
  let start = m.index + m[0].length;
  let depth = 1;
  let i = start;
  while (i < block.length && depth > 0) {
    if (block[i] === "{") depth++;
    else if (block[i] === "}") depth--;
    i++;
  }
  const sub = block.slice(start, i - 1);
  const out = {};
  for (const mm of sub.matchAll(/^\s+(\w+):\s*"((?:[^"\\]|\\.)*)"/gm)) out[mm[1]] = mm[2];
  return out;
}
const uk = extractLang("uk");
const en = extractLang("en");
const ru = extractLang("ru");
console.log("uk", Object.keys(uk).length, "en", Object.keys(en).length, "ru", Object.keys(ru).length);
const missRu = Object.keys(uk).filter((k) => !ru[k]);
const missEn = Object.keys(uk).filter((k) => !en[k]);
console.log("missing ru", missRu.length, "missing en", missEn.length);
console.log("missing ru keys:", missRu.join(", "));
