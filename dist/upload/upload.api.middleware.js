"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const upload_1 = require("./upload");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const rand_1 = require("../lib/rand");
const dir = "D:/UPLOAD_DATA";
const storage = multer.diskStorage({
    destination: (req, file, res) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        res(null, dir);
    },
    filename: (req, file, res) => {
        res(null, file.fieldname + "-" + rand_1.default.number(16) + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, res) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        res(null, true);
    }
    else {
        res(upload_1.UploadNS.Errors.ErrDataType, false);
    }
};
exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter
});
