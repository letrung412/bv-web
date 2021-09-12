"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdBarcode = void 0;
const bwipjs = require("bwip-js");
const createdBarcode = async (text) => {
    let barcodeBase64;
    const buffer = await bwipjs.toBuffer({
        bcid: "code128",
        text: text,
        scale: 1,
        height: 8,
        includetext: true,
        textxalign: "center", // Always good to set this
    });
    barcodeBase64 = `data:image/gif;base64,${buffer.toString("base64")}`;
    return barcodeBase64;
};
exports.createdBarcode = createdBarcode;
