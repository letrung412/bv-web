import { JobNS } from "../job/job";
import { CustomerNS } from "../customer/customer";
import { OrderNS } from "../order/order";
import { ServiceNS } from "../service/service";
import { ProductNS } from "../product/product";
import { LocationNS } from "../location/location";
import { OrgNS } from "../org/org";
import { InventoryNS } from "../inventory/inventory";
import { AccountingNS } from "../accounting/accounting";
import { HttpError, HttpStatusCodes } from "../lib/http";
import { SampleNS } from "../sample/sample";
import { UploadNS } from "../upload/upload";
import { RetailNS } from "../retail/retail";
import { RegionNS } from "../region/region";

const commonErrors = new Set([
    ...Object.values(JobNS.Errors),
    ...Object.values(CustomerNS.Errors),
    ...Object.values(OrderNS.Errors),
    ...Object.values(ServiceNS.Errors),
    ...Object.values(ProductNS.Errors),
    ...Object.values(LocationNS.Errors),
    ...Object.values(OrgNS.Errors),
    ...Object.values(InventoryNS.Errors),
    ...Object.values(AccountingNS.Errors),
    ...Object.values(SampleNS.Errors),
    ...Object.values(UploadNS.Errors),
    ...Object.values(RetailNS.Errors),
    ...Object.values(RegionNS.Errors)
]);

export function HttpErrorHandler(err, req, res, next) {
    if (commonErrors.has(err)) {
        err = new HttpError(err.message, HttpStatusCodes.BadRequest);
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