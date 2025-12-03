import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import config from '../../config'
const BACKEND_URL = config.BACKEND_URL

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const [itemHistory, setItemHistory] = useState();

    useEffect(() => {
        if (!user) return;
        fetchItemHistory();
    }, [user]);

    async function fetchItemHistory () {
        try {
            const res = await fetch (`${BACKEND_URL}/api/item-history/${user.userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to fetch item history")
            
            const data = await res.json()
            setItemHistory(data)
            console.log(data)
        } catch (err) {
            console.error(err)
        }
    }

    if (!itemHistory) {
        return <p className="loading-text">Loading analytics…</p>;
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <p className="hero-highlight">Waste & usage trends</p>
                    <h1>Analytics</h1>
                    <p className="page-subtitle">See what gets used and what spoils to improve habits.</p>
                </div>
            </div>

            <section className="panel-grid">
                <div className="card list-card">
                    <h4>Wasted Items Log</h4>
                    <ul className="list">
                        {itemHistory
                            .filter(item => item.action === "expired")
                            .map((item, index) => (
                                <li key={index} className="list-row">
                                    <div className="row-info">
                                        <p className="row-title">{item.itemName}</p>
                                        <p className="row-subtitle">Removed {Math.abs(item.quantityChange)} unit(s)</p>
                                    </div>
                                    <div className="chip warning">Expired</div>
                                </li>
                            ))}
                        {itemHistory.filter(item => item.action === "expired").length === 0 && (
                            <li className="row-subtitle">No expired items logged yet.</li>
                        )}
                    </ul>
                </div>

                <div className="card list-card">
                    <h4>Used Items Log</h4>
                    <ul className="list">
                        {itemHistory
                            .filter(item => item.action === "used")
                            .map((item, index) => (
                                <li key={index} className="list-row">
                                    <div className="row-info">
                                        <p className="row-title">{item.itemName}</p>
                                        <p className="row-subtitle">Used {Math.abs(item.quantityChange)} unit(s)</p>
                                    </div>
                                    <div className="chip success">Used</div>
                                </li>
                            ))}
                        {itemHistory.filter(item => item.action === "used").length === 0 && (
                            <li className="row-subtitle">No usage tracked yet.</li>
                        )}
                    </ul>
                </div>
            </section>
        </>
    );
}
