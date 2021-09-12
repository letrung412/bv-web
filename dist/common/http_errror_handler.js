"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorHandler = void 0;
const job_1 = require("../job/job");
const customer_1 = require("../customer/customer");
const order_1 = require("../order/order");
const service_1 = require("../service/service");
const product_1 = require("../product/product");
const location_1 = require("../location/location");
const org_1 = require("../org/org");
const inventory_1 = require("../inventory/inventory");
const accounting_1 = require("../accounting/accounting");
const http_1 = require("../lib/http");
const sample_1 = require("../sample/sample");
const upload_1 = require("../upload/upload");
const retail_1 = require("../retail/retail");
const region_1 = require("../region/region");
const commonErrors = new Set([
    ...Object.values(job_1.JobNS.Errors),
    ...Object.values(customer_1.CustomerNS.Errors),
    ...Object.values(order_1.OrderNS.Errors),
    ...Object.values(service_1.ServiceNS.Errors),
    ...Object.values(product_1.ProductNS.Errors),
    ...Object.values(location_1.LocationNS.Errors),
    ...Object.values(org_1.OrgNS.Errors),
    ...Object.values(inventory_1.InventoryNS.Errors),
    ...Object.values(accounting_1.AccountingNS.Errors),
    ...Object.values(sample_1.SampleNS.Errors),
    ...Object.values(upload_1.UploadNS.Errors),
    ...Object.values(retail_1.RetailNS.Errors),
    ...Object.values(region_1.RegionNS.Errors)
]);
function HttpErrorHandler(err, req, res, next) {
    if (commonErrors.has(err)) {
        err = new http_1.HttpError(err.message, 400 /* BadRequest */);
    }
    if (err && typeof err.HttpStatusCode === "function") {
        const message = err.message;
        res.status(err.HttpStatusCode() || 500).json({
            error: message,
        });
        return;
    }
    console.log(err);
    res.status(500).send({
        error: "internal server error",
    });
}
exports.HttpErrorHandler = HttpErrorHandler;
//# sourceMappingURL=http_errror_handler.js.map