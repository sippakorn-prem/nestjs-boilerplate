export interface AppConfiguration {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
}

export default (): AppConfiguration => {
    return {
        port: parseInt(process.env.PORT ?? '3000', 10),
        nodeEnv: process.env.NODE_ENV ?? 'development',
        databaseUrl: process.env.DATABASE_URL ?? '',
    };
};
