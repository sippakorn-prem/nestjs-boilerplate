import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (no Bearer token required).
 * Use on auth login/callback, health, demo, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
