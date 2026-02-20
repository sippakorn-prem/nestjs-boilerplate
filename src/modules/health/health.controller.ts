import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators';
import type { HealthCheckResult } from './health.interface';
import { HealthService } from './health.service';

@Public()
@Controller('health')
export class HealthController {
    constructor(private readonly health: HealthService) {}

    @Get()
    async check(): Promise<HealthCheckResult> {
        return this.health.check();
    }
}
