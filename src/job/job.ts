import rand from "../lib/rand";
import { ContextNS } from "../ext/ctx";
import { CustomerNS } from "../customer/customer";
import { OrderNS } from "../order/order";
import { LocationNS } from "../location/location";
import { format } from "date-fns";
import { OrgNS } from "../org/org";
import { UploadNS } from "../upload/upload";

export namespace JobNS {
  export interface Job {
    id: string;
    ref: 'customer';
    ref_id: string;
    date: string; // YYYY-MM-DD
    date_pos: string // STT
    created_by: string; // user_id
    modified_by?: string; //user_id
    ctime: number;
    mtime: number;
    args: Readonly<object>;
    state: object;
  }

  export enum StepStatus {
    New = 'new',
    Ready = 'ready',
    Running = 'running',
    Cancel = 'cancel',
    Done = 'done'
  }

  export enum StepType {
    Exam = 'exam',
    Test = 'test', 
    Buy = 'buy',
  }

  export interface Step {
    id: string;
    code: string;
    job_id: string;
    job_ref_id: string;
    type: StepType;
    status: StepStatus;
    order_id: string;
    location_id?: string;
    created_by: string; //user_id
    modified_by?: string; //user_id
    results: Array<object>;
    ctime: number;
    mtime: number;
  }

  export type StepOptions = {
    job_ref_id?: string;
    location_id: string;
    created_by: string;
    type: StepType;
    items: OrderNS.CreateItemParams[];
    order_type?: OrderNS.Type;
  }

  export interface CreateJobParams {
    ref: 'customer';
    ref_id: string;
    created_by: string;
    steps: StepOptions[];
    args: object;
  }

  export type AddStepParams = {
    job_id: string;
  } & StepOptions;

  export type UpdateStepParams = {
    status: StepStatus;
    modified_by?: string;
    results? : Array<object>;
  }

  export type FinishStepParams = {
    modified_by: string;
    results: Array<object>;
  };

  export type QueryStepParams = {
    job_id?: string;
    location_id?: string;
    status?: StepStatus[];
    type? : StepType[];
    customer_code? : string;
  }

  export interface ViewStep extends Step {
    order: OrderNS.ViewOrder;
    location?: LocationNS.Location;
    upload? : UploadNS.Data[]; 
  }

  export interface ViewJob extends Job {
    ref_value: CustomerNS.Customer;
    steps: ViewStep[];
  }

  export interface QueryJobParams {
    ref_id?: string[];
    date?: string;
  }

  export interface SetJobStateParams {
    modified_by: string;
    state: object;
  }

  export interface BLL {
    CreateJob(ctx: ContextNS.Context, params: CreateJobParams): Promise<Job>;
    SetJobState(ctx: ContextNS.Context, id: string, params: SetJobStateParams): Promise<Job>;
    GetJob(ctx: ContextNS.Context, id: string): Promise<Job>;
    ViewJob(ctx: ContextNS.Context, id: string): Promise<ViewJob>;
    ListJob(ctx: ContextNS.Context, query: QueryJobParams): Promise<ViewJob[]>;

    AddStep(ctx: ContextNS.Context, job_id: string, step_option: StepOptions): Promise<Step>;
    UpdateStep(ctx: ContextNS.Context, job_step_id: string, params: UpdateStepParams): Promise<void>;
    FinishStep(ctx: ContextNS.Context, job_step_id: string, params: FinishStepParams): Promise<void>;
    GetStep(ctx: ContextNS.Context,id: string): Promise<ViewStep>;
    ViewListStep(ctx: ContextNS.Context, query: QueryStepParams): Promise<ViewStep[]>;
  }

  export interface DAL {
    CreateJob(ctx: ContextNS.Context, job: Job): Promise<void>;
    UpdateJob(ctx: ContextNS.Context, job: Job): Promise<number>;
    GetJob(ctx: ContextNS.Context, id: string): Promise<Job>;
    ListJob(ctx: ContextNS.Context, query: QueryJobParams): Promise<Job[]>;
    CountJob(ctx: ContextNS.Context, query: QueryJobParams): Promise<number>;

    CreateStep(ctx: ContextNS.Context, step: Step): Promise<void>;
    UpdateStep(ctx: ContextNS.Context, step: Step): Promise<void>;
    GetStep(ctx: ContextNS.Context, id: string): Promise<Step>;
    GetStepByCode(ctx: ContextNS.Context, code: string): Promise<Step>;
    ListStep(ctx: ContextNS.Context, query: QueryStepParams): Promise<Step[]>;
  }

  export const Errors = {
    ErrJobNotFound: new Error("job not found"),
    ErrJobRefNotAllowed: new Error("job ref not allowed"),
    ErrStepNotFound: new Error("job step not found"),
    ErrCancelStep: new Error("step can not cancel")
  };

  export const Generator = {
    NewJobId: () => rand.alphabet(12), // collision 2^36
    NewJobStepId: () => rand.alphabet(12), // collision 2^36
    // step code sample [2004010830081238] has 16 numbers
    NewJobStepCode: () => `${format(new Date(), "yyMMddhhmmssSSS")}${Math.floor(Math.random() * 10)}`,
  };
}
