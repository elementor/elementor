const GOOGLE_TRACKING_PATTERNS = [
	/googletagmanager\.com\/gtag\/js\?id=(G|AW)-/,
	/googletagmanager\.com\/gtm\.js/,
	/\bGTM-[A-Z0-9]+\b/,
	/gtag\(\s*['"]config['"]\s*,\s*['"](G|AW)-/,
];

const CONSENT_DEFAULT_PATTERNS = [
	/gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/,
	/dataLayer\.push\(\s*\[\s*['"]consent['"]\s*,\s*['"]default['"]/,
];

export function hasGoogleTracking( html: string ): boolean {
	return GOOGLE_TRACKING_PATTERNS.some( ( pattern ) => pattern.test( html ) );
}

export function hasConsentDefaultCall( html: string ): boolean {
	return CONSENT_DEFAULT_PATTERNS.some( ( pattern ) => pattern.test( html ) );
}
