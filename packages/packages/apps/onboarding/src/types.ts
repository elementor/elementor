import type { CSSProperties } from 'react';

export const StepId = {
	LOGIN: 'login',
	BUILDING_FOR: 'building_for',
	SITE_ABOUT: 'site_about',
	EXPERIENCE: 'experience',
	THEME_SELECT: 'theme_select',
	SITE_FEATURES: 'site_features',
} as const;

export type StepIdType = ( typeof StepId )[ keyof typeof StepId ];

export interface Step {
	id: StepIdType;
	label: string;
}

export type AssetAnimation = 'fade-in' | 'fade-up' | 'none';

export interface RightPanelAsset {
	id: string;
	src: string;
	alt?: string;
	style?: CSSProperties;
	animation?: AssetAnimation;
}

export interface StepVisualConfig {
	rightWidthRatio: number;
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
	buildingFor?: 'myself' | 'business' | 'client';
	siteAbout?: string[];
	experience?: 'beginner' | 'intermediate' | 'advanced';
	theme?: string;
	features?: string[];
	[ key: string ]: unknown;
}

export interface OnboardingConfig {
	version: string;
	restUrl: string;
	nonce: string;
	progress: OnboardingProgress;
	choices: OnboardingChoices;
	hadUnexpectedExit: boolean;
	steps: Step[];
	isConnected: boolean;
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
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
	};
}
