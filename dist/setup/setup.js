"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../service/service");
const config_1 = require("../config");
const mongodb_1 = require("../lib/mongodb");
const ctx_bll_1 = require("../ext/ctx.bll");
const ev_bll_1 = require("../ext/ev.bll");
const org_dal_mongo_1 = require("../org/org.dal.mongo");
const auth_dal_mongo_1 = require("../auth/auth.dal.mongo");
const todo_dal_mongo_1 = require("../todo/todo.dal.mongo");
const service_dal_mongo_1 = require("../service/service.dal.mongo");
const customer_dal_mongo_1 = require("../customer/customer.dal.mongo");
const location_dal_mongo_1 = require("../location/location.dal.mongo");
const product_dal_mongo_1 = require("../product/product.dal.mongo");
const order_dal_mongo_1 = require("../order/order.dal.mongo");
const job_dal_mongo_1 = require("../job/job.dal.mongo");
const inventory_dal_mongo_1 = require("../inventory/inventory.dal.mongo");
const accounting_dal_mongo_1 = require("../accounting/accounting.dal.mongo");
function sampleServices(type, count = 3) {
    const now = Date.now();
    const services = [];
    for (let i = 1; i <= count; i++) {
        services.push({
            id: `${type}_${i}`,
            code: `${type}_${i}`,
            price: 100000,
            origin_price: 10000,
            name: `Dịch vụ ${type} ${i}`,
            type,
            ctime: now,
            mtime: now,
        });
    }
    return services;
}
async function SetupSampleData() {
    const config = await config_1.ReadConfig();
    console.log(new Date(), config);
    const client = await mongodb_1.MongoCommon.Connect(config.database.db_url, { replica: true });
    console.log(new Date(), 'connected to database');
    const database = client.db(config.database.db_name);
    /******************************************************* */
    const contextBLL = new ctx_bll_1.ContextBLLBase(client);
    const eventBLL = new ev_bll_1.EventBLLBase(database, contextBLL);
    await eventBLL.init();
    // org
    const orgDAL = new org_dal_mongo_1.OrgDALMongo(database);
    await orgDAL.init();
    // auth
    const userAuthDAL = new auth_dal_mongo_1.UserAuthDALMongo(database);
    await userAuthDAL.init();
    // 
    const todoDAL = new todo_dal_mongo_1.TodoDALMongo(database);
    await todoDAL.init();
    // service
    const serviceDAL = new service_dal_mongo_1.ServiceDALMongo(database);
    await serviceDAL.init();
    // customer
    const customerDAL = new customer_dal_mongo_1.CustomerDALMongo(database);
    await customerDAL.init();
    // location
    const locationDAL = new location_dal_mongo_1.LocationDALMongo(database);
    await locationDAL.init();
    // product
    const productDAL = new product_dal_mongo_1.ProductDALMongo(database);
    await productDAL.init();
    // order
    const orderDAL = new order_dal_mongo_1.OrderDALMongo(database);
    await orderDAL.init();
    // job
    const jobDAL = new job_dal_mongo_1.JobDALMongo(database);
    await jobDAL.init();
    // warehouse
    const wareHouseDAL = new inventory_dal_mongo_1.InventoryDALMongo(database);
    await wareHouseDAL.init();
    // accounting
    const accountingDAL = new accounting_dal_mongo_1.AccountingDALMongo(database);
    await accountingDAL.init();
    /******************************************************* */
    const services = [
        ...sampleServices(service_1.ServiceNS.Type.Exam),
        ...sampleServices(service_1.ServiceNS.Type.Test),
        ...sampleServices(service_1.ServiceNS.Type.Other)
    ];
    await Promise.all(services.map(s => serviceDAL.CreateService(s)));
    console.log(new Date(), `created ${services.length} services`);
    console.log(new Date(), `setup finished`);
}
module.exports = {
    SetupSampleData,
};
//# sourceMappingURL=setup.js.map