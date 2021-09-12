"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationNS = void 0;
const rand_1 = require("../lib/rand");
var LocationNS;
(function (LocationNS) {
    LocationNS.Errors = {
        ErrLocationNotFound: new Error("Location not found!"),
        ErrTypeNotFound: new Error("LocationType not found!")
    };
    LocationNS.Generator = {
        NewLocationId: () => rand_1.default.uppercase(10),
        NewLocationTypeId: () => rand_1.default.uppercase(8), // collision 2^20
    };
})(LocationNS = exports.LocationNS || (exports.LocationNS = {}));
//# sourceMappingURL=location.js.map