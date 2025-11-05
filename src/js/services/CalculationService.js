/**
 * Calculation Service
 * Handles all price and area calculations
 */

import { VAT_RATE } from '../config/constants.js';

class CalculationService {
    /**
     * Calculate areas from dimensions
     * @param {number} breite - Width in cm
     * @param {number} hoehe - Height in cm
     * @param {number} glashoehe - Glass height in cm
     * @returns {Object}
     */
    calculateAreas(breite, hoehe, glashoehe = 0) {
        const gesamtflaeche = (breite * hoehe) / 10000; // Convert cm² to m²
        const glasflaeche = glashoehe > 0 ? (breite * glashoehe) / 10000 : 0;
        const torflaeche = gesamtflaeche - glasflaeche;

        return {
            gesamtflaeche: Math.max(0, gesamtflaeche),
            glasflaeche: Math.max(0, glasflaeche),
            torflaeche: Math.max(0, torflaeche)
        };
    }

    /**
     * Check if product is glass-related
     * @param {Object} product
     * @returns {boolean}
     */
    isGlassProduct(product) {
        const glassKeywords = ['glas', 'verglasung', 'fenster', 'plexiglas', 'isolierglas'];
        const nameLower = product.name.toLowerCase();
        return glassKeywords.some(keyword => nameLower.includes(keyword));
    }

    /**
     * Check if product is "Minderpreis einwandige Füllung"
     * @param {Object} product
     * @returns {boolean}
     */
    isMinderpreisProduct(product) {
        const nameLower = product.name.toLowerCase();
        return nameLower.includes('minderpreis') && nameLower.includes('einwandige');
    }

    /**
     * Calculate total price for gate
     * @param {Object} gate
     * @param {Array} products - All available products
     * @returns {Object}
     */
    calculateTotal(gate, products) {
        const { gesamtflaeche, torflaeche, glasflaeche } = this.calculateAreas(
            gate.breite,
            gate.hoehe,
            gate.glashoehe
        );

        let subtotal = 0;
        const selectedProductsDetails = [];

        // Calculate price for each selected product
        gate.selectedProducts.forEach(selected => {
            const product = products.find(p => p.id === selected.id);
            if (!product) return;

            let amount = 0;
            const quantity = selected.quantity || 1;

            if (product.unit === 'm²') {
                // Determine which area to use:
                // - Glass products: use glasflaeche
                // - Minderpreis einwandige Füllung: use torflaeche (without glass)
                // - All other products (Hauptprodukte): use gesamtflaeche
                let area;
                if (this.isGlassProduct(product)) {
                    area = glasflaeche;
                } else if (this.isMinderpreisProduct(product)) {
                    area = torflaeche;
                } else {
                    // Hauptprodukte und andere Produkte verwenden die gesamte Fläche
                    area = gesamtflaeche;
                }
                amount = product.price * area * quantity;
            } else {
                // For piece-based or linear meter products
                amount = product.price * quantity;
            }

            subtotal += amount;

            selectedProductsDetails.push({
                ...product,
                quantity,
                amount
            });
        });

        // Calculate surcharge
        const aufschlagBetrag = subtotal * (gate.aufschlag / 100);
        const exklusiveMwst = subtotal + aufschlagBetrag;
        const inklMwst = exklusiveMwst * (1 + VAT_RATE);

        return {
            torflaeche,
            glasflaeche,
            subtotal,
            aufschlagBetrag,
            exklusiveMwst,
            inklMwst,
            products: selectedProductsDetails
        };
    }

    /**
     * Auto-select main product based on area
     * @param {string} gateType
     * @param {number} area - Total area in m²
     * @param {Array} mainProducts
     * @returns {number|null} Product ID
     */
    autoSelectMainProduct(gateType, area, mainProducts) {
        switch (gateType) {
            case 'Türen':
                // Auto-select first door product
                return mainProducts[0]?.id || null;

            case 'Flügeltore und Falttore':
                // Select based on area thresholds
                if (area <= 4) return mainProducts.find(p => p.name.includes('bis 4'))?.id;
                if (area <= 7) return mainProducts.find(p => p.name.includes('bis 7'))?.id;
                if (area <= 11) return mainProducts.find(p => p.name.includes('bis 11'))?.id;
                if (area <= 15) return mainProducts.find(p => p.name.includes('bis 15'))?.id;
                if (area <= 20) return mainProducts.find(p => p.name.includes('bis 20'))?.id;
                return mainProducts.find(p => p.name.includes('über 20'))?.id;

            case 'Schubtore':
                // Select based on area thresholds
                if (area <= 3) return mainProducts.find(p => p.name.includes('bis 3'))?.id;
                if (area <= 4) return mainProducts.find(p => p.name.includes('bis 4'))?.id;
                if (area <= 7) return mainProducts.find(p => p.name.includes('bis 7'))?.id;
                if (area <= 11) return mainProducts.find(p => p.name.includes('bis 11'))?.id;
                if (area <= 15) return mainProducts.find(p => p.name.includes('bis 15'))?.id;
                if (area <= 20) return mainProducts.find(p => p.name.includes('bis 20'))?.id;
                return mainProducts.find(p => p.name.includes('über 20'))?.id;

            case 'Schiebetüren':
                // Auto-select Betoplan
                return mainProducts.find(p => p.name.includes('Betoplan'))?.id;

            default:
                return null;
        }
    }

    /**
     * Calculate discount
     * @param {number} total
     * @param {number} discountPercent
     * @returns {Object}
     */
    calculateDiscount(total, discountPercent) {
        const discountAmount = total * (discountPercent / 100);
        const finalTotal = total - discountAmount;

        return {
            discountAmount,
            finalTotal
        };
    }
}

export default new CalculationService();
