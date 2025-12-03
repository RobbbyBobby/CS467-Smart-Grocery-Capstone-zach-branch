// Component was modified with assistance from ChatGPT
// https://chatgpt.com/c/6923cabf-1ca0-8327-ab90-ff8ca72d9386

import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import CameraInput from "../components/CameraInput"; 
import config from '../../config' 

export default function ItemUpload() {
    const cameraRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [imgType, setImgType] = useState(null);
    const [formValues, setformValues] = useState({
        itemName: "",
        quantity: "",
        units: "",
        categoryId: "",
        purchaseDate: "",
        barcode: "",
    });
    const BACKEND_URL = config.BACKEND_URL

    const handleCapture = async ({ file, previewUrl }) => {
        setPreview(previewUrl);
        console.log("Captured image:", file, "Type:", imgType);
        const response = await uploadImage(file, imgType);
        if (response?.result) {
            setformValues(prev => {
                const data = response.result[0];
                const updated = { ...prev };
                // Loop through all keys in prev and update with new values or clear them
                for (const key in prev) {
                updated[key] = data.hasOwnProperty(key) ? data[key] ?? "" : "";
                }

                return updated;
            });
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformValues((prev) => ({
        ...prev,
        [name]: value,
        }));
    };


    async function uploadImage(file, imgType) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("imgType", imgType);

        try {
            const res = await fetch(`${BACKEND_URL}/api/process-image`, {
                method: "POST",
                body: formData,          
                credentials: "include",
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            console.log("Upload success:", JSON.stringify(data.result, null, 2));
            return data;
        } catch (err) {
            console.error(err);
            alert("Image could not be processed. Please try another image or enter data manually.")
        }
    }

    async function uploadFoodItem() {
        const formData = new FormData();
        for (const key in formValues) {
            if (Object.prototype.hasOwnProperty.call(formValues, key)) {
                formData.append(key, formValues[key]);
            }
        }

        try {
        const res = await fetch(`${BACKEND_URL}/api/submit-food-item`, {
            method: "POST",
            body: formData,          
            credentials: "include",
        });

            if (!res.ok) throw new Error("Submit failed");
            const data = await res.json();
            console.log("Submit success:", JSON.stringify(data.success, null, 2));

        } catch (err) {
            console.error(err);
            alert("Error uploading item.")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await uploadFoodItem();
        console.log("Submitted: ", formValues);
        e.target.reset()
        setformValues({
            itemName: "",
            quantity: "",
            units: "",
            categoryId: "",
            purchaseDate: "",
            barcode: "",
        });
        setPreview(null);
    };

    const handleClear = (e) => {
        e.preventDefault();
        console.log("Cleared");
        setformValues({
            itemName: "",
            quantity: "",
            units: "",
            categoryId: "",
            purchaseDate: "",
            barcode: "",
        });
        setPreview(null);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <p className="hero-highlight">Add groceries with a snap</p>
                    <h1>Item Upload</h1>
                    <p className="page-subtitle">Scan a barcode or capture produce, then adjust details before saving.</p>
                </div>
            </div>
            
            <div className="upload-layout">
                <div className="card upload-card shadow-card">
                    <p className="page-subtitle">
                        Upload a photo of a barcode to add a grocery item. If the food is produce (no barcode), snap a photo of the whole product instead.
                    </p>
                    <div className="upload-actions">
                        <button 
                            className="pill-button upload-button"
                            type="button"
                            onClick={() => {
                                setImgType("barcode");
                                cameraRef.current?.openCamera();}
                            }
                        >
                            Upload Photo of Barcode
                        </button>

                        <button 
                            className="ghost-button upload-button"
                            type="button"
                            onClick={() => {
                                setImgType("object");
                                cameraRef.current?.openCamera();}
                            }
                        >
                            Upload Photo of Produce
                        </button>
                    </div>
                </div>

                <div className="card upload-card">
                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="upload-preview"
                        />
                    )}

                    <form onSubmit={handleSubmit} className="form-stack">
                        <div className="form-row">
                            <label>Item Name *</label>
                            <input 
                                type="text" 
                                name="itemName" 
                                value={formValues.itemName} 
                                maxLength={45}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Quantity *</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                value={formValues.quantity} 
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Units</label>
                            <input 
                                type="text" 
                                name="units" 
                                value={formValues.units}
                                maxLength={45}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-row">
                            <label>Category</label>
                            <select 
                                value={formValues.categoryId}
                                name="categoryId" 
                                onChange={handleChange}
                            >
                                <option value=""></option>
                                <option value="1">Fruit</option>
                                <option value="2">Vegetable</option>
                                <option value="3">Meat</option>
                                <option value="4">Dairy</option>
                                <option value="5">Snack</option>
                                <option value="6">Pantry</option>
                                <option value="7">Frozen</option>
                                <option value="8">Beverage</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Purchase Date</label>
                            <input 
                                type="date"
                                name="purchaseDate" 
                                value={formValues.purchaseDate} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-row">
                            <label>Barcode </label>
                            <input 
                                type="text"
                                name="barcode"
                                value={formValues.barcode}
                                maxLength={45}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-footer">
                            <p className="meta">* Required</p>
                            <div className="upload-actions">
                                <button type="submit">Submit</button>
                                <button type="button" className="ghost-button" onClick={handleClear}>Clear</button>
                            </div>
                        </div>
                        
                    </form>
                </div>
            </div>

            {/* Hidden camera input that will be triggered */}
            <CameraInput ref={cameraRef} onCapture={handleCapture}/>
        </>
    );
}
