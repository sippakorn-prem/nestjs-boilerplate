import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().port().default(3000),
    DATABASE_URL: Joi.string().uri().required(),

    // SMTP (optional – app runs without if not needed)
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.string().optional(),
    SMTP_SECURE: Joi.string().valid('true', 'false').optional(),
    SMTP_USER: Joi.string().optional().allow(''),
    SMTP_PASSWORD: Joi.string().optional().allow(''),
    SMTP_FROM: Joi.string().optional(),

    // FTP (optional)
    FTP_HOST: Joi.string().optional(),
    FTP_PORT: Joi.string().optional(),
    FTP_USER: Joi.string().optional().allow(''),
    FTP_PASSWORD: Joi.string().optional().allow(''),
    FTP_SECURE: Joi.string().valid('true', 'false').optional(),

    // Microsoft Entra ID (optional)
    ENTRA_CLIENT_ID: Joi.string().optional().allow(''),
    ENTRA_CLIENT_SECRET: Joi.string().optional().allow(''),
    ENTRA_TENANT_ID: Joi.string().optional().allow(''),
    ENTRA_REDIRECT_URI: Joi.string().uri().optional().allow(''),
});
