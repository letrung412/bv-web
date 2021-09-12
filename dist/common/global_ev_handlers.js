"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterGlobalEventHandlers = void 0;
const job_1 = require("../job/job");
function RegisterGlobalEventHandlers(evBLL, orderBLL, jobBLL) {
    evBLL.On("order_paid" /* OrderPaid */, async (ctx, payload) => {
        const { order_id } = payload;
        console.log(`order [${order_id}] paid`);
        const order = await orderBLL.GetOrder(ctx, order_id);
        if (order.ref === "job_step") {
            const job_step_id = order.ref_id;
            await jobBLL.UpdateStep(ctx, job_step_id, {
                status: job_1.JobNS.StepStatus.Ready,
            });
        }
    });
    evBLL.On("order_done" /* OrderDone */, async (ctx, payload) => {
        const { order_id } = payload;
        console.log(`order [${order_id}] done`);
    });
}
exports.RegisterGlobalEventHandlers = RegisterGlobalEventHandlers;
//# sourceMappingURL=global_ev_handlers.js.map