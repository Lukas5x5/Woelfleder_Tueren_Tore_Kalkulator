/**
 * Gate Config View
 */

import AppState from '../state/AppState.js';
import { TABS } from '../config/constants.js';
import { productsByCategory, generalAccessories } from '../data/products.js';
import CalculationService from '../services/CalculationService.js';
import { renderSummary } from '../components/Summary.js';
import { openModal, closeModal } from '../components/Modal.js';
import { formatPrice } from '../utils/formatter.js';

/**
 * Render gate config view
 * @returns {string}
 */
export function renderGateConfigView() {
    const customer = AppState.currentCustomer;
    const gate = AppState.currentGate;

    if (!customer || !gate) {
        AppState.goToCustomerSelect();
        return '';
    }

    const categoryData = productsByCategory[gate.gateType];
    if (!categoryData) {
        console.error('Invalid gate type:', gate.gateType);
        AppState.goToTypeSelect();
        return '';
    }

    // Calculate current totals
    const allProducts = [...categoryData.main, ...categoryData.accessories, ...generalAccessories];
    const calculations = CalculationService.calculateTotal(gate, allProducts);

    return `
        <div class="layout-grid">
            <div>
                <button class="btn btn-secondary" onclick="window.backToTypeSelect()"
                        style="margin-bottom: 1.5rem;">
                    ← Zurück zur Auswahl
                </button>

                <div class="config-header">
                    <div class="config-customer-name">${customer.name}</div>
                    <div class="config-gate-type">${gate.gateType}</div>
                </div>

                <div class="card">
                    <div class="card-title">Maße eingeben</div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="breite">Breite (cm) *</label>
                            <div class="input-with-unit">
                                <input type="number" id="breite" value="${gate.breite || ''}"
                                       min="0" step="1" oninput="window.updateDimensions()">
                                <span class="input-unit">cm</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="hoehe">Höhe (cm) *</label>
                            <div class="input-with-unit">
                                <input type="number" id="hoehe" value="${gate.hoehe || ''}"
                                       min="0" step="1" oninput="window.updateDimensions()">
                                <span class="input-unit">cm</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="glashoehe">Glashöhe (cm)</label>
                            <div class="input-with-unit">
                                <input type="number" id="glashoehe" value="${gate.glashoehe || ''}"
                                       min="0" step="1" oninput="window.updateDimensions()">
                                <span class="input-unit">cm</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="aufschlag">Aufschlag (%)</label>
                            <div class="input-with-unit">
                                <input type="number" id="aufschlag" value="${gate.aufschlag || 0}"
                                       min="0" max="100" step="0.1" oninput="window.updateAufschlag()">
                                <span class="input-unit">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tabs-container">
                    <div class="tab-nav">
                        <button class="tab-btn ${AppState.activeTab === TABS.MAIN ? 'active' : ''}"
                                onclick="window.switchTab('${TABS.MAIN}')">
                            Hauptprodukte
                        </button>
                        <button class="tab-btn ${AppState.activeTab === TABS.ACCESSORIES ? 'active' : ''}"
                                onclick="window.switchTab('${TABS.ACCESSORIES}')">
                            Zubehör
                        </button>
                        <button class="tab-btn ${AppState.activeTab === TABS.GENERAL ? 'active' : ''}"
                                onclick="window.switchTab('${TABS.GENERAL}')">
                            Allg. Zubehör
                        </button>
                    </div>

                    ${renderProductTab(gate, AppState.activeTab, categoryData)}
                </div>

                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="window.backToTypeSelect()">
                        Abbrechen
                    </button>
                    <button class="btn btn-primary" onclick="window.saveGate()"
                            ${!gate.breite || !gate.hoehe ? 'disabled' : ''}>
                        Tor speichern
                    </button>
                </div>
            </div>

            <div id="summary-container">
                ${renderSummary(gate, calculations)}
            </div>
        </div>
    `;
}

/**
 * Render product tab content
 * @param {Object} gate
 * @param {string} activeTab
 * @param {Object} categoryData
 * @returns {string}
 */
function renderProductTab(gate, activeTab, categoryData) {
    let products = [];

    switch (activeTab) {
        case TABS.MAIN:
            products = categoryData.main;
            break;
        case TABS.ACCESSORIES:
            products = categoryData.accessories;
            break;
        case TABS.GENERAL:
            products = generalAccessories;
            break;
    }

    if (products.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <p>Keine Produkte in dieser Kategorie</p>
            </div>
        `;
    }

    return `
        <div class="product-section">
            <div class="product-list">
                ${products.map(product => {
                    const isSelected = gate.isProductSelected(product.id);
                    const quantity = gate.getProductQuantity(product.id);

                    return `
                        <div class="product-item ${isSelected ? 'selected' : ''}"
                             id="product-${product.id}">
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">${formatPrice(product.price)}/${product.unit}</div>
                            ${isSelected ? `
                                <input type="number" class="quantity-input"
                                       value="${quantity}"
                                       min="1" step="1"
                                       onclick="event.stopPropagation()"
                                       oninput="window.updateQuantity(${product.id}, this.value)">
                            ` : `
                                <button class="btn btn-primary"
                                        onclick="window.toggleProduct(${product.id})"
                                        style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                                    Hinzufügen
                                </button>
                            `}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Render only summary (for quick updates)
 */
function updateSummaryOnly() {
    const gate = AppState.currentGate;
    if (!gate) return;

    const categoryData = productsByCategory[gate.gateType];
    const allProducts = [...categoryData.main, ...categoryData.accessories, ...generalAccessories];
    const calculations = CalculationService.calculateTotal(gate, allProducts);

    const summaryContainer = document.getElementById('summary-container');
    if (summaryContainer) {
        summaryContainer.innerHTML = renderSummary(gate, calculations);
    }

    // Update gate calculations
    gate.updateCalculations(calculations);
}

// ==================== EVENT HANDLERS ====================

/**
 * Back to type select
 */
window.backToTypeSelect = function() {
    if (confirm('Möchten Sie wirklich zurück? Nicht gespeicherte Änderungen gehen verloren.')) {
        AppState.clearCurrentGate();
        AppState.goToTypeSelect();
    }
};

/**
 * Switch tab
 * @param {string} tab
 */
window.switchTab = function(tab) {
    AppState.setActiveTab(tab);
};

/**
 * Update dimensions
 */
window.updateDimensions = function() {
    const breite = parseFloat(document.getElementById('breite').value) || 0;
    const hoehe = parseFloat(document.getElementById('hoehe').value) || 0;
    const glashoehe = parseFloat(document.getElementById('glashoehe').value) || 0;

    const gate = AppState.currentGate;
    if (!gate) return;

    const oldArea = gate.gesamtflaeche;
    gate.updateDimensions(breite, hoehe, glashoehe);

    // Auto-select main product if area changed significantly
    if (Math.abs(gate.gesamtflaeche - oldArea) > 0.1) {
        const categoryData = productsByCategory[gate.gateType];
        const autoProductId = CalculationService.autoSelectMainProduct(
            gate.gateType,
            gate.gesamtflaeche,
            categoryData.main
        );

        if (autoProductId && !gate.isProductSelected(autoProductId)) {
            // Remove other main products
            categoryData.main.forEach(p => {
                if (gate.isProductSelected(p.id)) {
                    gate.toggleProduct(p.id);
                }
            });
            // Add new main product
            gate.toggleProduct(autoProductId, 1);

            // Re-render view to show new selection
            AppState.notify();
            return;
        }
    }

    updateSummaryOnly();
};

/**
 * Update aufschlag
 */
window.updateAufschlag = function() {
    const aufschlag = parseFloat(document.getElementById('aufschlag').value) || 0;
    const gate = AppState.currentGate;

    if (gate) {
        gate.updateAufschlag(aufschlag);
        updateSummaryOnly();
    }
};

/**
 * Toggle product selection
 * @param {number} productId
 */
window.toggleProduct = function(productId) {
    const gate = AppState.currentGate;
    if (!gate) return;

    gate.toggleProduct(productId, 1);
    updateSummaryOnly();

    // Highlight the product
    const productEl = document.getElementById(`product-${productId}`);
    if (productEl) {
        productEl.style.animation = 'highlight-pulse 1s ease-out';
        setTimeout(() => {
            productEl.style.animation = '';
        }, 1000);
    }

    // Re-render to show/hide quantity input
    AppState.notify();
};

/**
 * Update product quantity
 * @param {number} productId
 * @param {string|number} value
 */
window.updateQuantity = function(productId, value) {
    const quantity = Math.max(1, parseInt(value) || 1);
    const gate = AppState.currentGate;

    if (gate) {
        gate.updateProductQuantity(productId, quantity);
        updateSummaryOnly();
    }
};

/**
 * Save gate
 */
window.saveGate = function() {
    const gate = AppState.currentGate;
    const customer = AppState.currentCustomer;

    if (!gate || !customer) return;

    if (!gate.breite || !gate.hoehe) {
        alert('Bitte geben Sie Breite und Höhe ein.');
        return;
    }

    if (gate.selectedProducts.length === 0) {
        alert('Bitte wählen Sie mindestens ein Produkt aus.');
        return;
    }

    // Show save modal
    openSaveGateModal();
};

/**
 * Open save gate modal
 */
function openSaveGateModal() {
    const gate = AppState.currentGate;
    const modalBody = document.getElementById('gateModalBody');
    const modalTitle = document.querySelector('#gateModal .modal-title');

    modalTitle.textContent = 'Tor speichern';
    modalBody.innerHTML = `
        <form id="gateForm" onsubmit="window.handleGateSave(event)">
            <div class="form-group" style="margin-bottom: 1rem;">
                <label for="gateName">Bezeichnung *</label>
                <input type="text" id="gateName" name="name"
                       value="${gate.name || ''}" required
                       placeholder="z.B. Haupteingang, Garage, ...">
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="gateNotizen">Notizen</label>
                <textarea id="gateNotizen" name="notizen" rows="4"
                          placeholder="Zusätzliche Informationen...">${gate.notizen || ''}</textarea>
            </div>

            <div class="btn-group">
                <button type="button" class="btn btn-secondary"
                        onclick="window.closeGateModal()">
                    Abbrechen
                </button>
                <button type="submit" class="btn btn-primary">
                    Speichern
                </button>
            </div>
        </form>
    `;

    openModal('gateModal');
}

/**
 * Handle gate save
 * @param {Event} event
 */
window.handleGateSave = function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const gate = AppState.currentGate;

    if (!gate) return;

    gate.name = formData.get('name');
    gate.notizen = formData.get('notizen');

    // Check if editing existing gate
    if (gate.id && AppState.currentCustomer.getGate(gate.id)) {
        // Update existing
        AppState.updateGate(gate.id, gate.toJSON());
    } else {
        // Add new
        AppState.addGate(gate.toJSON());
    }

    closeModal('gateModal');
    AppState.clearCurrentGate();
    AppState.goToTypeSelect();
};

/**
 * Close gate modal
 */
window.closeGateModal = function() {
    closeModal('gateModal');
};
