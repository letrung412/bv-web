import rand from "../lib/rand";

export namespace ServiceNS {
  export enum Type {
    Exam = "exam",
    Test = "test", // xet nghiem
    Ent = "ent", // noi soi
    Ultrasound = "ultrasound", //sieu am
    XRay = "x-ray",
    Other = "other",
  }
  
  export interface Service {
    id: string;
    code: string;
    name: string;
    price: number;
    origin_price : number;
    type: Type;
    ctime: number;
    mtime: number;
  }

  export interface CreateServiceParams {
    name?: string;
    code?: string;
    price: number;
    origin_price: number;
    type?: Type;
  }

  export interface UpdateServiceParams {
    code?: string;
    name?: string;
    price?: number;
    origin_price?: number;
    type?: Type;
  }

  //Price-policy
  //------------------------
  export interface Policy {
    id: string;
    code: string;
    name: string;
    discount: number;
    ctime: number;
    mtime: number;
  }

  export interface CreatePolicyParams {
    code?: string;
    name?: string;
    discount: number;
  }

  export interface UpdatePolicyParams {
    code?: string;
    name?: string;
    discount: number;
  }

  //Service-Step
  export interface Step {
    id: string;
    service_id: string;
    name: string;
    unit?: string;
    value?: [number,number];
    option? : ServiceStepOption;
    device: string;
  }

  export interface ServiceStepOption {
    gender? : "male" | "female";
    age? : [number, number];
  }

  export interface CreateStepParams {
    service_id: string;
    name: string;
    unit?: string;
    value?: [number,number];
    device?: string;
    option? : ServiceStepOption;
  }

  export interface ArrayStepsParams {
    service_id : string;
    steps : Array<CreateStepParams>;
  }

  export interface UpdateStepParams {
    service_id: string;
    name?: string;
    unit?: string;
    value?: [number,number];
    device?: string;
    option?: ServiceStepOption;
  }

  export interface ViewService extends Service {
    steps: Step[];
  }

  export interface BLL {
    ListService(): Promise<Service[]>;
    GetService(id: string): Promise<Service>;
    ViewService(id: string): Promise<ViewService>;
    CreateService(params: CreateServiceParams): Promise<Service>;
    UpdateService(id: string, params: UpdateServiceParams): Promise<Service>;
    DeleteService(id: string): Promise<Service>;
    UpdatePriceDiscount(type : Type, discount : number) : Promise<Service[]>;

    ListPolicy(): Promise<Policy[]>;
    GetPolicy(id: string): Promise<Policy>;
    CreatePolicy(params: CreatePolicyParams): Promise<Policy>;
    UpdatePolicy(id: string, params: UpdatePolicyParams): Promise<void>;
    DeletePolicy(id: string): Promise<Policy>;

    ListStep(filter: object): Promise<Step[]>;
    AddStep(params: ArrayStepsParams): Promise<Step[]>;
    UpdateStep(id: string, params: UpdateStepParams): Promise<void>;
    DeleteStep(id: string): Promise<Step>;
  }

  export interface DAL {
    ListService(): Promise<Service[]>;
    GetService(id: string): Promise<Service>;
    CreateService(Service: Service): Promise<void>;
    UpdateService(Service: Service): Promise<void>;
    DeleteService(id: string): Promise<void>;

    ListPolicy(): Promise<Policy[]>;
    GetPolicy(id: string): Promise<Policy>;
    CreatePolicy(Policy: Policy): Promise<void>;
    UpdatePolicy(Policy: Policy): Promise<void>;
    DeletePolicy(id: string): Promise<void>;

    ListStep(filter : object): Promise<Step[]>;
    GetStep(id: string): Promise<Step>;
    CreateStep(step: Step): Promise<void>;
    UpdateStep(step: Step): Promise<void>;
    DeleteStep(id: string): Promise<void>;
  }

  export const Errors = {
    ErrServiceNotFound: new Error("service not found"),
    ErrServicePolicyNotFound: new Error("service policy not found"),
    ErrServiceStepNotFound: new Error("service step not found"),
  };

  export const Generator = {
    NewServiceId: () => rand.uppercase(10), // colision 2^25
    NewPolicyId: () => rand.uppercase(10), // collision 2^25
    NewServiceStepId: () => rand.uppercase(12), // collision 2^30
  };
}
