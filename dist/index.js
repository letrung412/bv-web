"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const express = require("express");
require("./lib/express");
require("./ext/log");
const cors = require("cors");
const auth_dal_mongo_1 = require("./auth/auth.dal.mongo");
const auth_bll_base_1 = require("./auth/auth.bll.base");
const auth_api_1 = require("./auth/auth.api");
const todo_dal_mongo_1 = require("./todo/todo.dal.mongo");
const todo_bll_base_1 = require("./todo/todo.bll.base");
const customer_dal_mongo_1 = require("./customer/customer.dal.mongo");
const customer_bll_base_1 = require("./customer/customer.bll.base");
const todo_api_1 = require("./todo/todo.api");
const customer_api_1 = require("./customer/customer.api");
const accounting_api_1 = require("./accounting/accounting.api");
const accounting_bll_base_1 = require("./accounting/accounting.bll.base");
const accounting_dal_mongo_1 = require("./accounting/accounting.dal.mongo");
const service_api_1 = require("./service/service.api");
const service_bll_base_1 = require("./service/service.bll.base");
const service_dal_mongo_1 = require("./service/service.dal.mongo");
const org_api_1 = require("./org/org.api");
const org_bll_base_1 = require("./org/org.bll.base");
const org_dal_mongo_1 = require("./org/org.dal.mongo");
const order_api_1 = require("./order/order.api");
const order_dal_mongo_1 = require("./order/order.dal.mongo");
const order_bll_base_1 = require("./order/order.bll.base");
const job_dal_mongo_1 = require("./job/job.dal.mongo");
const job_bll_base_1 = require("./job/job.bll.base");
const job_api_1 = require("./job/job.api");
const location_api_1 = require("./location/location.api");
const location_bll_base_1 = require("./location/location.bll.base");
const location_dal_mongo_1 = require("./location/location.dal.mongo");
const product_api_1 = require("./product/product.api");
const product_bll_base_1 = require("./product/product.bll.base");
const product_dal_mongo_1 = require("./product/product.dal.mongo");
const mongodb_1 = require("./lib/mongodb");
const ctx_bll_1 = require("./ext/ctx.bll");
const ev_bll_1 = require("./ext/ev.bll");
const inventory_api_1 = require("./inventory/inventory.api");
const inventory_bll_base_1 = require("./inventory/inventory.bll.base");
const inventory_dal_mongo_1 = require("./inventory/inventory.dal.mongo");
const http_errror_handler_1 = require("./common/http_errror_handler");
const global_ev_handlers_1 = require("./common/global_ev_handlers");
const express_1 = require("./lib/express");
const region_dal_mongo_1 = require("./region/region.dal.mongo");
const region_bll_base_1 = require("./region/region.bll.base");
const region_api_1 = require("./region/region.api");
const report_api_1 = require("./report/report.api");
const report_dal_mongo_1 = require("./report/report.dal.mongo");
const report_bll_base_1 = require("./report/report.bll.base");
const retail_dal_mongo_1 = require("./retail/retail.dal.mongo");
const retail_bll_base_1 = require("./retail/retail.bll.base");
const retail_api_1 = require("./retail/retail.api");
const sample_dal_mongo_1 = require("./sample/sample.dal.mongo");
const sample_bll_base_1 = require("./sample/sample.bll.base");
const sample_api_1 = require("./sample/sample.api");
const upload_dal_mongo_1 = require("./upload/upload.dal.mongo");
const upload_bll_base_1 = require("./upload/upload.bll.base");
const upload_api_1 = require("./upload/upload.api");
async function main() {
    const config = await config_1.ReadConfig();
    console.log(config);
    const client = await mongodb_1.MongoCommon.Connect(config.database.db_url, { replica: true });
    console.log('connected to database');
    const database = client.db(config.database.db_name);
    /******************************************************* */
    const contextBLL = new ctx_bll_1.ContextBLLBase(client);
    const eventBLL = new ev_bll_1.EventBLLBase(database, contextBLL);
    await eventBLL.init();
    // 
    const todoDAL = new todo_dal_mongo_1.TodoDALMongo(database);
    await todoDAL.init();
    const todoBLL = new todo_bll_base_1.TodoBLLBase(todoDAL);
    await todoBLL.init();
    // service
    const serviceDAL = new service_dal_mongo_1.ServiceDALMongo(database);
    await serviceDAL.init();
    const serviceBLL = new service_bll_base_1.ServiceBLLBase(serviceDAL);
    await serviceBLL.init();
    // customer
    const customerDAL = new customer_dal_mongo_1.CustomerDALMongo(database);
    await customerDAL.init();
    const customerBLL = new customer_bll_base_1.CustomerBLLBase(customerDAL);
    await customerBLL.init();
    // org
    const orgDAL = new org_dal_mongo_1.OrgDALMongo(database);
    await orgDAL.init();
    const orgBLL = new org_bll_base_1.OrgBLLBase(orgDAL, customerDAL);
    await orgBLL.init();
    // auth
    const userAuthDAL = new auth_dal_mongo_1.UserAuthDALMongo(database);
    await userAuthDAL.init();
    const userAuthBLL = new auth_bll_base_1.UserAuthBLLBase(userAuthDAL, orgBLL);
    await userAuthBLL.init();
    // location
    const locationDAL = new location_dal_mongo_1.LocationDALMongo(database);
    await locationDAL.init();
    const locationBLL = new location_bll_base_1.LocationBLLBase(locationDAL, serviceBLL);
    await locationBLL.init();
    // product
    const productDAL = new product_dal_mongo_1.ProductDALMongo(database);
    await productDAL.init();
    const productBLL = new product_bll_base_1.ProductBLLBase(productDAL);
    await productBLL.init();
    // order
    const orderDAL = new order_dal_mongo_1.OrderDALMongo(database);
    await orderDAL.init();
    const orderBLL = new order_bll_base_1.OrderBLLBase(orderDAL, contextBLL, eventBLL, serviceBLL, customerBLL, productBLL);
    await orderBLL.init();
    //upload
    const uploadDAL = new upload_dal_mongo_1.UploadDALMongo(database);
    await uploadDAL.init();
    const uploadBLL = new upload_bll_base_1.UploadBLLBase(uploadDAL);
    await uploadBLL.init();
    // job
    const jobDAL = new job_dal_mongo_1.JobDALMongo(database);
    await jobDAL.init();
    const jobBLL = new job_bll_base_1.JobBLLBase(jobDAL, contextBLL, locationBLL, customerBLL, serviceBLL, orderBLL, uploadBLL);
    await jobBLL.init();
    //retail
    const retailDAL = new retail_dal_mongo_1.RetailDALMongo(database);
    await retailDAL.init();
    const retailBLL = new retail_bll_base_1.RetailBLLBase(retailDAL, contextBLL, eventBLL, productBLL);
    await retailBLL.init();
    // inventory
    const inventoryDAL = new inventory_dal_mongo_1.InventoryDALMongo(database);
    await inventoryDAL.init();
    const inventoryBLL = new inventory_bll_base_1.InventoryBLLBase(inventoryDAL, contextBLL, productBLL, orderBLL, retailBLL, jobBLL);
    await inventoryBLL.init();
    // accounting
    const accountingDAL = new accounting_dal_mongo_1.AccountingDALMongo(database);
    await accountingDAL.init();
    const accountingBLL = new accounting_bll_base_1.AccountingBLLBase(accountingDAL, contextBLL, orderBLL, retailBLL, orgBLL);
    await accountingBLL.init();
    //region
    const regionDAL = new region_dal_mongo_1.RegionDALMongo(database);
    await regionDAL.init();
    const regionBLL = new region_bll_base_1.RegionBLLBase(regionDAL);
    await regionBLL.init();
    //report
    const reportDAL = new report_dal_mongo_1.ReportDALMongo(database);
    await reportDAL.init();
    const reportBLL = new report_bll_base_1.ReportBLLBase(reportDAL, orgBLL, orderBLL, customerBLL);
    await reportBLL.init();
    //sample
    const sampleDAL = new sample_dal_mongo_1.SampleDALMongo(database);
    await sampleDAL.init();
    const sampleBLL = new sample_bll_base_1.SampleBLLBase(sampleDAL, jobBLL, orderBLL, contextBLL);
    await sampleBLL.init();
    /******************************************************* */
    /****************************************************** */
    const app = express();
    app.disable("x-powered-by");
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth/', auth_api_1.NewAuthAPI(userAuthBLL));
    app.use('/api/location/', location_api_1.NewLocationAPI(userAuthBLL, locationBLL));
    app.use("/api/org", org_api_1.NewOrgAPI(userAuthBLL, orgBLL));
    app.use('/api/service', service_api_1.NewServiceAPI(userAuthBLL, serviceBLL));
    app.use("/api/customer/", customer_api_1.NewCustomerAPI(userAuthBLL, customerBLL));
    app.use('/api/todo/', todo_api_1.NewTodoAPI(userAuthBLL, todoBLL));
    app.use("/api/order", order_api_1.NewOrderAPI(userAuthBLL, orderBLL, jobBLL, orgBLL));
    app.use('/api/location/', location_api_1.NewLocationAPI(userAuthBLL, locationBLL));
    app.use('/api/product/', product_api_1.NewProductAPI(userAuthBLL, productBLL));
    app.use("/api/job", job_api_1.NewJobAPI(userAuthBLL, jobBLL, serviceBLL));
    app.use('/api/inventory/', inventory_api_1.NewInventoryAPI(userAuthBLL, inventoryBLL));
    app.use('/api/accounting', accounting_api_1.NewAccountingAPI(userAuthBLL, accountingBLL, jobBLL, orgBLL));
    app.use("/api/region/", region_api_1.NewAPIRegion(regionBLL));
    app.use("/api/report/", report_api_1.NewAPIReport(reportBLL));
    app.use("/api/retail", retail_api_1.NewOrderRetailAPI(retailBLL));
    app.use("/api/sample", sample_api_1.NewSampleAI(sampleBLL));
    app.use("/api/data", upload_api_1.NewAPIUpload(uploadBLL));
    /****************************************************** */
    app.use("/", express_1.ExpressStaticFallback(config.app.dir));
    app.use(http_errror_handler_1.HttpErrorHandler);
    console.log(`listen on ${config.server.port}`);
    app.listen(config.server.port, "0.0.0.0", () => {
        const err = arguments[0];
        if (err) {
            console.log(err);
        }
    });
    /****************************************************** */
    global_ev_handlers_1.RegisterGlobalEventHandlers(eventBLL, orderBLL, jobBLL);
}
const isSetup = process.argv[2] === 'setup';
if (isSetup) {
    console.log('in setup mode');
    require('./setup/setup').SetupSampleData().catch(console.log);
}
else {
    main().catch(console.log);
}
