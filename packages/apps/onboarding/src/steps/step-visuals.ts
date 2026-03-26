import { StepId, type StepIdType, type StepVisualConfig } from '../types';

const ONBOARDING_ASSETS_PATH = 'images/app/onboarding/';
const VIDEOS_BASE_URL = 'https://assets.elementor.com/onboarding/v1/videos/';

const CONTENT_MAX_WIDTH_WIDE_ELEMENT = 724;

const getAssetsBaseUrl = () => window.elementorCommon?.config?.urls?.assets ?? '';

export const getOnboardingAssetUrl = ( fileName: string ) => {
	const baseUrl = getAssetsBaseUrl();
	const path = `${ ONBOARDING_ASSETS_PATH }${ fileName }`;

	return baseUrl ? `${ baseUrl }${ path }` : path;
};

export const getOnboardingVideoUrl = ( fileName: string ) => `${ VIDEOS_BASE_URL }${ fileName }`;

const buildBackground = ( fileName: string ) => {
	const imageUrl = getOnboardingAssetUrl( fileName );

	return `url(${ imageUrl }) center / cover no-repeat`;
};

const DEFAULT_CONFIG: StepVisualConfig = {
	background: buildBackground( 'step-1.webp' ),
};

export const LOGIN_CONFIG: StepVisualConfig = {
	background: buildBackground( 'login.webp' ),
};

const stepVisuals: Record< StepIdType, StepVisualConfig > = {
	[ StepId.BUILDING_FOR ]: {
		background: buildBackground( 'step-1.webp' ),
	},
	[ StepId.SITE_ABOUT ]: {
		background: buildBackground( 'step-2.webp' ),
		video: getOnboardingVideoUrl( 'step-2.webm' ),
	},
	[ StepId.EXPERIENCE_LEVEL ]: {
		background: buildBackground( 'step-3.webp' ),
		video: getOnboardingVideoUrl( 'step-3.webm' ),
	},
	[ StepId.THEME_SELECTION ]: {
		background: buildBackground( 'step-4.webp' ),
		video: getOnboardingVideoUrl( 'step-4.webm' ),
		contentMaxWidth: CONTENT_MAX_WIDTH_WIDE_ELEMENT,
	},
	[ StepId.SITE_FEATURES ]: {
		background: buildBackground( 'step-5.webp' ),
		video: getOnboardingVideoUrl( 'step-5.webm' ),
		contentMaxWidth: CONTENT_MAX_WIDTH_WIDE_ELEMENT,
	},
};

export const getLoginVisualConfig = (): StepVisualConfig => LOGIN_CONFIG;

export const getStepVisualConfig = ( stepId: StepIdType ): StepVisualConfig => stepVisuals[ stepId ] ?? DEFAULT_CONFIG;

export const getVideoUrls = (): string[] =>
	Object.values( stepVisuals ).flatMap( ( config ) => ( config.video ? [ config.video ] : [] ) );
