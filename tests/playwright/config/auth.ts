import { resolve } from 'path';

export const STORAGE_STATE = resolve( __dirname, '../playwright/.auth/user.json' );

export function getOktaTotpSecret(): string | undefined {
	const raw = process.env.OKTA_TOTP_SECRET || process.env.OKTA_MFA_SECRET;

	if ( ! raw ) {
		return undefined;
	}

	return raw.replace( /\s+/g, '' ).toUpperCase();
}

export function isOktaAuthEnabled(): boolean {
	return Boolean(
		process.env.OKTA_USERNAME &&
		process.env.OKTA_PASSWORD &&
		getOktaTotpSecret(),
	);
}
