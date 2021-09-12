import rand from "../lib/rand";

export namespace UploadNS {
    export interface Data {
        id : string;
        ref : "job_step";
        ref_id : string;
        name : string;
        type : Type;
        metadata : string;
        url : string;
        size : number;
        ctime : number;
    }

    export enum Type {
        Image = "image"
    }

    export interface CreateDataParams {
        ref_id : string;
        url : string;
        metadata: string;
        name : string;
        size : number;
    }

    export interface BLL {
        SaveData(params : CreateDataParams) : Promise<Data>;
        GetData(name : string) : Promise<Data>;
        Download(name : string) : Promise<string>;
        ListData(ref_id : string) : Promise<Data[]>
    }

    export interface DAL {
        SaveData(data : Data) : Promise<void>;
        Download(name : string) : Promise<Data>;
        ListData(ref_id : string) : Promise<Data[]>;
    }

    export const Generator = {
        NewDataId : () => rand.number(12)
    };

    export const Errors = {
        ErrDataNotFound : new Error("Image not found"),
        ErrDataIdExisted : new Error("Image ID Existed"),
        ErrDataType : new Error("Data type only jpg/jpeg/png")
    }
}