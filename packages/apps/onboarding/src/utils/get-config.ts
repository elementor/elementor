interface OnboardingRestConfig {
	restUrl: string;
	nonce: string;
}

export function getConfig(): OnboardingRestConfig | null {
	return window.elementorAppConfig?.onboarding ?? null;
}
