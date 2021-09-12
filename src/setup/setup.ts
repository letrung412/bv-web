import { ServiceNS } from "../service/service";
import { LocationNS } from "../location/location";
import { ReadConfig } from "../config";
import { MongoCommon } from "../lib/mongodb";
import { ContextBLLBase } from "../ext/ctx.bll";
import { EventBLLBase } from "../ext/ev.bll";
import { OrgDALMongo } from "../org/org.dal.mongo";
import { UserAuthDALMongo } from "../auth/auth.dal.mongo";
import { TodoDALMongo } from "../todo/todo.dal.mongo";
import { ServiceDALMongo } from "../service/service.dal.mongo";
import { CustomerDALMongo } from "../customer/customer.dal.mongo";
import { LocationDALMongo } from "../location/location.dal.mongo";
import { ProductDALMongo } from "../product/product.dal.mongo";
import { OrderDALMongo } from "../order/order.dal.mongo";
import { JobDALMongo } from "../job/job.dal.mongo";
import { InventoryDALMongo } from "../inventory/inventory.dal.mongo";
import { AccountingDALMongo } from "../accounting/accounting.dal.mongo";

function sampleServices(type: ServiceNS.Type, count = 3) {
    const now = Date.now();
    const services: ServiceNS.Service[] = [];
    for (let i = 1; i <= count; i++) {
        services.push({
            id: `${type}_${i}`,
            code: `${type}_${i}`,
            price: 100000,
            origin_price : 10000,
            name: `Dịch vụ ${type} ${i}`,
            type,
            ctime: now,
            mtime: now,
        });
    }
    return services;
}

async function SetupSampleData() {
    const config = await ReadConfig();
    console.log(new Date(), config);
    const client = await MongoCommon.Connect(config.database.db_url, { replica: true });
    console.log(new Date(), 'connected to database');
    const database = client.db(config.database.db_name);
    /******************************************************* */
    const contextBLL = new ContextBLLBase(client);
    const eventBLL = new EventBLLBase(database, contextBLL);
    await eventBLL.init();
    // org
    const orgDAL = new OrgDALMongo(database);
    await orgDAL.init();
    // auth
    const userAuthDAL = new UserAuthDALMongo(database);
    await userAuthDAL.init();
    // 
    const todoDAL = new TodoDALMongo(database);
    await todoDAL.init();
    // service
    const serviceDAL = new ServiceDALMongo(database);
    await serviceDAL.init();
    // customer
    const customerDAL = new CustomerDALMongo(database);
    await customerDAL.init();

    // location
    const locationDAL = new LocationDALMongo(database);
    await locationDAL.init();
    // product
    const productDAL = new ProductDALMongo(database);
    await productDAL.init();
    // order
    const orderDAL = new OrderDALMongo(database);
    await orderDAL.init();
    // job
    const jobDAL = new JobDALMongo(database);
    await jobDAL.init();
    // warehouse
    const wareHouseDAL = new InventoryDALMongo(database);
    await wareHouseDAL.init();
    // accounting
    const accountingDAL = new AccountingDALMongo(database);
    await accountingDAL.init();


    /******************************************************* */
    const services = [
        ...sampleServices(ServiceNS.Type.Exam),
        ...sampleServices(ServiceNS.Type.Test),
        ...sampleServices(ServiceNS.Type.Other)
    ];
    await Promise.all(services.map(s => serviceDAL.CreateService(s)));
    console.log(new Date(), `created ${services.length} services`);
    console.log(new Date(), `setup finished`);
}

module.exports = {
    SetupSampleData,
}
