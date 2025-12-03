import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { daysUntilExpiry, formatItemDate, formatItemState } from "../assets/utils/utils";
import config from '../../config'
import Modal from "../components/Modal";
import EditItem from "../components/EditItem";
import ItemHistory from "../components/ItemHistory";

export default function PantryManagement() {
    const { user } = useAuth();
    const [items, setItems] = useState();
    const [categories, setCategories] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [showActionModal, setShowActionModal] = useState();
    const [selectedItem, setSelectedItem] = useState(null);
    const [action, setAction] = useState("");
    const BACKEND_URL = config.BACKEND_URL

    useEffect(() => {
        if (!user) return;
        fetchItems();
        fetchCategories();
    }, [user]);

    async function fetchItems () {
        try {
            const res = await fetch (`${BACKEND_URL}/api/items/${user.userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to fetch items")
            
            const data = await res.json()
            setItems(data)
            
        } catch (err) {
            console.error(err)
        }
    }

    async function fetchCategories () {
        try {
            const res = await fetch (`${BACKEND_URL}/api/categories`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to fetch categories")
            
            const data = await res.json()
            setCategories(data)
            
        } catch (err) {
            console.error(err)
        }
    }

    function editItem (item) {
        setShowEditModal(true)
        setSelectedItem(item)
    }

    function logItemHistory (item, action) {
        setShowActionModal(true)
        setSelectedItem(item)
        setAction(action)
    }

    async function deleteItem (itemId) {
        const confirm = window.confirm("Are you sure you want to delete this item?")

        if (confirm) {
            const res = await fetch(`${BACKEND_URL}/api/item/${itemId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            if (!res.ok) {
                console.error("Failed to delete item")
                return
            } else {
                fetchItems()
            }
        }
    }
    
    if (user && items && categories) {
        return (
            <>
                <div className="page-header">
                    <div>
                        <p className="hero-highlight">Inventory control</p>
                        <h1>Manage Pantry</h1>
                        <p className="page-subtitle">Edit quantities, log spoilage, and keep categories tidy.</p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className="page-subtitle">No items found.</p>
                ) : (
                    <div className="card table-card shadow-card">
                        <h3 className="table-title">Inventory</h3>
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Use By</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const categoryName = categories.find(cat => (cat.categoryId == item.categoryId))?.name || "Unknown";
                                    const statusClass = item.state === "fresh" ? "success" : item.state === "nearing_expiration" ? "warning" : "neutral";

                                    return (
                                        <tr key={item.itemId}>
                                            <td>{item.itemName}</td>
                                            <td>{categoryName}</td>
                                            <td>{item.itemQuantity} {item.units}</td>
                                            <td>
                                                <p className="table-meta">{formatItemDate(item.expiryDate)}</p>
                                                <p className="table-meta">
                                                    {(() => {
                                                        const daysLeft = daysUntilExpiry(item.expiryDate);
                                                        return daysLeft === null ? "No expiry set" : `${daysLeft} days left`;
                                                    })()}
                                                </p>
                                            </td>
                                            <td>
                                                <span className={`chip ${statusClass}`}>{formatItemState(item.state)}</span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="ghost-button" onClick={() => editItem(item)}>Edit</button>
                                                    <button className="ghost-button" onClick={() => logItemHistory(item, "used")}>Use</button>
                                                    <button className="ghost-button" onClick={() => logItemHistory(item, "expired")}>Spoiled</button>
                                                    <button className="ghost-button" onClick={() => deleteItem(item.itemId)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}>
                    <ItemHistory 
                        item={selectedItem}
                        action={action}
                        onSubmit={async () => {
                            setShowActionModal(false)
                            await fetchItems();
                        }}
                    />
                </Modal>

                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                    <EditItem 
                        item={selectedItem}
                        onSubmit={async () => {
                            setShowEditModal(false)
                            await fetchItems();
                        }}
                    />
                </Modal>
            </>
        );
    } else {
        return <h3>Loading pantry items...</h3>
    }
    
}
