import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { daysUntilExpiry, formatItemDate } from "../assets/utils/utils";
import config from '../../config'

export default function PantryDashboard() {
    const { user } = useAuth();
    const [stateCount, setStateCount] = useState();
    const [totalItems, setTotalItems] = useState();
    const [expiringItems, setExpiringItems] = useState();
    const [recentPurchases, setRecentPurchases] = useState();
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = config.BACKEND_URL

    useEffect(() => {
        if (!user) return;

        try{
            fetchItemStateCount();
            fetchExpiringItems();
            fetchRecentPurchases();
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [user]);

    async function fetchItemStateCount () {
        try {
            const res = await fetch (`${BACKEND_URL}/api/item-state-count/${user.userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to fetch items")
            
            const data = await res.json()
            setStateCount(data)

            // Count total number of fresh and near expiration items
            let itemCount = 0
            data.map(item => (
                itemCount += item.count
            ))
            setTotalItems(itemCount)
            
        } catch (err) {
            console.error(err)
        }
    }

    async function fetchExpiringItems () {
        try {
            const res = await fetch (`${BACKEND_URL}/api/item-state/${user.userId}/nearing_expiration`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to fetch items")
            
            const data = await res.json()
            setExpiringItems(data)
            
        } catch (err) {
            console.error(err)
        }
    }

    async function fetchRecentPurchases () {
        try {
            const res = await fetch (`${BACKEND_URL}/api/recent-purchases/${user.userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to fetch items")
            
            const data = await res.json()
            setRecentPurchases(data)
            
        } catch (err) {
            console.error(err)
        }
    }

    if (loading || !stateCount || !expiringItems || !recentPurchases) {
        return <p className="loading-text">Loading dashboard…</p>;
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <p className="hero-highlight">Pantry pulse · stay ahead of waste</p>
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">Freshness, expiring items, and recent activity in one view.</p>
                </div>
                <div className="badge">
                    <span>Total items</span>
                    <span>{totalItems}</span>
                </div>
            </div>

            <section className="stat-grid">
                <div className="card stat-card accent shadow-card">
                    <span className="stat-label">All items</span>
                    <span className="stat-value">{totalItems}</span>
                    <span className="stat-chip">Pantry health synced</span>
                </div>

                {stateCount.map((state, index) => (
                    <div key={index} className="card stat-card">
                        <span className="stat-label">
                            {state.state === "fresh" ? "Fresh Items" : "Expiring Soon"}
                        </span>
                        <span className="stat-value">{state.count}</span>
                        <p className="page-subtitle">
                            {state.state === "fresh"
                                ? "Ready to enjoy"
                                : "Plan to use or donate soon"}
                        </p>
                    </div>
                ))}
            </section>
            
            <section className="panel-grid">
                <div className="card list-card">
                    <h4>Expiring Soon</h4>
                    <ul className="list">
                        {expiringItems.map((item, index) => (
                            <li key={index} className="list-row">
                                <div className="row-info">
                                    <p className="row-title">{item.itemName}</p>
                                    <p className="row-subtitle">{item.itemQuantity} {item.units}</p>
                                </div>
                                <div className="chip warning">
                                    {daysUntilExpiry(item.expiryDate)} days left
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card list-card">
                    <h4>Recent Purchases</h4>
                    <ul className="list">
                        {recentPurchases.map((item, index) => (
                            <li key={index} className="list-row">
                                <div className="row-info">
                                    <p className="row-title">{item.itemName}</p>
                                    <p className="row-subtitle">{formatItemDate(item.expiryDate)}</p>
                                </div>
                                
                                <div className={`chip ${item.state === "fresh" ? "success" : "warning"}`}>
                                    {item.state === "fresh" ? "Fresh" : "Expiring"}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
