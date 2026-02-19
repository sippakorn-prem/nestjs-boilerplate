import { Controller, Get } from '@nestjs/common';
import type { HealthCheckResult } from './health.interface';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
    constructor(private readonly health: HealthService) {}

    @Get()
    async check(): Promise<HealthCheckResult> {
        return this.health.check();
    }
}
