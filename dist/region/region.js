"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionNS = void 0;
const rand_1 = require("../lib/rand");
var RegionNS;
(function (RegionNS) {
    let Type;
    (function (Type) {
        Type["province"] = "province";
        Type["district"] = "district";
        Type["ward"] = "ward";
    })(Type = RegionNS.Type || (RegionNS.Type = {}));
    RegionNS.Errors = {
        RegionNotFound: new Error("Region not found")
    };
    RegionNS.Generator = {
        NewRegionId: () => rand_1.default.alphabet(12)
    };
})(RegionNS = exports.RegionNS || (exports.RegionNS = {}));
