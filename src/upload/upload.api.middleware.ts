import { UploadNS } from "./upload";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import rand from "../lib/rand";

const dir = "D:/UPLOAD_DATA";
const storage = multer.diskStorage({
    destination: (req: any , file : any, res : any) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive : true});
        } 
        res(null, dir);
    },
    filename : (req : any, file : any, res : any) => {
        res(null, file.fieldname + "-" + rand.number(16) + path.extname(file.originalname));
    }
})

const fileFilter = (req: any, file: any, res: any) => {
    if ( file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        res(null, true);
    } else {
        res(UploadNS.Errors.ErrDataType, false); 
    }
};

export const upload = multer({
    storage : storage, 
    fileFilter : fileFilter
});