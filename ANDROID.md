# DRONEHUNTERS — Android

Мобільна збірка на **Capacitor 7** (WebView + той самий `index.html`).

## Вимоги

- Node.js 18+
- [Android Studio](https://developer.android.com/studio) (SDK, JDK 17)
- Для карти офлайн: `npm run fetch-map-tiles` (перед релізом)

## Розробка

```bash
npm install
npm run android:sync
npm run android:open
```

У Android Studio: Run на емуляторі або пристрої.

## Збірка APK

```bash
npm run android:sync
cd android
gradlew.bat assembleDebug
```

Готовый APK после сборки:

```bash
npm run android:apk
```

Файл: `dist-android/DRONEHUNTERS-Android-{version}.apk`

(исходный путь Gradle: `android/app/build/outputs/apk/debug/app-debug.apk`)

Release (підписуйте в Android Studio → Build → Generate Signed Bundle/APK):

```bash
gradlew.bat assembleRelease
```

## Онлайн-оновлення

1. **OTA (швидко)** — zip веб-ресурсів без перевстановлення APK:
   - `npm run android:prepare`
   - `npm run android:bundle` → `dist-android/android-www-{version}.zip`
   - Залийте на GitHub Release разом із `android-latest.json`

2. **Повний APK** — коли змінюються нативні плагіни:
   - `DRONEHUNTERS-Android-{version}.apk` у тому ж Release

Маніфест: `android-latest.json` (поля `version`, `bundleUrl`, `apkUrl`).

Гра при старті перевіряє оновлення (Capgo Updater + fallback на APK у браузері).

## Публікація релізу Android

```bash
npm run android:prepare
npm run android:bundle
# зберіть APK у Android Studio
# завантажте android-www-*.zip, android-latest.json, APK на GitHub Release v{version}
```
