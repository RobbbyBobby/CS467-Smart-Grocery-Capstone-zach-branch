const { getUPCItem } = require('backend/services/barcodeMapping.js');

global.fetch = jest.fn();

describe('getUPCInfo', () => {
    const testUPC = "028400183901";

    beforeAll(() => {
        process.env.UPC_API_KEY = 'TEST_API_KEY';
    });

    beforeEach(() => {
        fetch.mockClear();
    });

    it('should call the UPC Database API and return food item name', async () => {
        const mockResponse = {
            added_time: '2022-08-23 15:40:21',
            modified_time: '2022-08-23 15:40:21',
            title: 'Cheetos Crunch Cheese, Baked',
            alias: null,
            description: 'Cheetos Crunch Cheese, Baked',
            brand: 'Cheetos',
            manufacturer: null,
            msrp: null,
            ASIN: null,
            category: 'Food',
            categories: 'Snacks,Salty snacks,Appetizers',
            stores: [],
            barcode: '0028400183901',
            success: true,
            timestamp: 1762832319,
            images: [],
            metadata: {
                countries: 'United States',
                ingredients: 'enriched corn meal (corn meal, ferrous sulfate, niacin, thiamin mononitrate, riboflavin, folic acid), vegetable oil (corn, canola, and/or sunflower oil), whey, cheddar cheese (milk, cheese cultures, salt, enzymes), maltodextrin (made from corn), natural and artificial flavors, salt, whey protein concentrate, monosodium glutamate, lactic acid, citric acid, and artificial color (yellow 6), contains milk ingredients,'
            },
            metanutrition: {
                testNutritionKey: 'test nutrition value',
            }
        }

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getUPCItem(testUPC);

        // Make sure product name was parsed out correctly
        expect(result).toEqual("Cheetos Crunch Cheese, Baked");
    });

    it('should return an error object if response is not ok', async () => {
        fetch.mockResolvedValue({ ok: false, status: 500 });
        await expect(getUPCItem(testUPC)).rejects.toThrow('HTTP error; status: 500');
    });
});