export type ServiceHealthStatus = 'up' | 'down' | 'disabled';

export interface ServiceHealth {
    status: ServiceHealthStatus;
    message?: string;
}

export interface HealthCheckResult {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    services: {
        database: ServiceHealth;
        smtp: ServiceHealth;
        ftp: ServiceHealth;
        entraId: ServiceHealth;
    };
}
