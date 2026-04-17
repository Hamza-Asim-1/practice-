/**
 * Utility for UK Postcode extraction and proximity scoring.
 */

// Regex for UK Postcodes: https://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom#Validation
const POSTCODE_REGEX = /([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})/i;

/**
 * Extracts the outcode (first part) from a full address string or a standalone postcode.
 * Example: "123 High St, London E1 1AA" -> "E1"
 * Example: "IG11 7BT" -> "IG11"
 */
export function extractOutcode(address: string): string | null {
    if (!address) return null;
    const match = address.match(POSTCODE_REGEX);
    return match ? match[1].toUpperCase() : null;
}

/**
 * Calculates a basic proximity score between two outcodes.
 * 100: Exact match (E1 == E1)
 * 50:  Area match (E1 == E2, because both start with E)
 * 0:   No match
 */
export function calculateProximityScore(outcodeA: string | null, outcodeB: string | null): number {
    if (!outcodeA || !outcodeB) return 0;
    
    if (outcodeA === outcodeB) return 100;
    
    // Check for area prefix (the letters at the start)
    const areaA = outcodeA.match(/^[A-Z]{1,2}/)?.[0];
    const areaB = outcodeB.match(/^[A-Z]{1,2}/)?.[0];
    
    if (areaA && areaB && areaA === areaB) return 50;
    
    return 0;
}
