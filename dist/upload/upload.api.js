"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAPIUpload = void 0;
const express = require("express");
const fs = require("fs");
const upload_api_middleware_1 = require("./upload.api.middleware");
function NewAPIUpload(uploadBLL) {
    const app = express();
    app.get("/list", async (req, res) => {
        const ref_id = req.query.ref_id;
        const docs = await uploadBLL.ListData(ref_id);
        res.json(docs);
    });
    app.get("/get", async (req, res) => {
        const name = req.query.name;
        const doc = await uploadBLL.GetData(name);
        res.json(doc);
    });
    app.use(upload_api_middleware_1.upload.array("img", 20)); //upload multi 20 photo
    app.post("/photo/upload", async (req, res, next) => {
        const files = req.files;
        const body = req.body;
        let docs = [];
        if (files.length === 0) {
            const error = new Error('Please upload a file');
            return next(error);
        }
        else {
            for (let i in files) {
                let file = files[i];
                let metadata = body["img"];
                if (typeof (metadata) == "string") {
                    const params = {
                        ref_id: req.body.ref_id,
                        url: file.path,
                        metadata: metadata,
                        name: file.filename,
                        size: file.size
                    };
                    const doc = await uploadBLL.SaveData(params);
                    return res.json(doc);
                }
                if (metadata.length) {
                    const params = {
                        ref_id: req.body.ref_id,
                        url: file.path,
                        metadata: metadata[i],
                        name: file.filename,
                        size: file.size
                    };
                    const doc = await uploadBLL.SaveData(params);
                    docs.push(doc);
                }
            }
        }
        res.json(docs);
    });
    app.get("/photo/download/:filename", async (req, res, next) => {
        const name = req.params.filename;
        const url = await uploadBLL.Download(name);
        fs.readFile(url, (err, data) => {
            if (err) {
                return next(err);
            }
            res.setHeader("Content-Disposition", "attachment : filename=" + name + "");
            res.send(data);
        });
    });
    return app;
}
exports.NewAPIUpload = NewAPIUpload;
//# sourceMappingURL=upload.api.js.map