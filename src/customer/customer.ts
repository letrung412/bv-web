import { format } from "date-fns";
import rand from "../lib/rand";

export namespace CustomerNS {
  export enum Gender {
    Male = 'male',
    Female = 'female'
  }

  export enum IDType {
    CMND = 'cmnd',
    CCCD = 'cccd'
  }

  export interface Customer {
    id: string;
    code: string;
    full_name: string;
    gender: Gender;
    birthday: string;
    allergy? : string;
  }

  export interface Contact {
    id: string;
    customer_id: string;
    full_name? : string; //nguoi lien he
    phone?: string;
    relation?: string;
    address?: {
      province? : string,
      district? : string,
      ward? : string,
      street? : string
    };
    idnum?: string;
    idtype?: IDType;
    email?: string;
  }

  export interface Visit {
    id: string;
    customer_id: string;
    ctime: number;
  }

  export interface CreateCustomerParams {
    full_name: string;
    code?: string;
    gender: Gender;
    birthday: string;
  }

  export interface UpdateCustomerParams {
    full_name?: string;
    gender?: Gender;
    birthday?: string;
  }

  export interface UpdateAllergyParams {
    allergy : string;
  }

  export interface UpdateContactParams {
    full_name?: string;
    idtype?: IDType;
    idnum?: string;
    phone?: string;
    address?: {
      province? : string,
      district? : string,
      ward? : string,
      street? : string
    };
    email?: string;
    relation?: string;
  }

  export interface CreateContactParams extends UpdateContactParams {
    customer_id: string;
  }

  export interface ViewCustomer extends Customer {
    contacts: Contact[];
  }

  export interface QueryContactParams {
    id?: string[];
    customer_id?: string;
    phone?: string;
  }
  
  export interface QueryCustomerParams {
    id?: string[];
    full_name?: string;
    birthday?: string;
  }

  export interface BLL {
    ListCustomer(query: QueryCustomerParams): Promise<ViewCustomer[]>;
    GetCustomer(id: string): Promise<Customer>;
    GetCustomerByCode(code: string): Promise<Customer>;
    ViewCustomer(id: string): Promise<ViewCustomer>;
    DeleteCustomer(id: string): Promise<Customer>;
    SearchCustomer(text : string): Promise<ViewCustomer[]>;
    CreateCustomer(params: CreateCustomerParams): Promise<Customer>;
    UpdateCustomer(id: string, params: UpdateCustomerParams): Promise<void>;
    UpdateAllergy(id : string, parmas : UpdateAllergyParams): Promise<void>;

    CreateContact(params: CreateContactParams): Promise<Contact>;
    UpdateContact(id: string, params: UpdateContactParams): Promise<void>;
    DeleteContact(id: string): Promise<Contact>;

    ListVisit(customer_id: string): Promise<Visit[]>;
    AddVisit(customer_id: string): Promise<Visit>;
  }

  export interface DAL {
    ListCustomer(query: QueryCustomerParams): Promise<Customer[]>;
    GetCustomer(id: string): Promise<Customer>;
    GetCustomerByCode(code: string): Promise<Customer>;
    
    CreateCustomer(customer: Customer): Promise<void>;
    UpdateCustomer(customer: Customer): Promise<void>;
    DeleteCustomer(id: string): Promise<void>;

    UpdateAllergy(customer : Customer): Promise<void>;

    GetContact(id: string): Promise<Contact>;
    ListContact(query: QueryContactParams): Promise<Contact[]>;
    DeleteContact(id: string): Promise<void>;
    UpdateContact(contact: Contact): Promise<void>;
    CreateContact(contact: Contact): Promise<void>;
    ListVisit(customer_id: string): Promise<Visit[]>;
    CreateVisit(visit: Visit): Promise<void>;
  }

  export const Errors = {
    ErrCustomerNotFound: new Error("customer not found"),
    ErrCustomerCodeExisted: new Error("customer code existed"),
    ErrCustomerContactNotFound: new Error("customer contact not found"),
  };

  export const Generator = {
    NewCustomerId: () => rand.uppercase(12), // colision 2^30
    NewCustomerContactId: () => rand.alphabet(12), // collision 2^36
    NewCustomerVisitId: () => rand.alphabet(16), // collision 2^48
    NewCustomerCode: () => format(new Date(), "yyMMddhhmmss"),
  };
}
