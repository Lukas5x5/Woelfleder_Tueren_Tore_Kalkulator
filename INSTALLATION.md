# Installation & Start-Anleitung

## Voraussetzungen

- **Node.js** (Version 16 oder höher) - Download: https://nodejs.org/

## Schritt 1: Abhängigkeiten installieren

Öffnen Sie ein Terminal/Kommandozeile im Projektordner und führen Sie aus:

```bash
npm install
```

Dies installiert Vite als Build-Tool.

## Schritt 2: Development-Server starten

```bash
npm run dev
```

Die App öffnet sich automatisch im Browser unter `http://localhost:3000`

## Schritt 3: Für Produktion bauen

```bash
npm run build
```

Dies erstellt optimierte Dateien im `dist/` Ordner.

## Schritt 4: Produktions-Build testen

```bash
npm run preview
```

## iPhone Installation

### Variante A: Über Safari (empfohlen)

1. Öffnen Sie die App in Safari auf Ihrem iPhone
2. Tippen Sie auf das "Teilen"-Symbol (□↑)
3. Scrollen Sie runter und wählen Sie "Zum Home-Bildschirm"
4. Bestätigen Sie mit "Hinzufügen"
5. Die App erscheint als Icon auf Ihrem Home-Bildschirm

### Variante B: Über einen Webserver

Wenn Sie die App auf einem Server hosten möchten:

1. Laden Sie den `dist/` Ordner auf Ihren Webserver hoch
2. Öffnen Sie die URL in Safari auf dem iPhone
3. Folgen Sie den Schritten aus Variante A

### Wichtig für iOS:

- Verwenden Sie **Safari** (nicht Chrome oder Firefox)
- Die App benötigt **HTTPS** für volle PWA-Funktionalität
- Für lokales Testen können Sie `http://localhost` verwenden

## Icons hinzufügen

Die App benötigt Icons für das beste Erlebnis:

1. Erstellen Sie ein quadratisches Logo (empfohlen: 512x512px)
2. Nutzen Sie einen Icon-Generator wie:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
3. Laden Sie die generierten Icons in `public/icons/` hoch

## Datenstruktur

Alle Daten werden lokal im Browser gespeichert (LocalStorage). Keine Server-Verbindung erforderlich!

**Wichtig:** Löschen Sie nicht Ihre Browser-Daten, sonst gehen die gespeicherten Kunden verloren.

## Troubleshooting

### Problem: "npm nicht gefunden"
**Lösung:** Installieren Sie Node.js von https://nodejs.org/

### Problem: Port 3000 ist bereits belegt
**Lösung:** Ändern Sie in `vite.config.js` den Port:
```javascript
server: {
  port: 3001  // Andere Portnummer
}
```

### Problem: Service Worker wird nicht registriert
**Lösung:** Service Worker funktionieren nur über HTTPS oder localhost

### Problem: App wird auf iPhone nicht installierbar
**Lösung:**
- Verwenden Sie Safari (nicht Chrome)
- Stellen Sie sicher, dass manifest.json korrekt ist
- Icons müssen vorhanden sein

## Projekt-Struktur

```
woelfleder-app/
├── public/              # Statische Dateien
│   ├── index.html       # Haupt-HTML
│   ├── manifest.json    # PWA Manifest
│   ├── service-worker.js
│   └── icons/           # App-Icons
├── src/
│   ├── css/             # Stylesheets (modular)
│   └── js/              # JavaScript Module
│       ├── app.js       # Einstiegspunkt
│       ├── config/      # Konfiguration
│       ├── models/      # Datenmodelle
│       ├── services/    # Business-Logik
│       ├── utils/       # Hilfsfunktionen
│       ├── state/       # State Management
│       ├── components/  # UI-Komponenten
│       ├── views/       # Seiten/Views
│       └── data/        # Produktdaten
├── package.json
├── vite.config.js
└── README.md
```

## Weitere Hilfe

Bei Fragen oder Problemen:
1. Überprüfen Sie die Browser-Konsole (F12)
2. Schauen Sie in die README.md
3. Kontaktieren Sie den Entwickler

## Nächste Schritte

1. ✅ App starten und testen
2. ✅ Icons hinzufügen (siehe `public/icons/README.md`)
3. ✅ Auf iPhone installieren
4. ✅ Produktdaten ggf. anpassen (siehe `src/js/data/products.js`)

Viel Erfolg! 🚀
