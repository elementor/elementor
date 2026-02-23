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
	imageLayout: 'wide',
	background: buildBackground( 'step-1.webp' ),
	assets: [],
};

export const LOGIN_CONFIG: StepVisualConfig = {
	imageLayout: 'wide',
	background: buildBackground( 'login.webp' ),
	assets: [],
};

const stepVisuals: Record< StepIdType, StepVisualConfig > = {
	[ StepId.BUILDING_FOR ]: {
		imageLayout: 'wide',
		background: buildBackground( 'step-1.webp' ),
		assets: [],
	},
	[ StepId.SITE_ABOUT ]: {
		imageLayout: 'narrow',
		background: buildBackground( 'step-2.webp' ),
		assets: [],
	},
	[ StepId.EXPERIENCE_LEVEL ]: {
		imageLayout: 'wide',
		background: buildBackground( 'step-3.webp' ),
		assets: [],
	},
	[ StepId.THEME_SELECTION ]: {
		imageLayout: 'narrow',
		background: buildBackground( 'step-4.webp' ),
		assets: [],
	},
	[ StepId.SITE_FEATURES ]: {
		imageLayout: 'narrow',
		background: buildBackground( 'step-5.webp' ),
		assets: [],
		contentMaxWidth: 724,
	},
};

export const getLoginVisualConfig = (): StepVisualConfig => LOGIN_CONFIG;

export const getStepVisualConfig = ( stepId: StepIdType ): StepVisualConfig => stepVisuals[ stepId ] ?? DEFAULT_CONFIG;
