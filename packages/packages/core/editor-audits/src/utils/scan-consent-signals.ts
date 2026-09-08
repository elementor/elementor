const GOOGLE_TRACKING_PATTERNS = [
	/googletagmanager\.com\/gtag\/js\?id=G-/,
	/googletagmanager\.com\/gtag\/js\?id=AW-/,
	/googletagmanager\.com\/gtm\.js\?id=GTM-/,
];

const CONSENT_DEFAULT_CALL_PATTERN = /gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/;

export function hasGoogleTracking( html: string ): boolean {
	return GOOGLE_TRACKING_PATTERNS.some( ( pattern ) => pattern.test( html ) );
}

export function hasConsentDefaultCall( html: string ): boolean {
	return CONSENT_DEFAULT_CALL_PATTERN.test( html );
}
