import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntraIdService } from '../../integrations/entra-id';
import { FtpService } from '../../integrations/ftp';
import { SmtpService } from '../../integrations/smtp';
import type { HealthCheckResult, ServiceHealth } from './health.interface';

@Injectable()
export class HealthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly smtp: SmtpService,
        private readonly ftp: FtpService,
        private readonly entraId: EntraIdService,
    ) {}

    async check(): Promise<HealthCheckResult> {
        const [database, smtp, ftp, entraId] = await Promise.all([
            this.checkDatabase(),
            this.checkSmtp(),
            this.checkFtp(),
            this.checkEntraId(),
        ]);

        const services = { database, smtp, ftp, entraId };
        const statuses = Object.values(services).map((s) => s.status);
        const hasDown = statuses.includes('down');
        const allDisabled = statuses.every((s) => s === 'disabled');
        const status: HealthCheckResult['status'] = allDisabled
            ? 'ok'
            : hasDown
              ? 'degraded'
              : 'ok';

        return {
            status,
            timestamp: new Date().toISOString(),
            services,
        };
    }

    private async checkDatabase(): Promise<ServiceHealth> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'up' };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Connection failed';
            return { status: 'down', message };
        }
    }

    private async checkSmtp(): Promise<ServiceHealth> {
        if (!this.smtp.isAvailable()) {
            return { status: 'disabled', message: 'SMTP not configured' };
        }
        try {
            const ok = await this.smtp.verifyConnection();
            return ok ? { status: 'up' } : { status: 'down', message: 'Verify failed' };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Check failed';
            return { status: 'down', message };
        }
    }

    private async checkFtp(): Promise<ServiceHealth> {
        if (!this.ftp.isAvailable()) {
            return { status: 'disabled', message: 'FTP not configured' };
        }
        try {
            await this.ftp.connect();
            await this.ftp.disconnect();
            return { status: 'up' };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Connection failed';
            return { status: 'down', message };
        }
    }

    private async checkEntraId(): Promise<ServiceHealth> {
        if (!this.entraId.isAvailable()) {
            return { status: 'disabled', message: 'Entra ID not configured' };
        }
        return { status: 'up', message: 'Configured (no remote check)' };
    }
}
