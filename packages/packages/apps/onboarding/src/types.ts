import type { CSSProperties } from 'react';

export const StepId = {
	BUILDING_FOR: 'building_for',
	SITE_ABOUT: 'site_about',
	EXPERIENCE_LEVEL: 'experience_level',
	THEME_SELECTION: 'theme_selection',
	SITE_FEATURES: 'site_features',
} as const;

export type StepIdType = ( typeof StepId )[ keyof typeof StepId ];

export type StepType = 'single' | 'multiple';

export interface Step {
	id: StepIdType;
	label: string;
	type: StepType;
}

export type AssetAnimation = 'fade-in' | 'fade-up' | 'none';

export interface RightPanelAsset {
	id: string;
	src: string;
	alt?: string;
	style?: CSSProperties;
	animation?: AssetAnimation;
}

export type ImageLayout = 'wide' | 'narrow';

export interface StepVisualConfig {
	imageLayout: ImageLayout;
	background: string;
	assets: RightPanelAsset[];
}

export interface OnboardingProgress {
	currentStepId: StepIdType;
	currentStepIndex: number;
	completedSteps: StepIdType[];
	exitType: string | null;
	lastActiveTimestamp: number | null;
	startedAt: number | null;
	completedAt: number | null;
}

export interface OnboardingChoices {
	building_for: string | null;
	site_about: string[];
	experience_level: string | null;
	theme_selection: string | null;
	site_features: string[];
}

export type ThemeSlug = 'hello-elementor' | 'hello-biz';

export interface OnboardingConfig {
	version: string;
	restUrl: string;
	nonce: string;
	progress: OnboardingProgress;
	choices: OnboardingChoices;
	hadUnexpectedExit: boolean;
	steps: Step[];
	isConnected: boolean;
	hasProSubscription: boolean;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
	};
}

export interface OnboardingState {
	steps: Step[];
	currentStepId: StepIdType;
	currentStepIndex: number;
	completedSteps: StepIdType[];
	exitType: string | null;
	lastActiveTimestamp: number | null;
	startedAt: number | null;
	completedAt: number | null;
	choices: OnboardingChoices;
	isLoading: boolean;
	error: string | null;
	hadUnexpectedExit: boolean;
	isConnected: boolean;
	isGuest: boolean;
	userName: string;
	hasProSubscription: boolean;
	hasSkippedProInstall: boolean;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
	};
}
