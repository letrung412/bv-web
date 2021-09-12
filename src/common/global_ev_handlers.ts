import { EventNS } from "../ext/ev";
import { OrderNS } from "../order/order";
import { JobNS } from "../job/job";

export function RegisterGlobalEventHandlers(
    evBLL: EventNS.BLL,
    orderBLL: OrderNS.BLL,
    jobBLL: JobNS.BLL,
) {
    evBLL.On(EventNS.Type.OrderPaid, async (ctx, payload) => {
        const { order_id } = payload;
        console.log(`order [${order_id}] paid`);
        const order = await orderBLL.GetOrder(ctx, order_id);
        if (order.ref === "job_step") {
            const job_step_id = order.ref_id;
            await jobBLL.UpdateStep(ctx, job_step_id, {
                status: JobNS.StepStatus.Ready,
            });
        }
    });
    evBLL.On(EventNS.Type.OrderDone, async (ctx, payload) => {
        const { order_id } = payload;
        console.log(`order [${order_id}] done`);
    });
}