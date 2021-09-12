
export namespace ContextNS {
    export interface Context {
    }

    export function New() {
        return {} as Context;
    }

    export function WithContext(ctx: Context, key: string, value: any) {
        return { ...ctx, [key]: value };
    }

    export function FromContext<T>(ctx: Context, key: string) {
        return ctx[key] as T;
    }

    export interface BLL {
        RunTransaction<T>(ctx: Context, fn: (tx: Context) => Promise<T>): Promise<T>;
    }
}