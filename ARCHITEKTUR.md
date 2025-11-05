# Architektur-Dokumentation

## Überblick

Die Wölfleder Türen & Tore Kalkulator App ist eine moderne Progressive Web Application (PWA), die vollständig modular aufgebaut ist.

## Technologie-Stack

- **Frontend:** Vanilla JavaScript (ES6 Modules)
- **Styling:** CSS3 mit Custom Properties
- **Build-Tool:** Vite
- **Storage:** LocalStorage API
- **PWA:** Service Worker, Web Manifest

## Architektur-Prinzipien

### 1. **Modulare Struktur**
Jede Funktionalität ist in separate Dateien aufgeteilt:
- Bessere Wartbarkeit
- Einfaches Testing
- Wiederverwendbare Komponenten

### 2. **State Management**
Zentrales State Management über `AppState`:
- Single Source of Truth
- Observer Pattern für Reaktivität
- Automatische Persistierung

### 3. **Separation of Concerns**
```
Models       → Datenstrukturen
Services     → Business-Logik
Components   → UI-Komponenten
Views        → Seiten-Logik
Utils        → Hilfsfunktionen
```

## Modul-Übersicht

### Core Modules

#### **app.js** - Einstiegspunkt
- Initialisiert die Anwendung
- Registriert Service Worker
- Verwaltet Rendering-Zyklus

#### **AppState** - State Management
```javascript
class AppState {
  customers: Customer[]
  currentCustomer: Customer | null
  currentGate: Gate | null
  view: string
  activeTab: string
}
```

Methoden:
- `subscribe(callback)` - State-Änderungen beobachten
- `notify()` - Alle Observer benachrichtigen
- `addCustomer()`, `updateCustomer()`, `deleteCustomer()`
- `addGate()`, `updateGate()`, `deleteGate()`

### Models

#### **Customer**
```javascript
{
  id: string
  name: string
  company: string
  address: string
  city: string
  phone: string
  email: string
  gates: Gate[]
  createdAt: string
  updatedAt: string
}
```

#### **Gate**
```javascript
{
  id: string
  name: string
  gateType: string
  breite: number
  hoehe: number
  glashoehe: number
  selectedProducts: Array<{id, quantity}>
  aufschlag: number
  calculations: {...}
  createdAt: string
  updatedAt: string
}
```

### Services

#### **StorageService**
- `loadCustomers()` - Lädt Daten aus LocalStorage
- `saveCustomers(data)` - Speichert Daten
- `exportData()` - JSON-Export
- `importData(file)` - JSON-Import

#### **CalculationService**
- `calculateAreas(breite, hoehe, glashoehe)` - Flächenberechnung
- `calculateTotal(gate, products)` - Preiskalkulation
- `autoSelectMainProduct(type, area)` - Automatische Produktwahl
- `isGlassProduct(product)` - Glas-Erkennung

### Components

Wiederverwendbare UI-Komponenten:

- **Header** - App-Header mit Logo
- **ProgressSteps** - Schritt-Anzeige
- **Modal** - Modal-Dialoge
- **Summary** - Preis-Zusammenfassung

### Views

Haupt-Ansichten der App:

#### **CustomerSelectView**
- Kundenliste anzeigen
- Neuen Kunden erstellen
- Kunden bearbeiten/löschen
- Kunde auswählen

#### **TypeSelectView**
- Kundeninfo anzeigen
- Gespeicherte Tore anzeigen
- Tor-Typ auswählen
- Tor bearbeiten/löschen

#### **GateConfigView**
- Maße eingeben
- Produkte auswählen
- Mengen anpassen
- Live-Kalkulation
- Tor speichern

### Utilities

#### **formatter.js**
- `formatPrice(amount)` - EUR-Formatierung
- `formatArea(area)` - m²-Formatierung
- `formatDate(date)` - Datum-Formatierung

#### **validator.js**
- `validateCustomer(data)` - Kunden-Validierung
- `validateGateDimensions(data)` - Maß-Validierung
- `isValidEmail(email)` - Email-Check
- `isValidPhone(phone)` - Telefon-Check

## Datenfluss

```
User Interaction
    ↓
Event Handler (window.functionName)
    ↓
AppState Method
    ↓
Update State
    ↓
Save to LocalStorage
    ↓
Notify Observers
    ↓
Re-render View
```

## Rendering-Zyklus

1. **Initialisierung:**
   - App lädt State aus LocalStorage
   - Service Worker wird registriert
   - Initial Render

2. **State-Änderung:**
   - User-Interaktion triggert State-Update
   - AppState.notify() wird aufgerufen
   - Alle Observer werden benachrichtigt

3. **Re-Rendering:**
   - render() Funktion wird aufgerufen
   - View-spezifischer Render basierend auf state.view
   - DOM wird aktualisiert

## Event-Handling

Events werden über globale Funktionen gehandhabt:

```javascript
// In View-Datei definiert:
window.selectCustomer = function(id) {
  AppState.setCurrentCustomer(id);
  AppState.goToTypeSelect();
}

// In HTML aufgerufen:
<button onclick="window.selectCustomer('123')">
```

**Vorteile:**
- Einfache Integration mit innerHTML
- Keine komplexe Event-Delegation
- Klare Zuordnung

**Nachteile:**
- Globaler Namespace
- Kann bei sehr großen Apps problematisch werden

**Alternative für Zukunft:** Event-Delegation im root-Element

## PWA-Features

### Service Worker
- **Offline-Funktionalität:** App läuft ohne Internet
- **Cache-First-Strategie:** Schnelles Laden
- **Automatische Updates:** Neue Version wird gecacht

### Manifest
- **Installierbar:** Auf Home-Screen
- **Standalone:** Läuft wie native App
- **Theme-Color:** Brand-Farbe #c8102e

### iOS-Optimierungen
- Apple-Touch-Icons
- Viewport-Fit für Notch
- Safe-Area-Insets
- Status-Bar-Styling

## Performance-Optimierungen

### 1. **Lazy Loading**
Module werden nur bei Bedarf geladen (ES6 Modules)

### 2. **Selektives Re-Rendering**
```javascript
// Nur Summary updaten statt komplette View
updateSummaryOnly()
```

### 3. **Debouncing**
Bei Input-Feldern könnte Debouncing hinzugefügt werden

### 4. **Vite Build**
- Tree-Shaking
- Code-Splitting
- Minification

## Sicherheit

### Client-Side Only
- Keine Server-Kommunikation
- Alle Daten lokal
- Keine Auth erforderlich

### Input-Validierung
- Alle Inputs werden validiert
- XSS-Schutz durch Template-Strings
- SQL-Injection nicht möglich (kein Backend)

### Daten-Backup
- Export-Funktion vorhanden
- Empfehlung: Regelmäßige Backups

## Erweiterbarkeit

### Neue Produkte hinzufügen
Datei: `src/js/data/products.js`

```javascript
export const productsByCategory = {
  'Neuer Typ': {
    main: [...],
    accessories: [...]
  }
}
```

### Neuer Tor-Typ
1. In `constants.js` GATE_TYPES erweitern
2. Icon in ICONS hinzufügen
3. Produkte in `products.js` definieren
4. CalculationService anpassen (falls spezielle Logik)

### Neue View
1. Datei in `src/js/views/` erstellen
2. In `VIEWS` constant registrieren
3. In `app.js` render() Switch erweitern

## Testing-Strategie (Empfohlen)

### Unit Tests
- Utilities (formatter, validator)
- Services (CalculationService)
- Models (Customer, Gate)

### Integration Tests
- State Management
- Storage-Operationen

### E2E Tests
- Kompletter User-Flow
- Tools: Playwright, Cypress

## Deployment

### Hosting-Optionen

1. **Statisches Hosting:**
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront

2. **Eigener Server:**
   - Nginx
   - Apache
   - Node.js (Express)

### Build-Prozess

```bash
# Production Build
npm run build

# Output: dist/
# Hochladen auf Server
```

### HTTPS erforderlich
Service Worker benötigen HTTPS (außer localhost)

## Wartung

### Updates
1. Code ändern
2. Build erstellen: `npm run build`
3. Neue Version deployen
4. Service Worker cached automatisch

### Daten-Migration
Bei Struktur-Änderungen:

```javascript
// In StorageService.loadCustomers()
const data = localStorage.getItem(STORAGE_KEY);
const customers = JSON.parse(data);

// Migration-Logik
customers.forEach(c => {
  if (!c.newField) {
    c.newField = defaultValue;
  }
});
```

## Best Practices

1. **State immutability** - State nie direkt modifizieren
2. **Single Responsibility** - Jede Datei eine Aufgabe
3. **DRY** - Wiederholungen vermeiden
4. **Kommentare** - Komplexe Logik dokumentieren
5. **Error Handling** - Try-Catch bei kritischen Ops

## Bekannte Limitierungen

1. **LocalStorage-Größe:** ~5-10 MB (Browser-abhängig)
2. **Kein Multi-Device-Sync:** Jedes Gerät hat eigene Daten
3. **Kein Offline-Backend:** Keine Server-Synchronisation

## Zukünftige Erweiterungen

### Potenzielle Features:

1. **PDF-Export:** Angebote als PDF
2. **Cloud-Sync:** Firebase/Supabase Integration
3. **Mehrere Benutzer:** Login-System
4. **Statistiken:** Dashboard mit Charts
5. **Vorlagen:** Gate-Templates
6. **Bilder:** Produkt-Fotos hochladen
7. **Email:** Angebote per Mail versenden

### Technical Debt:

- Tests hinzufügen
- TypeScript migrieren (optional)
- Event-Delegation statt globaler Funktionen
- Debouncing bei Inputs

## Kontakt & Support

Bei Fragen zur Architektur oder Erweiterungen kontaktieren Sie den Entwickler.

---

**Letzte Aktualisierung:** 2025-01-05
**Version:** 1.0.0
