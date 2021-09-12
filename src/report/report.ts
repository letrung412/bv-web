import { CustomerNS } from "../customer/customer";
import { OrderNS } from "../order/order";
import { OrgNS } from "../org/org";

export namespace ReportNS {
   export enum Interval {
      Day = "day",
      Month = "month"
   }

   export namespace Revenue {
      export interface Input {
         time: [number, number];
         interval: Interval;
      }

      export interface Output {
         time: string;
         amount: number;
      }

      export interface InputByUser extends Input {

      }

      export interface OutputByUser extends Output {
         user_id: string;
         user?: OrgNS.User;
      }
   }

   export interface BLL {
      Revenue(input: Revenue.Input): Promise<Revenue.Output[]>;
      RevenueByUser(input: Revenue.InputByUser): Promise<Revenue.OutputByUser[]>;
   }

   export interface DAL {
      Revenue(input: Revenue.Input): Promise<Revenue.Output[]>;
      RevenueByUser(input: Revenue.InputByUser): Promise<Revenue.OutputByUser[]>;
   }
}