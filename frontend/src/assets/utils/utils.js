export function daysUntilExpiry(expiryDate) {
    const expiry = new Date(expiryDate)
    const now = new Date()

    const diffMs = expiry - now
    const days =  Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (days < 0) return 0
    return days
}

export function formatItemDate(date) {
    const formattedDate = new Date(date).toLocaleDateString()

    return formattedDate
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