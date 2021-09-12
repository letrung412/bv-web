import { ContextNS } from "../ext/ctx";
import { ServiceNS } from "../service/service";
import rand from "../lib/rand";
export namespace SampleNS {
    export interface Sample {
        id : string;
        order_id : string;
        status : "done" | "cancel";
        services? : ServiceNS.Service[];
        device? : Device;
        result? : Object;
        ctime : number;
        mtime : number;
    }

    export enum Device {
        BS200E = "BS-200E",
        UA66 = "UA-66",
        BC2800 = "BC-2800",
        Test = "Test",
        Immune = "Immune",
        Other = "Other"
    }
    
    export interface CreateSampleParams {
        order_id : string;
    }

    export interface BLL {
        GetSample(ctx: ContextNS.Context, id : string) : Promise<Sample>;
        ListSample() : Promise<Sample[]>;
        CreateSample(params : CreateSampleParams) : Promise<Sample[]>;
        ListSampleByDevice(device: string) : Promise<Sample[]>;
        PostResult(ctx: ContextNS.Context, id : string, result : object) : Promise<Sample>;
    }

    export interface DAL {
        GetSample(ctx: ContextNS.Context, id : string) : Promise<Sample>;
        ListSample(filter : Object) : Promise<Sample[]>;
        CreateSample(sample : Sample) : Promise<void>;
        PostResult(ctx: ContextNS.Context,sampe : Sample) : Promise<void>;
    }

    export const Generator = {
        NewSampleId : () => rand.number(12)
    };

    export const Errors = {
        ErrSampleNotFound : new Error("Sample not found"),
        ErrSampleIdExisted : new Error("Sample ID Existed"),
        ErrMachineNotWorking: new Error("Machine not working sample")
    }
}