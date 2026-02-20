/**
 * Decodes a JWT's payload (middle segment) without verifying the signature.
 * Use for reading claims from id_token / access_token received from a trusted IdP.
 * For signature verification use a proper JWT library (e.g. jwks-uri validation).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    if (!token || typeof token !== 'string') {
        return null;
    }
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
        return null;
    }
    try {
        const payload = parts[1];
        const decoded = Buffer.from(payload, 'base64url').toString('utf8');
        return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
        return null;
    }
}
