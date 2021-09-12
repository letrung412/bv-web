"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBLLBase = void 0;
class ReportBLLBase {
    constructor(dal, orgBLL, orderBLL, customerBLL) {
        this.dal = dal;
        this.orgBLL = orgBLL;
        this.orderBLL = orderBLL;
        this.customerBLL = customerBLL;
    }
    async init() { }
    async Revenue(input) {
        const docs = await this.dal.Revenue(input);
        return docs;
    }
    async RevenueByUser(input) {
        const docs = await this.dal.RevenueByUser(input);
        for (const d of docs) {
            d.user = await this.orgBLL.GetUser(d.user_id);
        }
        return docs;
    }
}
exports.ReportBLLBase = ReportBLLBase;
