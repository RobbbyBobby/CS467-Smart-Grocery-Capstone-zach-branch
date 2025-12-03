import { useState } from "react";
import config from '../../config'
const BACKEND_URL = config.BACKEND_URL

export default function EditItem ({ item, onSubmit }) {

    const [form, setForm] = useState({
        itemId: item.itemId,
        userId: item.userId,
        itemName: item.itemName,
        purchaseDate: item.purchaseDate?.slice(0, 10),
        expiryDate: item.expiryDate?.slice(0, 10),
        state: item.state,
        units: item.units
    })

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSave (e) {
        e.preventDefault()

        try {
            const res = await fetch(`${BACKEND_URL}/api/item/${item.itemId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ form })
            })

            if (!res.ok) {
                console.error("Failed to update item");
                return;
            }
            
            if (onSubmit) onSubmit()
        } catch (err) {
            console.error(err)
        }

    }

    return (
        <form onSubmit={handleSave} className="stacked-form">
            <h3>Edit Item</h3>

            <label>
                Item Name:
                <input
                    type="text"
                    name="itemName"
                    value={form.itemName}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Units:
                <input
                    type="text"
                    name="units"
                    value={form.units}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Purchase Date:
                <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Expiry Date:
                <input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                State:
                <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                >
                    <option value="fresh">Fresh</option>
                    <option value="nearing_expiration">Expiring Soon</option>
                    <option value="expired">Expired</option>
                </select>
            </label>

            <button type="submit">Save Changes</button>
        </form>
    );
}
