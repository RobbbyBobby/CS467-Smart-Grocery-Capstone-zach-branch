import { useState } from "react";
import config from '../../config'
const BACKEND_URL = config.BACKEND_URL

export default function ItemHistory ({ item, action, onSubmit }) {

    const [form, setForm] = useState({
        itemId: item.itemId,
        itemQuantity: item.itemQuantity,
        userId: item.userId,
        action: action,
        quantityChange: 1
    })

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSave (e) {
        e.preventDefault()

        try {
            const res = await fetch(`${BACKEND_URL}/api/item/${item.itemId}/${action}`, {
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
            {action == "used" ? (
                <>
                    <h3>Mark Used</h3>
                    <p>Marking {form.quantityChange} {item.units} of {item.itemName} as used.</p>
                </>
            ) : (
                <>
                    <h3>Mark Spoiled</h3>
                    <p>Marking {form.quantityChange} {item.units} of {item.itemName} as spoiled.</p>
                </>
            )}
            <label>
                Item Name:
                <input
                    type="text"
                    name="itemName"
                    value={item.itemName}
                    readOnly
                    required
                />
            </label>

            <label>
                Units:
                <input
                    type="text"
                    name="units"
                    value={item.units}
                    readOnly
                    required
                />
            </label>

            <label>
                Quantity Changed:
                <input
                    type="number"
                    step="1"
                    name="quantityChange"
                    value={form.quantityChange}
                    onChange={handleChange}
                    min="1"
                    max={item.itemQuantity}
                    required
                />
            </label>

            <button type="submit">Confirm</button>
        </form>
    );
}
