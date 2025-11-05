# Wölfleder Türen & Tore Kalkulator

Eine moderne Progressive Web App für die Kalkulation von Türen und Toren.

## Features

- 📱 PWA - Installierbar auf iOS und Android
- 🔄 Offline-fähig
- 💾 Lokale Datenspeicherung
- 📊 Echtzeit-Kalkulation
- 🎨 Modernes, responsives Design

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Öffnet die App auf `http://localhost:3000`

## Build

```bash
npm run build
```

Erstellt eine produktionsreife Version im `dist/` Ordner.

## Projektstruktur

```
├── public/           # Statische Dateien
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── js/          # JavaScript Module
│   │   ├── models/
│   │   ├── services/
│   │   ├── components/
│   │   └── views/
│   └── css/         # Stylesheets
└── package.json
```

## Technologien

- Vanilla JavaScript (ES6 Modules)
- CSS3 mit Custom Properties
- Service Worker für PWA
- Local Storage API
