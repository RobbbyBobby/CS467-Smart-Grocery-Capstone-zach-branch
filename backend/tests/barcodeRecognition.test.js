const { getProductFromBarcode } = require("backend/services/barcodeRecognition.js");
const fs = require("fs");

describe("getBarcodeProduct", () => {
    it("gets product name from barcode", async () => {
        const filePath = "tests/cheetos-barcode.jpg";
        const imageBytes = fs.readFileSync(filePath);
        const imageBase64 = imageBytes.toString("base64");
        const imageData = `data:image/jpg;base64,${imageBase64}`;
        return getProductFromBarcode(imageData).then((barcodeObj) => {
            expect(barcodeObj).toEqual([{ itemName: "Cheetos Crunch Cheese, Baked", quantity: 1, barcode: "0028400183901"}]);
        })
    });

    it("raises an error when the image fails to load", async () => {
        const filePath = "tests/non-barcode-image.jpg";
        const imageBytes = fs.readFileSync(filePath);
        const imageBase64 = imageBytes.toString("base64");
        const imageData = `data:image/jpg;base64,${imageBase64}`;
        getProductFromBarcode(imageData).then(() => {
            throw new Error("Expected promise to reject");
        })
        .catch((error) => {
            expect(error.message).toBe("Barcode not detected");
        })
    });
})
