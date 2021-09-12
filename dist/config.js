"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadConfig = void 0;
const path = require("path");
const dotenv = require("dotenv");
async function ReadConfig() {
    dotenv.config();
    const resolvedir = (dir) => dir ? path.resolve(process.cwd(), dir) : undefined;
    const config = {
        server: {
            port: +process.env.PORT || 3000,
        },
        database: {
            db_url: process.env.DB_URL,
            db_name: process.env.DB_NAME,
        },
        app: {
            dir: resolvedir("../backend/build"),
        },
        upload: {
            path: process.env.UPLOAD_PATH
        }
    };
    Object.defineProperty(config.database, 'db_url', {
        enumerable: false
    });
    return config;
}
exports.ReadConfig = ReadConfig;
//# sourceMappingURL=config.js.map