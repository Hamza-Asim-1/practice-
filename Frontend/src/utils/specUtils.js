/**
 * Normalizes product specifications from various formats (Legacy Array, Current Object)
 * into a standard format: { [Key]: [Array of Values] }
 */
export const normalizeSpecifications = (specifications) => {
    if (!specifications) return {};
    
    // If it's already an object (current format)
    if (typeof specifications === 'object' && !Array.isArray(specifications)) {
        const normalized = {};
        Object.entries(specifications).forEach(([key, values]) => {
            normalized[key] = Array.isArray(values) ? values : [String(values)];
        });
        return normalized;
    }

    // If it's an array (legacy format: [{ key/label: "...", value: "..." }])
    if (Array.isArray(specifications)) {
        return specifications.reduce((acc, spec) => {
            const key = spec.key || spec.label;
            if (!key) return acc;
            if (!acc[key]) acc[key] = [];
            acc[key].push(spec.value);
            return acc;
        }, {});
    }

    return {};
};
