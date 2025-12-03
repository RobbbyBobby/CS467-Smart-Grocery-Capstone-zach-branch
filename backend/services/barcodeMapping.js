// Maps a barcode number to a food product

require("dotenv").config();

// Makes a call to the UPC Database API
async function getUPCItem(upc) {
    const apiKey = process.env.UPC_API_KEY;
    const url = `https://api.upcdatabase.org/product/${upc}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
            "Authorization": `Bearer ${apiKey}`,
            },
        });
        
        if(!response.ok){
            throw new Error(`HTTP error; status: ${response.status}`);
        }

        const data = await response.json();
        const itemName = data.title;
        return itemName;
    } catch(error) {
        console.error(error.message);
        throw error;
    }
}

module.exports = { getUPCItem };