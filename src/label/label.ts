export namespace LabelNS {
    export interface Label {
        id: string;
        code: string;
        group: string;
        name: string;
        desc?: string;

        attrs?: {
            unit: string;
            value: string;
        }
    }


}