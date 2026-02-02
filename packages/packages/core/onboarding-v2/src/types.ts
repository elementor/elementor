/**
 * Onboarding V2 Types
 */

export type ExitType = 'user_exit' | 'unexpected' | null;

export interface UserProgress {
	currentStep: number;
	completedSteps: number[];
	exitType: ExitType;
	lastActiveTimestamp: number | null;
	startedAt: number | null;
	completedAt: number | null;
}

export interface UserChoices {
	buildingFor?: 'myself' | 'business' | 'client';
	siteType?: 'business' | 'store' | 'portfolio' | 'blog' | 'other';
	experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
	goals?: string[];
	features?: string[];
	designPreference?: string;
	templateChoice?: string;
	connectedAccount?: boolean;
	siteName?: string;
	customData?: Record<string, unknown>;
}

export interface OnboardingV2State {
	progress: UserProgress;
	choices: UserChoices;
	isLoading: boolean;
	error: string | null;
	hadUnexpectedExit: boolean;
}

export interface OnboardingV2Config {
	restUrl: string;
	nonce: string;
	progress: UserProgress;
	choices: UserChoices;
	hadUnexpectedExit: boolean;
}

// Extend window for config
declare global {
	interface Window {
		elementorOnboardingV2Config?: OnboardingV2Config;
	}
}
