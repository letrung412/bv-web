"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadNS = void 0;
const rand_1 = require("../lib/rand");
var UploadNS;
(function (UploadNS) {
    let Type;
    (function (Type) {
        Type["Image"] = "image";
    })(Type = UploadNS.Type || (UploadNS.Type = {}));
    UploadNS.Generator = {
        NewDataId: () => rand_1.default.number(12)
    };
    UploadNS.Errors = {
        ErrDataNotFound: new Error("Image not found"),
        ErrDataIdExisted: new Error("Image ID Existed"),
        ErrDataType: new Error("Data type only jpg/jpeg/png")
    };
})(UploadNS = exports.UploadNS || (exports.UploadNS = {}));
//# sourceMappingURL=upload.js.map