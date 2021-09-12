"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductNS = void 0;
const rand_1 = require("../lib/rand");
var ProductNS;
(function (ProductNS) {
    ProductNS.Errors = {
        ErrProducerNotFound: new Error("Producer not found!"),
        ErrPartNotFound: new Error("Part not found!"),
        ErrProductNotFound: new Error("Product not found!"),
        ErrProductPartExist: new Error("Product part exist")
    };
    ProductNS.Generator = {
        NewProducerId: () => rand_1.default.uppercase(10),
        NewPartId: () => rand_1.default.uppercase(12),
        NewProductId: () => rand_1.default.uppercase(12), // collision 2^30
    };
})(ProductNS = exports.ProductNS || (exports.ProductNS = {}));
