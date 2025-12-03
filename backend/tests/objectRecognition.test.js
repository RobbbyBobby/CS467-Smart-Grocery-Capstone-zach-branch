const { getProductFromObj } = require('backend/services/objectRecognition.js');

global.fetch = jest.fn();

describe('getProductFromObj', () => {
    const mockImage = "image byte string";

    // This is an example of how an input image will need to be converted to the correct format
    // const fs = require("fs");
    // const filepath = "/workspaces/smart-grocery/backend/test-images/grapefruit.png";
    // const imageBytes = fs.readFileSync(filepath);
    // const imageBase64 = imageBytes.toString("base64");
    // const imageData = `data:image/jpeg;base64,${imageBase64}`;

    beforeAll(() => {
        process.env.APP_ID = 'TEST_APP_ID';
        process.env.APP_KEY = 'TEST_APP_KEY';
    });

    beforeEach(() => {
        fetch.mockClear();
    });

    it('should call the Edamam API and return food item data', async () => {
        const mockResponse = {
            parsed: {
                food: {
                label: '"Apples and Banana (Arranged as a Smiley Face)"',
                foodContentsLabel: 'Apple, Apple, Banana'
                },
                quantity: 1,
                measure: {
                uri: 'http://www.test.com',
                label: 'Serving',
                weight: 0
                }
            },
            recipe: {
                TEST_KEY: "test_value",
            },
        }

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getProductFromObj(mockImage);

        // Check that the response was parsed correctly into {itemName: str, quantity: int}
        expect(result).toEqual([{itemName: "Apple", quantity: 2}, {itemName: "Banana", quantity: 1}]);
    });

    it('should return an error object if food cannot be identified', async () => {
        fetch.mockResolvedValue({ ok: false, status: 555 });
        const result = await getProductFromObj(mockImage);
        expect(result).toEqual([{ "error": "Food item could not be identified" }]);
    });

    it('should return an error object if response is not ok', async () => {
        fetch.mockResolvedValue({ ok: false, status: 500 });
        const result = await getProductFromObj(mockImage);
        expect(result).toEqual([{ "error": "Edamam API error" }]);
    });
});






