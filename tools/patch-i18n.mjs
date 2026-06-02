/** One-off patch: complete uk/en I18N and fix setLang. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "index.html");
let html = fs.readFileSync(file, "utf8");

const EXTRA_UK = {
  offense_site_drone_factory: "Завод дронів",
  offense_site_missile_factory: "Завод ракет",
  offense_site_airfield: "Аеродром",
  offense_site_flamingo_launcher: "Пуск. «Фламінго»",
  offense_site_supply_truck: "Машина постачання",
  shop_small_drone_factory: "Виробництво ударних БПЛА",
  shop_small_missile_factory: "Виробництво ракет для аеродрому",
  shop_small_airfield: "Пуск ударних БПЛА та «Сапсан»",
  shop_small_flamingo_launcher: "До 2 ракет «Фламінго» на установці",
  shop_small_supply_truck: "До 10 дронів або 3 ракет за рейс",
  shop_su24_storm: "Су-24М + Storm Shadow",
  shop_deploy_sapsan: "Розгорнути Сапсан",
  shop_small_deploy_sapsan: "Зі складу ракетного заводу",
  shop_sapsan_aim: "Навести Сапсан",
  shop_small_sapsan_aim: "Клік по карті — точка удару",
  strike_lyutiy: "Лютый",
  strike_bobr: "UJ-26 «Бобёр»",
  strike_morok: "Морок",
  log_offense_too_close: "Занадто близько до іншого об'єкта — збільш відстань.",
  log_offense_need_targeting: "Потрібна наводка: розвідка → виявлення → створити наводку.",
  log_offense_no_su24_sortie: "На аеродромі немає готового сортування Су-24 — доставте з заводу.",
  log_offense_need_su24_missile: "Потрібна хоча б 1 ракета на аеродромі для Су-24.",
  log_offense_su24_missiles_exhausted: "Ракети на борту вичерпано (max 2).",
  log_offense_no_recon_drones: "На аеродромі немає розвідувальних БПЛА — завод → вантажівка → аеродром.",
  log_offense_no_sapsan_stock: "На заводі немає готової пускової Сапсан.",
  log_offense_sapsan_deployed: "Пускову Сапсан розгорнуто — перетягніть ЛКМ, потім «Навести Сапсан».",
  log_offense_sapsan_aim_first: "Спочатку наведіть Сапсан на ціль.",
  log_offense_sapsan_launch: "Сапсан — пуск!",
  log_offense_sapsan_factory_click: "Клік по ракетному заводу для розгортання Сапсан.",
  log_offense_sapsan_select: "Оберіть пускову Сапсан на карті.",
  log_offense_sapsan_aim_set: "Точку удару Сапсан задано — ПКМ або кнопка пуску.",
  log_offense_place_ukraine: "Логістику та заводи ставлять лише на території України.",
  log_offense_pick_airfield: "Оберіть аеродром на карті.",
  log_offense_pick_airfield_recon: "Оберіть аеродром, потім запуск розвідки.",
  log_offense_click_missile_factory: "Клік по ракетному заводу.",
  log_offense_sapsan_aim_click: "Клік — точка удару для обраної Сапсан.",
  log_offense_pick_storm_target: "Оберіть ціль з наводкою (Су-24 у крейсері).",
  log_su24_scramble_missiles: "Су-24М злітає — ракет: {n}/{max}.",
  log_geo_load_fail: "Помилка завантаження геоданих.",
  log_sapsan_aim_no_money: "Недостатньо коштів для наводки.",
  hud_control: "Керування",
  intel_panel_aria: "Цілі розвідки",
  control_recon: "Розвідка",
  control_uav: "БПЛА",
  control_su24: "Су-24М"
};

const EXTRA_EN = {
  menu_side_label: "Side",
  side_defense: "Defense",
  side_offense: "Offensive",
  side_offense_wip: "in development",
  side_hint_defense: "Defend Ukrainian cities from UAV and missile waves.",
  side_hint_offense: "Strike Russia: factories, airfields, logistics, destroy enemy cities and plants.",
  side_hint_offense_wip: "Offensive mode is in active development — defense only for now.",
  log_offense_disabled: "Offensive mode is still in development.",
  log_offense_shop_wip: "Logistics and operations (warehouse) are still in development.",
  map_russia: "RUSSIA · WEST / CENTRE",
  log_offense_built: "Built: {label}. Budget: {money}.",
  log_supply_too_far: "Truck is too far from the factory.",
  log_supply_empty: "Factory has no ready cargo.",
  log_supply_dispatched: "Dispatched {n} units ({kind}) to the airfield.",
  log_supply_delivered: "Supply delivered to the airfield.",
  cargo_drones: "drones",
  cargo_missiles: "missiles",
  log_airfield_no_drones: "No strike UAVs at the airfield — deliver from the factory.",
  log_airfield_no_missiles: "No missiles at the airfield.",
  log_flamingo_empty: "Flamingo launcher is empty (max 2).",
  log_strike_launch: "Launch {unit} → {target}",
  log_su24_busy: "Su-24M is already airborne from this airfield.",
  log_su24_scramble: "Su-24M scrambling — in cruise mode select a Storm Shadow target.",
  log_su24_scramble_missiles: "Su-24M scrambling — missiles: {n}/{max}.",
  log_storm_launch: "Storm Shadow on {target}",
  log_recon_launch: "Recon: {unit}",
  news_target_destroyed: "Target destroyed: {name}",
  news_offense_victory: "Strategic cities destroyed — operation successful.",
  log_offense_victory: "Victory in offensive mode.",
  hud_offense_destroyed: "Targets destroyed",
  offense_shop_title: "Offensive operation",
  offense_shop_hint: "Factories → logistics → airfield. Strike UAVs launch from airfields only.",
  shop_sec_offense_logistics: "Logistics & production",
  shop_sec_offense_ops: "Operations (warehouse & targeting)",
  btn_return_ukraine: "Return to Ukraine",
  log_return_ukraine: "Map: focus on Ukraine.",
  menu_blurb_offense: "Offensive: Russia map, enemy AD, factories, logistics and strike arsenal.",
  log_offense_need_airfield: "Select an airfield on the map first.",
  log_offense_pick_target: "Click an enemy city or factory.",
  log_offense_supply_factory: "Click a factory to load the truck (up to 10 drones or 3 missiles).",
  panel_launch: "Strike / recon",
  panel_launch_hint: "shop → airfield → target",
  offense_site_drone_factory: "Drone factory",
  offense_site_missile_factory: "Missile factory",
  offense_site_airfield: "Airfield",
  offense_site_flamingo_launcher: "Flamingo launcher",
  offense_site_supply_truck: "Supply truck",
  shop_small_drone_factory: "Strike UAV production",
  shop_small_missile_factory: "Missile production for airfields",
  shop_small_airfield: "Strike UAV and Sapsan launches",
  shop_small_flamingo_launcher: "Up to 2 Flamingo missiles per launcher",
  shop_small_supply_truck: "Up to 10 drones or 3 missiles per trip",
  shop_su24_storm: "Su-24M + Storm Shadow",
  shop_deploy_sapsan: "Deploy Sapsan",
  shop_small_deploy_sapsan: "From missile factory stock",
  shop_sapsan_aim: "Aim Sapsan",
  shop_small_sapsan_aim: "Click the map — impact point",
  strike_lyutiy: "Lyutyy",
  strike_bobr: "UJ-26 Bobr",
  strike_morok: "Morok",
  log_offense_too_close: "Too close to another site — increase distance.",
  log_offense_need_targeting: "Targeting required: recon → detection → create targeting.",
  log_offense_no_su24_sortie: "Airfield has no ready Su-24 sortie — deliver from factory.",
  log_offense_need_su24_missile: "At least 1 missile at the airfield for Su-24.",
  log_offense_su24_missiles_exhausted: "Onboard missiles exhausted (max 2).",
  log_offense_no_recon_drones: "No recon UAVs at airfield — factory → truck → airfield.",
  log_offense_no_sapsan_stock: "Missile factory has no ready Sapsan launcher.",
  log_offense_sapsan_deployed: "Sapsan launcher deployed — drag LMB, then Aim Sapsan.",
  log_offense_sapsan_aim_first: "Aim Sapsan at the target first.",
  log_offense_sapsan_launch: "Sapsan — launch!",
  log_offense_sapsan_factory_click: "Click the missile factory to deploy Sapsan.",
  log_offense_sapsan_select: "Select a Sapsan launcher on the map.",
  log_offense_sapsan_aim_set: "Sapsan impact point set — RMB or launch button.",
  log_offense_place_ukraine: "Logistics and factories can only be placed in Ukraine.",
  log_offense_pick_airfield: "Select an airfield on the map.",
  log_offense_pick_airfield_recon: "Select an airfield, then start recon.",
  log_offense_click_missile_factory: "Click the missile factory.",
  log_offense_sapsan_aim_click: "Click — impact point for selected Sapsan.",
  log_offense_pick_storm_target: "Select a targeted enemy (Su-24 in cruise).",
  log_geo_load_fail: "Failed to load geo data.",
  log_sapsan_aim_no_money: "Not enough budget for targeting.",
  hud_control: "Control",
  intel_panel_aria: "Recon targets",
  control_recon: "Recon",
  control_uav: "UAV",
  control_su24: "Su-24M"
};

function mergeLang(lang, extra) {
  const re = new RegExp(`\\n\\s+${lang}:\\s*\\{`);
  const m = html.match(re);
  if (!m) throw new Error("lang block not found: " + lang);
  const start = m.index + m[0].length;
  let depth = 1;
  let i = start;
  while (i < html.length && depth > 0) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") depth--;
    i++;
  }
  const end = i - 1;
  let block = html.slice(start, end);
  for (const [k, v] of Object.entries(extra)) {
    const esc = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const lineRe = new RegExp(`\\n\\s+${k}:\\s*"[^"]*"(,)?`);
    if (lineRe.test(block)) {
      block = block.replace(lineRe, `\n        ${k}: "${esc}"$1`);
    } else {
      block += `\n        ${k}: "${esc}",`;
    }
  }
  html = html.slice(0, start) + block + html.slice(end);
}

mergeLang("uk", EXTRA_UK);
mergeLang("en", EXTRA_EN);

html = html.replace(
  /let gameLang = "uk";\s*try \{[\s\S]*?\} catch \(e\) \{ \/\* ignore \*\/ \}/,
  `let gameLang = "uk";
    try {
      const _ls = localStorage.getItem(LANG_KEY);
      if (_ls === "en") gameLang = "en";
      else gameLang = "uk";
    } catch (e) { /* ignore */ }`
);

html = html.replace(
  /function setLang\(code\) \{\s*\/\/ Переклад[\s\S]*?if \(langRow\) langRow\.classList\.add\("hidden"\);\s*\}/,
  `function setLang(code) {
      gameLang = code === "en" ? "en" : "uk";
      try {
        localStorage.setItem(LANG_KEY, gameLang);
      } catch (e) { /* ignore */ }
      applyStaticDomI18n();
      syncTurretLabels();
      if (state.map.ready) rebuildStaticMapLayer();
      if (langRow) langRow.classList.remove("hidden");
      document.querySelectorAll(".lang-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-lang") === gameLang);
      });
    }`
);

html = html.replace(
  /function t\(key, repl\) \{\s*let s = \(I18N\[gameLang\]/,
  `function offenseCfgLabel(cfg) {
      return cfg?.labelKey ? t(cfg.labelKey) : (cfg?.label || "");
    }
    function t(key, repl) {
      let s = (I18N[gameLang]`
);

const buildTypePatch = `    const OFFENSE_BUILD_TYPES = {
      droneFactory: { cost: 180000, labelKey: "offense_site_drone_factory", prodSec: 38, maxStock: 48, maxRecon: 12, reconProdSec: 52 },
      missileFactory: { cost: 240000, labelKey: "offense_site_missile_factory", prodSec: 72, maxStock: 14, maxSapsan: 4, sapsanProdSec: 110, maxSorties: 3, sortieProdSec: 85 },
      airfield: { cost: 120000, labelKey: "offense_site_airfield", maxDrones: 30, maxMissiles: 6, maxRecon: 8, maxSorties: 2 },
      flamingoLauncher: { cost: 290000, labelKey: "offense_site_flamingo_launcher", maxMissiles: 2 },
      supplyTruck: { cost: 75000, labelKey: "offense_site_supply_truck", speed: 0.12, range: 8 }
    };
    const STRIKE_DRONE_TYPES = {
      lyutiy: { labelKey: "strike_lyutiy", cost: 42000, damage: 2, priceRef: 42000 },
      bobr: { labelKey: "strike_bobr", cost: 68000, damage: 2, priceRef: 68000 },
      morok: { labelKey: "strike_morok", cost: 92000, damage: 3, priceRef: 92000 }
    };`;

html = html.replace(
  /const OFFENSE_BUILD_TYPES = \{[\s\S]*?const STRIKE_DRONE_TYPES = \{[\s\S]*?morok: \{ label: "[^"]+", cost: 92000, damage: 3, priceRef: 92000 \}\s*\};/,
  buildTypePatch
);

fs.writeFileSync(file, html, "utf8");
console.log("Patched", file);
