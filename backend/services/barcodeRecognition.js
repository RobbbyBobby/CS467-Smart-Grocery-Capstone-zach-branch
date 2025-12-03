// Takes a base64 image of a barcode and returns the barcode number

const Quagga = require('@ericblade/quagga2').default;
const { getUPCItem } = require('./barcodeMapping.js')

// This function uses adapted code from this example in the Quagga2 repo:
// https://github.com/ericblade/quagga2?tab=readme-ov-file#node-example

function getProductFromBarcode(imageData) {
  return new Promise((resolve, reject) => {
    try {
        Quagga.decodeSingle({
        src: imageData,
        numOfWorkers: 0,
        inputStream: { size: 800 },
        decoder: {
            readers: ["ean_reader", "upc_reader", "ean_8_reader", "upc_e_reader"]
        }
        }, (result) => {
            if (result && result.codeResult) {
                const barcode = result.codeResult.code;
                console.log("getUPCItem(barcode):", getUPCItem(barcode));
                getUPCItem(barcode)
                    .then(mappedResult => {
                        console.log("Mapped result from barcode:", mappedResult);
                        resolve([{ itemName: mappedResult, quantity: 1, barcode: barcode }])
                    })
                    .catch(err => reject(err))
            } else {
                reject(new Error("Barcode not detected"));
            }
        });
    } catch(err) {
        reject(new Error("Failed to load image"));
    }
  });
}

module.exports = { getProductFromBarcode };
