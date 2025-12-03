export function daysUntilExpiry(expiryDate) {
    if (!expiryDate) return null;

    // Parse YYYY-MM-DD strings as local dates to avoid implicit UTC parsing
    let expiry;
    if (typeof expiryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiryDate.trim())) {
        const [y, m, d] = expiryDate.split("-").map(Number);
        expiry = new Date(y, m - 1, d);
    } else {
        expiry = new Date(expiryDate);
    }

    if (isNaN(expiry.getTime())) return null;

    const now = new Date();

    // Compare dates using local midnights to avoid partial-day timezone shifts
    const msPerDay = 1000 * 60 * 60 * 24;
    const expiryMid = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = expiryMid - nowMid;
    const days = Math.ceil(diffMs / msPerDay);

    if (days < 0) return 0;
    return days;
}

export function formatItemDate(date) {
    if (!date) return "No date set";

    // Avoid timezone shifts by parsing YYYY-MM-DD into a local date
    let parsed;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        const [y, m, d] = date.split("-").map(Number);
        parsed = new Date(y, m - 1, d);
    } else {
        parsed = new Date(date);
    }

    if (isNaN(parsed.getTime())) return "No date set";

    const formattedDate = parsed.toLocaleDateString();

    return formattedDate;
}

export function formatItemState(state) {
    if (state === "fresh") {
        return "Fresh"
    } else if (state === "nearing_expiration") {
        return "Expiring"
    } else {
        return "Expired"
    }
}
