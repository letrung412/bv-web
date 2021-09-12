import { ReadConfig } from "./config";
import * as express from "express";
import "./lib/express";
import "./ext/log";
import * as cors from "cors";
import { UserAuthDALMongo } from "./auth/auth.dal.mongo";
import { UserAuthBLLBase } from "./auth/auth.bll.base";
import { NewAuthAPI } from "./auth/auth.api";
import { TodoDALMongo } from "./todo/todo.dal.mongo";
import { TodoBLLBase } from "./todo/todo.bll.base";
import { CustomerDALMongo } from "./customer/customer.dal.mongo";
import { CustomerBLLBase } from "./customer/customer.bll.base";
import { NewTodoAPI } from "./todo/todo.api";
import { NewCustomerAPI } from "./customer/customer.api";

import { NewAccountingAPI } from "./accounting/accounting.api";
import { AccountingBLLBase } from "./accounting/accounting.bll.base";
import { AccountingDALMongo } from "./accounting/accounting.dal.mongo";

import { NewServiceAPI } from './service/service.api';
import { ServiceBLLBase } from './service/service.bll.base'
import { ServiceDALMongo } from './service/service.dal.mongo';

import { NewOrgAPI } from "./org/org.api";
import { OrgBLLBase } from "./org/org.bll.base";
import { OrgDALMongo } from "./org/org.dal.mongo";

import { NewOrderAPI } from "./order/order.api";
import { OrderDALMongo } from "./order/order.dal.mongo";
import { OrderBLLBase } from "./order/order.bll.base";

import { JobDALMongo } from "./job/job.dal.mongo";
import { JobBLLBase } from "./job/job.bll.base";
import { NewJobAPI } from "./job/job.api";

import { NewLocationAPI } from "./location/location.api";
import { LocationBLLBase } from "./location/location.bll.base";
import { LocationDALMongo } from "./location/location.dal.mongo";

import { NewProductAPI } from './product/product.api';
import { ProductBLLBase } from './product/product.bll.base';
import { ProductDALMongo } from './product/product.dal.mongo';
import { MongoCommon } from "./lib/mongodb";
import { ContextBLLBase } from "./ext/ctx.bll";
import { EventBLLBase } from "./ext/ev.bll";

import { NewInventoryAPI } from './inventory/inventory.api';
import { InventoryBLLBase } from './inventory/inventory.bll.base';
import { InventoryDALMongo } from './inventory/inventory.dal.mongo';
import { HttpErrorHandler } from "./common/http_errror_handler";
import { RegisterGlobalEventHandlers } from "./common/global_ev_handlers";
import { ExpressStaticFallback } from "./lib/express";
import { RegionDALMongo } from "./region/region.dal.mongo";
import { RegionBLLBase } from "./region/region.bll.base";
import { NewAPIRegion } from "./region/region.api";
import { NewAPIReport } from "./report/report.api";
import { ReportDALMongo } from "./report/report.dal.mongo";
import { ReportBLLBase } from "./report/report.bll.base";
import { RetailDALMongo } from "./retail/retail.dal.mongo";
import { RetailBLLBase } from "./retail/retail.bll.base";
import { NewOrderRetailAPI } from "./retail/retail.api";
import { SampleDALMongo } from "./sample/sample.dal.mongo";
import { SampleBLLBase } from "./sample/sample.bll.base";
import { NewSampleAI } from "./sample/sample.api";
import { UploadDALMongo } from "./upload/upload.dal.mongo";
import { UploadBLLBase } from "./upload/upload.bll.base";
import { NewAPIUpload } from "./upload/upload.api";

async function main() {
  const config = await ReadConfig();
  console.log(config);
  const client = await MongoCommon.Connect(config.database.db_url, { replica: true });
  console.log('connected to database');
  const database = client.db(config.database.db_name);
  /******************************************************* */
  const contextBLL = new ContextBLLBase(client);
  const eventBLL = new EventBLLBase(database, contextBLL);
  await eventBLL.init();
  // 
  const todoDAL = new TodoDALMongo(database);
  await todoDAL.init();
  const todoBLL = new TodoBLLBase(todoDAL);
  await todoBLL.init();
  // service
  const serviceDAL = new ServiceDALMongo(database);
  await serviceDAL.init();
  const serviceBLL = new ServiceBLLBase(serviceDAL);
  await serviceBLL.init();
  // customer
  const customerDAL = new CustomerDALMongo(database);
  await customerDAL.init();
  const customerBLL = new CustomerBLLBase(customerDAL);
  await customerBLL.init();
  // org
  const orgDAL = new OrgDALMongo(database);
  await orgDAL.init();
  const orgBLL = new OrgBLLBase(orgDAL, customerDAL);
  await orgBLL.init();
  // auth
  const userAuthDAL = new UserAuthDALMongo(database);
  await userAuthDAL.init();
  const userAuthBLL = new UserAuthBLLBase(userAuthDAL, orgBLL);
  await userAuthBLL.init();
  // location
  const locationDAL = new LocationDALMongo(database);
  await locationDAL.init();
  const locationBLL = new LocationBLLBase(locationDAL, serviceBLL);
  await locationBLL.init();
  // product
  const productDAL = new ProductDALMongo(database);
  await productDAL.init();
  const productBLL = new ProductBLLBase(productDAL);
  await productBLL.init();
  // order
  const orderDAL = new OrderDALMongo(database);
  await orderDAL.init();
  const orderBLL = new OrderBLLBase(
    orderDAL, contextBLL, eventBLL,
    serviceBLL, customerBLL, productBLL
  );
  await orderBLL.init();

  //upload
  const uploadDAL = new UploadDALMongo(database);
  await uploadDAL.init();
  const uploadBLL = new UploadBLLBase(uploadDAL);
  await uploadBLL.init();

  // job
  const jobDAL = new JobDALMongo(database);
  await jobDAL.init();
  const jobBLL = new JobBLLBase(jobDAL, contextBLL,locationBLL, customerBLL ,serviceBLL, orderBLL, uploadBLL);
  await jobBLL.init();
  
  //retail
  const retailDAL = new RetailDALMongo(database);
  await retailDAL.init();
  const retailBLL = new RetailBLLBase(retailDAL, contextBLL, eventBLL, productBLL);
  await retailBLL.init();
  // inventory
  const inventoryDAL = new InventoryDALMongo(database);
  await inventoryDAL.init();
  const inventoryBLL = new InventoryBLLBase(inventoryDAL, contextBLL, productBLL, orderBLL, retailBLL, jobBLL);
  await inventoryBLL.init();
  // accounting
  const accountingDAL = new AccountingDALMongo(database);
  await accountingDAL.init();
  const accountingBLL = new AccountingBLLBase(accountingDAL, contextBLL, orderBLL, retailBLL, orgBLL);
  await accountingBLL.init();

  //region
  const regionDAL = new RegionDALMongo(database);
  await regionDAL.init();
  const regionBLL = new RegionBLLBase(regionDAL);
  await regionBLL.init();

  //report
  const reportDAL = new ReportDALMongo(database);
  await reportDAL.init();
  const reportBLL = new ReportBLLBase(reportDAL, orgBLL, orderBLL, customerBLL);
  await reportBLL.init();
  
  //sample
  const sampleDAL = new SampleDALMongo(database);
  await sampleDAL.init();
  const sampleBLL = new SampleBLLBase(sampleDAL,jobBLL,orderBLL,contextBLL,);
  await sampleBLL.init();
  /******************************************************* */

  /****************************************************** */
  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth/', NewAuthAPI(userAuthBLL));
  app.use('/api/location/', NewLocationAPI(userAuthBLL, locationBLL));
  app.use("/api/org", NewOrgAPI(userAuthBLL, orgBLL))
  app.use('/api/service', NewServiceAPI(userAuthBLL, serviceBLL));
  app.use("/api/customer/", NewCustomerAPI(userAuthBLL, customerBLL));
  app.use('/api/todo/', NewTodoAPI(userAuthBLL, todoBLL));
  app.use("/api/order", NewOrderAPI(userAuthBLL, orderBLL, jobBLL, orgBLL));
  app.use('/api/location/', NewLocationAPI(userAuthBLL, locationBLL));
  app.use('/api/product/', NewProductAPI(userAuthBLL, productBLL));
  app.use("/api/job", NewJobAPI(userAuthBLL, jobBLL, serviceBLL));
  app.use('/api/inventory/', NewInventoryAPI(userAuthBLL, inventoryBLL));
  app.use('/api/accounting', NewAccountingAPI(userAuthBLL, accountingBLL, jobBLL, orgBLL));
  app.use("/api/region/", NewAPIRegion(regionBLL));
  app.use("/api/report/", NewAPIReport(reportBLL));
  app.use("/api/retail" , NewOrderRetailAPI(retailBLL));
  app.use("/api/sample" , NewSampleAI(sampleBLL));
  app.use("/api/data", NewAPIUpload(uploadBLL));
  /****************************************************** */
  app.use("/", ExpressStaticFallback(config.app.dir));
  app.use(HttpErrorHandler);
  
  console.log(`listen on ${config.server.port}`);
  app.listen(config.server.port, "0.0.0.0", () => {
    const err = arguments[0];
    if (err) {
      console.log(err);
    }
  });
  /****************************************************** */
  RegisterGlobalEventHandlers(
    eventBLL, orderBLL, jobBLL,
  );
}

const isSetup = process.argv[2] === 'setup';

if (isSetup) {
  console.log('in setup mode');
  require('./setup/setup').SetupSampleData().catch(console.log);
} else {
  main().catch(console.log);
}


