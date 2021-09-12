const bwipjs = require("bwip-js");

export const createdBarcode = async (text: string) => {
  let barcodeBase64;
  const buffer = await bwipjs.toBuffer({
    bcid: "code128", // Barcode type
    text: text, // Text to encode
    scale: 1, // 3x scaling factor
    height: 8, // Bar height, in millimeters
    includetext: true, // Show human-readable text
    textxalign: "center", // Always good to set this
  });

  barcodeBase64 = `data:image/gif;base64,${buffer.toString("base64")}`;

  return barcodeBase64;
};
