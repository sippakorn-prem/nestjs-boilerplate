import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { SampleItem as PrismaSampleItem } from '@prisma/client';
import type { CreateSampleItemInput, SampleItem, UpdateSampleItemInput } from './sample.interface';

@Injectable()
export class SampleRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(): Promise<SampleItem[]> {
        const rows = await this.prisma.sampleItem.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(this.toSampleItem);
    }

    async findById(id: string): Promise<SampleItem | null> {
        const row = await this.prisma.sampleItem.findUnique({ where: { id } });
        return row ? this.toSampleItem(row) : null;
    }

    async create(data: CreateSampleItemInput): Promise<SampleItem> {
        const row = await this.prisma.sampleItem.create({
            data: {
                name: data.name,
                value: data.value ?? null,
            },
        });
        return this.toSampleItem(row);
    }

    async update(id: string, data: UpdateSampleItemInput): Promise<SampleItem | null> {
        const row = await this.prisma.sampleItem.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.value !== undefined && { value: data.value }),
            },
        }).catch(() => null);
        return row ? this.toSampleItem(row) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.prisma.sampleItem.deleteMany({ where: { id } });
        return result.count > 0;
    }

    private toSampleItem(row: PrismaSampleItem): SampleItem {
        return {
            id: row.id,
            name: row.name,
            value: row.value,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}
