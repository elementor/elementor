import { StepId, type StepIdType, type StepVisualConfig } from '../types';

const ONBOARDING_ASSETS_PATH = 'images/app/e-onboarding/';

const getAssetsBaseUrl = () => window.elementorCommon?.config?.urls?.assets ?? '';

export const getOnboardingAssetUrl = ( fileName: string ) => {
	const baseUrl = getAssetsBaseUrl();
	const path = `${ ONBOARDING_ASSETS_PATH }${ fileName }`;

	return baseUrl ? `${ baseUrl }${ path }` : path;
};

const buildBackground = ( fileName: string ) => {
	const imageUrl = getOnboardingAssetUrl( fileName );

	return `url(${ imageUrl }) center / cover no-repeat`;
};

const DEFAULT_CONFIG: StepVisualConfig = {
	background: buildBackground( 'step-1.png' ),
	assets: [],
};

export const LOGIN_CONFIG: StepVisualConfig = {
	background: buildBackground( 'login.png' ),
	assets: [],
};

const stepVisuals: Record< StepIdType, StepVisualConfig > = {
	[ StepId.BUILDING_FOR ]: {
		background: buildBackground( 'step-1.png' ),
		assets: [],
	},
	[ StepId.SITE_ABOUT ]: {
		background: buildBackground( 'step-2.png' ),
		assets: [],
		lottieAnimation: getOnboardingAssetUrl( 'site-about.lottie' ),
	},
	[ StepId.EXPERIENCE_LEVEL ]: {
		background: buildBackground( 'step-3.png' ),
		assets: [],
	},
	[ StepId.THEME_SELECTION ]: {
		background: buildBackground( 'step-4.png' ),
		assets: [],
	},
	[ StepId.SITE_FEATURES ]: {
		background: buildBackground( 'step-5.png' ),
		assets: [],
		contentMaxWidth: 724,
	},
};

export const getLoginVisualConfig = (): StepVisualConfig => LOGIN_CONFIG;

export const getStepVisualConfig = ( stepId: StepIdType ): StepVisualConfig => stepVisuals[ stepId ] ?? DEFAULT_CONFIG;

export const getLottieAnimationUrls = (): string[] =>
	Object.values( stepVisuals ).flatMap( ( config ) =>
		config.lottieAnimation ? [ config.lottieAnimation ] : []
	);
