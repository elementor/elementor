import type { OnboardingConfig } from '../types';

interface OnboardingRestConfig {
	restUrl: string;
	nonce: string;
}

export function getConfig(): OnboardingRestConfig | null {
	return window.elementorAppConfig?.onboarding ?? null;
}

export function getOnboardingConfig(): OnboardingConfig | null {
	return window.elementorAppConfig?.onboarding ?? null;
}
