/** Fill missing ru I18N keys from en with Russian translations. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "index.html");
let html = fs.readFileSync(file, "utf8");

const RU_EXTRA = {
  menu_side_label: "Сторона",
  side_defense: "Оборона",
  side_offense: "Наступление",
  side_offense_wip: "в разработке",
  side_hint_defense: "Защита городов Украины от волн БПЛА и ракет.",
  side_hint_offense: "Удары по РФ: заводы, аэродромы, логистика, уничтожение городов и заводов врага.",
  side_hint_offense_wip: "Режим наступления в разработке — пока доступна только оборона.",
  log_offense_disabled: "Режим наступления ещё в разработке.",
  log_offense_shop_wip: "Логистика и операции (склад) ещё в разработке.",
  upgrade_ammo_next: "+40 (ур. {lvl})",
  upgrade_accuracy_next: "+{pct}% точность",
  upgrade_range_next: "+{px} радиус",
  upgrade_reload_next: "−{pct}% КД",
  log_upgrade_ammo: "Боеприпасы: уровень {lvl}/3. Цена: {cost}.",
  log_upgrade_accuracy: "Точность: уровень {lvl}/3. Цена: {cost}.",
  log_upgrade_range: "Радиус: уровень {lvl}/3. Цена: {cost}.",
  log_upgrade_reload: "КД: уровень {lvl}/3. Цена: {cost}.",
  log_upgrade_no_money: "Недостаточно бюджета ({cost}).",
  info_title: "Инфо центр",
  info_body: "1) Откройте магазин, купите технику, затем ЛКМ на карте для установки.\n2) Запускайте волны кнопкой «Запустить волну сейчас».\n3) Дешёвые пикапы сбивают реже: максимум одно полное уничтожение раз в 3 секунды.\n4) Ракетные ПВО (ППО/Бук/С-300/Patriot/ABM) перехватывают «Х-101».\n5) «Х-101» с 6-й волны. «Гербера» летит в стаях с «Шахедами».\n6) Перегруженное ПВО может пропускать цели.\n7) Грузовик снабжения: выберите его, подъедьте в радиус, кликните по союзной технике.\n8) Вертолёт: заправка на аэродроме ПВО.\n9) Не допускайте прорывов (в обычном/хард режимах).\n10) Выберите технику на карте — панель улучшений: боеприпасы, точность, радиус, КД.",
  panel_admin_spawn: "ADMIN: СПАВН 100 Шахедов + 5 Х-101",
  map_russia: "РОССИЯ · ЗАПАД / ЦЕНТР",
  log_offense_built: "Построено: {label}. Бюджет: {money}",
  log_supply_too_far: "Машина далеко от завода.",
  log_supply_empty: "На заводе нет готовой продукции.",
  log_supply_dispatched: "Отправлено {n} ед. ({kind}) на аэродром.",
  log_supply_delivered: "Поставка доставлена на аэродром.",
  cargo_drones: "дронов",
  cargo_missiles: "ракет",
  log_airfield_no_drones: "На аэродроме нет БПЛА — доставьте с завода.",
  log_airfield_no_missiles: "На аэродроме нет ракет.",
  log_flamingo_empty: "Пусковая «Фламинго» пуста (макс. 2).",
  log_strike_launch: "Пуск {unit} → {target}",
  log_su24_busy: "Су-24М уже в небе с этого аэродрома.",
  log_su24_scramble: "Су-24М взлетает — в крейсерском режиме выберите цель для Storm Shadow.",
  log_storm_launch: "Storm Shadow по {target}",
  log_recon_launch: "Разведка: {unit}",
  news_target_destroyed: "Уничтожен объект: {name}",
  news_offense_victory: "Стратегические города уничтожены — операция успешна.",
  log_offense_victory: "Победа в режиме наступления.",
  hud_offense_destroyed: "Уничтожено целей",
  offense_shop_title: "Операция наступления",
  offense_shop_hint: "Заводы → логистика → аэродром. Ударные БПЛА только с аэродрома.",
  shop_sec_offense_logistics: "Логистика и производство",
  shop_sec_offense_ops: "Операции (склад + наводка)",
  btn_return_ukraine: "Вернуться в Украину",
  log_return_ukraine: "Карта: фокус на Украину.",
  menu_blurb_offense: "Наступление: карта РФ, ПВО врага, заводы, логистика и ударный арсенал.",
  log_offense_need_airfield: "Сначала выберите аэродром на карте.",
  log_offense_pick_target: "Кликните по городу или заводу врага.",
  log_offense_supply_factory: "Клик по заводу — загрузить машину (до 10 дронов или 3 ракет).",
  panel_launch: "Удар / разведка",
  panel_launch_hint: "магазин → аэродром → цель",
  log_admin_on: "ADMIN-режим включён: безлимит ресурсов/патронов + чит-спавн.",
  log_admin_off: "ADMIN-режим выключен.",
  log_admin_spawn: "ADMIN-спавн выполнен: +100 Шахедов и +5 Х-101.",
  log_admin_need_map: "ADMIN-спавн недоступен: карта ещё загружается.",
  offense_site_drone_factory: "Завод дронов",
  offense_site_missile_factory: "Завод ракет",
  offense_site_airfield: "Аэродром",
  offense_site_flamingo_launcher: "Пуск. «Фламинго»",
  offense_site_supply_truck: "Машина снабжения",
  shop_small_drone_factory: "Производство ударных БПЛА",
  shop_small_missile_factory: "Производство ракет для аэродрома",
  shop_small_airfield: "Пуск ударных БПЛА и «Сапсан»",
  shop_small_flamingo_launcher: "До 2 ракет «Фламинго» на установке",
  shop_small_supply_truck: "До 10 дронов или 3 ракет за рейс",
  shop_su24_storm: "Су-24М + Storm Shadow",
  shop_deploy_sapsan: "Развернуть Сапсан",
  shop_small_deploy_sapsan: "Со склада ракетного завода",
  shop_sapsan_aim: "Навести Сапсан",
  shop_small_sapsan_aim: "Клик по карте — точка удара",
  strike_lyutiy: "Лютый",
  strike_bobr: "UJ-26 «Бобёр»",
  strike_morok: "Морок",
  log_offense_too_close: "Слишком близко к другому объекту — увеличьте дистанцию.",
  log_offense_need_targeting: "Нужна наводка: разведка → обнаружение → создать наводку.",
  log_offense_no_su24_sortie: "На аэродроме нет готового вылета Су-24 — доставьте с завода.",
  log_offense_need_su24_missile: "Нужна хотя бы 1 ракета на аэродроме для Су-24.",
  log_offense_su24_missiles_exhausted: "Ракеты на борту исчерпаны (max 2).",
  log_offense_no_recon_drones: "На аэродроме нет разведывательных БПЛА — завод → грузовик → аэродром.",
  log_offense_no_sapsan_stock: "На заводе нет готовой пусковой Сапсан.",
  log_offense_sapsan_deployed: "Пусковая Сапсан развёрнута — перетащите ЛКМ, затем «Навести Сапсан».",
  log_offense_sapsan_aim_first: "Сначала наведите Сапсан на цель.",
  log_offense_sapsan_launch: "Сапсан — пуск!",
  log_offense_sapsan_factory_click: "Клик по ракетному заводу для развёртывания Сапсан.",
  log_offense_sapsan_select: "Выберите пусковую Сапсан на карте.",
  log_offense_sapsan_aim_set: "Точка удара Сапсан задана — ПКМ или кнопка пуска.",
  log_offense_place_ukraine: "Логистику и заводы ставят только на территории Украины.",
  log_offense_pick_airfield: "Выберите аэродром на карте.",
  log_offense_pick_airfield_recon: "Выберите аэродром, затем запуск разведки.",
  log_offense_click_missile_factory: "Клик по ракетному заводу.",
  log_offense_sapsan_aim_click: "Клик — точка удара для выбранной Сапсан.",
  log_offense_pick_storm_target: "Выберите цель с наводкой (Су-24 в крейсере).",
  log_su24_scramble_missiles: "Су-24М взлетает — ракет: {n}/{max}.",
  log_geo_load_fail: "Ошибка загрузки геоданных.",
  log_sapsan_aim_no_money: "Недостаточно средств для наводки.",
  hud_control: "Управление",
  intel_panel_aria: "Цели разведки",
  control_recon: "Разведка",
  control_uav: "БПЛА",
  control_su24: "Су-24М",
  offense_site_sapsan: "Сапсан",
  offense_site_flamingo_missile: "Фламинго"
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

mergeLang("ru", RU_EXTRA);

html = html.replace(
  /if \(_ls === "en"\) gameLang = "en";\s*else gameLang = "uk";/,
  `if (_ls === "en") gameLang = "en";\n      else if (_ls === "ru") gameLang = "ru";\n      else gameLang = "uk";`
);

html = html.replace(
  /gameLang = code === "en" \? "en" : "uk";/,
  `gameLang = code === "en" ? "en" : code === "ru" ? "ru" : "uk";`
);

html = html.replace(
  /document\.documentElement\.lang = gameLang === "uk" \? "uk" : "en";/,
  `document.documentElement.lang = gameLang === "uk" ? "uk" : gameLang === "ru" ? "ru" : "en";`
);

html = html.replace(
  /function newsLocale\(\) \{\s*return gameLang === "uk" \? "uk-UA" : "en-US";\s*\}/,
  `function newsLocale() {
      if (gameLang === "uk") return "uk-UA";
      if (gameLang === "ru") return "ru-RU";
      return "en-US";
    }`
);

html = html.replace(
  /let s = \(I18N\[gameLang\] && I18N\[gameLang\]\[key\]\) \|\| I18N\.uk\[key\] \|\| key;/,
  `let s = (I18N[gameLang] && I18N[gameLang][key]) || (gameLang === "en" && I18N.en[key]) || (gameLang === "ru" && I18N.ru[key]) || (gameLang !== "uk" ? null : I18N.uk[key]) || key;`
);

fs.writeFileSync(file, html, "utf8");
console.log("Filled ru I18N and lang support in", file);
