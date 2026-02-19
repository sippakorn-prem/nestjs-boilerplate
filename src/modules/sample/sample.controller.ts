import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { CreateSampleItemInput, UpdateSampleItemInput } from './sample.repository';
import { SampleService } from './sample.service';

@Controller('sample')
export class SampleController {
    constructor(private readonly sampleService: SampleService) {}

    @Get()
    findAll() {
        return this.sampleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sampleService.findOne(id);
    }

    @Post()
    create(@Body() body: CreateSampleItemInput) {
        return this.sampleService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateSampleItemInput) {
        return this.sampleService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.sampleService.remove(id);
    }
}
