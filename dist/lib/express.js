"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressStaticFallback = void 0;
const Layer = require('express/lib/router/layer');
function isAsyncFunction(value) {
    return value[Symbol.toStringTag] === 'AsyncFunction';
}
Layer.prototype.handle_request = async function handle(req, res, next) {
    const fn = this.handle;
    switch (fn.length) {
        case 0:
            next();
            break;
        case 1:
            next();
            break;
        case 2:
            // (req, res) => {}
            try {
                if (isAsyncFunction(fn)) {
                    await fn(req, res);
                }
                else {
                    fn(req, res);
                }
                if (!res.headersSent) {
                    next();
                }
            }
            catch (err) {
                next(err);
            }
            break;
        case 3:
            // (req, res, next) => {}
            fn(req, res, next);
            break;
        default:
            next();
            break;
    }
};
const express = require("express");
const path = require("path");
const fs = require("fs");
function ExpressStaticFallback(folder) {
    const handler = express.static(folder);
    let defaultHandler = (req, res) => {
        res.status(404 /* NotFound */).end("not found");
    };
    const indexFile = path.join(folder, "index.html");
    if (fs.existsSync(indexFile)) {
        defaultHandler = (req, res) => {
            res.sendFile(indexFile);
        };
    }
    return (req, res, next) => {
        const ext = path.extname(req.url);
        if (ext) {
            handler(req, res, next);
        }
        else {
            defaultHandler(req, res);
        }
    };
}
exports.ExpressStaticFallback = ExpressStaticFallback;
