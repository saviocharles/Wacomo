export const parseMessage = (text) => {
    const result = {
        commodity: null,
        location: null,
        rate: null,
        quantity: null,
        unit: null,
        isParsed: false
    };

    // Normalize text
    const cleanedText = text.toLowerCase();

    // Regex patterns
    // Quantity: "50 tons", "50kg", "100 quintal"
    const qtyRegex = /(\d+(?:\.\d+)?)\s*(tons?|mt|kg|quintals?|qtl)/i;
    const qtyMatch = cleanedText.match(qtyRegex);
    if (qtyMatch) {
        result.quantity = parseFloat(qtyMatch[1]);
        result.unit = qtyMatch[2];
    }

    // Rate: "at 2500", "@ 2500", "rate 2500"
    const rateRegex = /(?:at|@|rate|rs\.?)\s*(\d+(?:\.\d+)?)/i;
    const rateMatch = cleanedText.match(rateRegex);
    if (rateMatch) {
        result.rate = parseFloat(rateMatch[1]);
    }

    // Location: "in Mumbai", "at Delhi"
    const locRegex = /(?:in|at|for|from|site)\s+([a-zA-Z\s]+?)(?:\s+(?:at|@|rate|qty|quantity|rs\.?)|$)/i;
    const locMatch = cleanedText.match(locRegex);
    if (locMatch) {
        result.location = locMatch[1].trim();
    }

    // Commodity Keywords
    const knownCommodities = ['soybean', 'wheat', 'rice', 'maize', 'sugar', 'onion', 'tomato', 'oil', 'cotton'];
    const foundCommodity = knownCommodities.find(c => cleanedText.includes(c));

    if (foundCommodity) {
        result.commodity = foundCommodity.charAt(0).toUpperCase() + foundCommodity.slice(1);
    } else {
        // Fallback to regex if no known keyword found
        const commodityRegex = /(?:of|need|buy|sell|require|looking|urgent)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:in|at|for|from|@|rate|qty|rs\.?)|$)/i;
        const comMatch = cleanedText.match(commodityRegex);
        if (comMatch) {
            result.commodity = comMatch[1].trim();
        }
    }

    if (result.commodity || result.location || result.rate || result.quantity) {
        result.isParsed = true;
    }

    return result;
};
