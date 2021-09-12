import { CustomerNS } from "../customer/customer";
import { ContextNS } from "../ext/ctx";
import { OrderNS } from "../order/order";
import { OrgNS } from "../org/org";
import { ReportNS } from "./report";

export class ReportBLLBase implements ReportNS.BLL {
    constructor(
        private dal: ReportNS.DAL,
        private orgBLL: OrgNS.BLL,
        private orderBLL: OrderNS.BLL,
        private customerBLL: CustomerNS.BLL,
    ) { }

    async init() { }

    async Revenue(input: ReportNS.Revenue.Input) {
        const docs = await this.dal.Revenue(input);
        return docs;
    }

    async RevenueByUser(input: ReportNS.Revenue.Input) {
        const docs = await this.dal.RevenueByUser(input);
        for (const d of docs) {
            d.user = await this.orgBLL.GetUser(d.user_id);
        }
        return docs;
    }
}
