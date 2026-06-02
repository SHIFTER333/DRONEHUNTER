# DRONEHUNTERS

Стратегія ППО на мапі України (Electron).

## Завантаження

Остання версія: [Releases](https://github.com/SHIFTER333/DRONEHUNTER/releases)

## Розробка

```bash
npm install
npm run electron
```

## Android

Мобільна збірка (Capacitor): див. [ANDROID.md](ANDROID.md).

```bash
npm run android:sync
npm run android:open
```

## Реліз / оновлення для всіх гравців

1. Створіть `tools/.gh-token` (один рядок `ghp_...`, див. `tools/.gh-token.example`)
2. Одна команда — збірка + GitHub:

```bash
npm run update
```

Гравці з встановленою грою отримають оновлення **при наступному запуску** (автозавантаження + перезапуск).

`latest.yml` встановлюється **разом із грою** (папка `resources/`). На GitHub окремий `latest.yml` у Release потрібен, щоб інші ПК дізналися про нову версію.
