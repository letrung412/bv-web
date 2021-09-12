import rand from "../lib/rand";
export namespace ProductNS {
    export interface Producer {
        id: string;
        name: string;
        description?: string;
        ctime: number;
        mtime: number;
    }

    export interface Part {
        id: string;
        name: string;
        description: string;
        ctime: number;
        mtime: number;
    }

    interface ProductPart {
        id: string;
        unit: string;
        quantity: string;
    }

    export interface ProductAttrs {
        instruction?: string; // hướng dẫn sử dụng
        strength?: number; // độ mạnh dược liệu, 250mg -- 50kg
        max_dose?: number; // liều dùng tối đa trong ngày, 1000mg(4 vien)

        max_dose_per_kg?: number; //lieu dung theo 1 kg //duoc si nhap //    5mg/1kg
        route?: string; // đường dùng 
        // https://www.healthline.com/health/administration-of-medication#routes

        unit?: 'ml' | 'tablet' | 'mg'; // đơn vị tính ml, viên, toa, mg

        package_size?: number; // đóng gói 2500mg, 10 viên

        default_quantity?: number; // tổng liều dùng mặc đình 500mg (2 vien)

        default_daily_usage?: number; //số lần sử dụng trong ngày mặc định |  2 ***

        default_day_supply?: number; // số ngày dùng mặc định 5

        description?: string; //Ghi chú
    }

    export interface Product {
        id: string;
        name: string;
        price: number;
        origin_price: number; //Giá nhập vào
        unit: string; //Đơn vị thuốc khác unit trong attrs
        producer_id: string;
        attrs: ProductAttrs;
        parts: ProductPart[];
        ctime: number;
        mtime: number;

        inventory?: {
            min?: number;
            reorder?: number;
            last_verfied?: number;
        };
    }

    export interface CreateProducerParams {
        name: string;
        description?: string;
    }

    export interface UpdateProducerParams {
        name?: string;
        description?: string;
    }

    export interface CreatePartParams {
        name: string;
        description?: string;
    }

    export interface UpdatePartParams {
        name?: string;
        description?: string;
    }

    export interface CreateProductAttrsParams {
        color?: string;
        weight?: string;
        dosage_delivery?: string; // cách dùng
        type?: 'regular';

        sig?: string; // 
        user_instruction?: string;

        strength?: number; // 200 mg
        max_dose?: number; // 500 mg

        unit?: 'ml';
        unit_per_dose?: number; // 3ml
        package_size?: number; // 15ml

        default_quantity?: number; // 15ml
        default_day_supply?: number; // 5 -> 3ml/day

        description?: string;
        // unit_dose?: number; 
        // packages_per_case?: number; // 10 
    }

    export interface UpdateProductAttrsParams {
        unit?: string;
        color?: string;
        weight?: string;
    }

    export interface CreateProductParams {
        name: string;
        price: number;
        producer_id: string;
        attrs: ProductAttrs;
        parts: ProductPart[];
        origin_price: number;
        unit?: string; //Đơn vị thuốc khác unit trong attrs
    }

    export interface UpdateProductParams {
        name?: string;
        price?: number;
        producer_id?: string;
        attrs?: ProductAttrs;
        parts?: ProductPart[];
        origin_price: number;
        unit?: string; //Đơn vị thuốc khác unit trong attrs
    }

    export interface BLL {
        ListProducer(): Promise<Producer[]>;
        GetProducer(id: string): Promise<Producer>;
        CreateProducer(params: CreateProducerParams): Promise<Producer>;
        UpdateProducer(id: string, params: UpdateProducerParams): Promise<void>;
        DeleteProducer(id: string): Promise<Producer>;

        ListPart(): Promise<Part[]>;
        GetPart(id: string): Promise<Part>;
        CreatePart(params: CreatePartParams): Promise<Part>;
        UpdatePart(id: string, params: UpdatePartParams): Promise<void>;
        DeletePart(id: string): Promise<Part>;

        ListProduct(): Promise<Product[]>;
        GetProduct(id: string): Promise<Product>;
        CreateProduct(params: CreateProductParams): Promise<Product>;
        UpdateProduct(id: string, params: UpdateProductParams): Promise<void>;
        DeleteProduct(id: string): Promise<Product>;
    }

    export interface DAL {
        ListProducer(): Promise<Producer[]>;
        GetProducer(id: string): Promise<Producer>;
        CreateProducer(Producer: Producer): Promise<void>;
        UpdateProducer(Producer: Producer): Promise<void>;
        DeleteProducer(id: string): Promise<void>;

        ListPart(): Promise<Part[]>;
        GetPart(id: string): Promise<Part>;
        CreatePart(Part: Part): Promise<void>;
        UpdatePart(Part: Part): Promise<void>;
        DeletePart(id: string): Promise<void>;



        ListProduct(): Promise<Product[]>;
        GetProduct(id: string): Promise<Product>;
        CreateProduct(Product: Product): Promise<void>;
        UpdateProduct(Product: Product): Promise<void>;
        DeleteProduct(id: string): Promise<void>;
    }

    export const Errors = {
        ErrProducerNotFound: new Error("Producer not found!"),
        ErrPartNotFound: new Error("Part not found!"),
        ErrProductNotFound: new Error("Product not found!"),
        ErrProductPartExist: new Error("Product part exist")
    };

    export const Generator = {
        NewProducerId: () => rand.uppercase(10), // colision 2^25
        NewPartId: () => rand.uppercase(12), // collision 2^30
        NewProductId: () => rand.uppercase(12), // collision 2^30
    };
}