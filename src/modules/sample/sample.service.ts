import { Injectable, NotFoundException } from '@nestjs/common';
import type {
    CreateSampleItemInput,
    SampleItem,
    UpdateSampleItemInput,
} from './sample.repository';
import { SampleRepository } from './sample.repository';

@Injectable()
export class SampleService {
    constructor(private readonly sampleRepository: SampleRepository) {}

    async findAll(): Promise<SampleItem[]> {
        return this.sampleRepository.findMany();
    }

    async findOne(id: string): Promise<SampleItem> {
        const item = await this.sampleRepository.findById(id);
        if (!item) {
            throw new NotFoundException(`Sample item not found: ${id}`);
        }
        return item;
    }

    async create(data: CreateSampleItemInput): Promise<SampleItem> {
        return this.sampleRepository.create(data);
    }

    async update(id: string, data: UpdateSampleItemInput): Promise<SampleItem> {
        const item = await this.sampleRepository.update(id, data);
        if (!item) {
            throw new NotFoundException(`Sample item not found: ${id}`);
        }
        return item;
    }

    async remove(id: string): Promise<void> {
        const deleted = await this.sampleRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException(`Sample item not found: ${id}`);
        }
    }
}
