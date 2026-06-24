interface OnboardingRestConfig {
	restUrl: string;
	nonce: string;
	isElementorThemeActive?: boolean;
}

export function getConfig(): OnboardingRestConfig | null {
	return window.elementorAppConfig?.onboarding ?? null;
}
