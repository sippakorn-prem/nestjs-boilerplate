export interface SampleItem {
    id: string;
    name: string;
    value: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSampleItemInput {
    name: string;
    value?: number;
}

export interface UpdateSampleItemInput {
    name?: string;
    value?: number;
}
