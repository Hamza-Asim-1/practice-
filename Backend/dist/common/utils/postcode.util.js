"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOutcode = extractOutcode;
exports.calculateProximityScore = calculateProximityScore;
const POSTCODE_REGEX = /([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})/i;
function extractOutcode(address) {
    if (!address)
        return null;
    const match = address.match(POSTCODE_REGEX);
    return match ? match[1].toUpperCase() : null;
}
function calculateProximityScore(outcodeA, outcodeB) {
    if (!outcodeA || !outcodeB)
        return 0;
    if (outcodeA === outcodeB)
        return 100;
    const areaA = outcodeA.match(/^[A-Z]{1,2}/)?.[0];
    const areaB = outcodeB.match(/^[A-Z]{1,2}/)?.[0];
    if (areaA && areaB && areaA === areaB)
        return 50;
    return 0;
}
//# sourceMappingURL=postcode.util.js.map