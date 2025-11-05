/**
 * Main Application Entry Point
 */

import AppState from './state/AppState.js';
import { VIEWS } from './config/constants.js';
import { renderHeader } from './components/Header.js';
import { renderProgressSteps } from './components/ProgressSteps.js';
import { initModals } from './components/Modal.js';
import { renderCustomerSelectView } from './views/CustomerSelectView.js';
import { renderTypeSelectView } from './views/TypeSelectView.js';
import { renderGateConfigView } from './views/GateConfigView.js';
import StorageService from './services/StorageService.js';

/**
 * Main render function
 */
function render() {
    const state = AppState.getState();

    // Render header
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        headerContainer.innerHTML = renderHeader();
    }

    // Render progress steps
    const stepsContainer = document.getElementById('progress-steps');
    if (stepsContainer) {
        stepsContainer.innerHTML = renderProgressSteps(state.view);
    }

    // Render main view
    const appContainer = document.getElementById('app');
    if (appContainer) {
        switch (state.view) {
            case VIEWS.CUSTOMER_SELECT:
                appContainer.innerHTML = renderCustomerSelectView();
                break;

            case VIEWS.TYPE_SELECT:
                appContainer.innerHTML = renderTypeSelectView();
                break;

            case VIEWS.GATE_CONFIG:
                appContainer.innerHTML = renderGateConfigView();
                break;

            default:
                console.error('Unknown view:', state.view);
                appContainer.innerHTML = '<div class="empty-state">Fehler: Unbekannte Ansicht</div>';
        }
    }

    // Update home button visibility
    updateHomeButton(state.view);
}

/**
 * Update home button visibility and behavior
 * @param {string} currentView
 */
function updateHomeButton(currentView) {
    const homeButton = document.getElementById('homeButton');
    if (!homeButton) return;

    if (currentView === VIEWS.CUSTOMER_SELECT) {
        homeButton.style.display = 'none';
    } else {
        homeButton.style.display = 'flex';
    }
}

/**
 * Home button handler
 */
window.goToHome = function() {
    if (AppState.view !== VIEWS.CUSTOMER_SELECT) {
        if (AppState.view === VIEWS.GATE_CONFIG && AppState.currentGate) {
            if (confirm('Möchten Sie zur Startseite zurück? Nicht gespeicherte Änderungen gehen verloren.')) {
                AppState.clearCurrentGate();
                AppState.goToCustomerSelect();
            }
        } else {
            AppState.goToCustomerSelect();
        }
    }
};

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Wölfleder Kalkulator wird gestartet...');

    // Check if localStorage is available
    if (!StorageService.isAvailable()) {
        alert('Warnung: LocalStorage ist nicht verfügbar. Daten können nicht gespeichert werden.');
    }

    // Initialize modals
    initModals();

    // Subscribe to state changes
    AppState.subscribe(() => {
        console.log('State changed, re-rendering...');
        render();
    });

    // Initial render
    render();

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registriert:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker Registrierung fehlgeschlagen:', error);
            });
    }

    // PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install button/banner if needed
        console.log('💡 App kann installiert werden');
    });

    window.addEventListener('appinstalled', () => {
        console.log('✅ App wurde installiert');
        deferredPrompt = null;
    });

    // Log app info
    console.log('✨ Wölfleder Kalkulator gestartet');
    console.log(`📊 ${AppState.customers.length} Kunden geladen`);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.AppState = AppState;
