import { StepId, type StepIdType, type StepVisualConfig } from '../types';

const DEFAULT_RIGHT_PANEL_RATIO = 0.42;
const COMPACT_RIGHT_PANEL_RATIO = 0.34;
const DEFAULT_RIGHT_PANEL_BACKGROUND = '#F7C5E4';
const ONBOARDING_ASSETS_PATH = 'images/app/e-onboarding/';
const BACKGROUND_POSITION = 'center';
const BACKGROUND_SIZE = 'cover';
const BACKGROUND_REPEAT = 'no-repeat';

type ElementorCommonConfig = {
	urls?: {
		assets?: string;
	};
};

type ElementorCommon = {
	config?: ElementorCommonConfig;
};

type ExtendedWindow = Window & {
	elementorCommon?: ElementorCommon;
};

const getAssetsBaseUrl = () => ( window as ExtendedWindow ).elementorCommon?.config?.urls?.assets ?? '';

export const getOnboardingAssetUrl = ( fileName: string ) => {
	const baseUrl = getAssetsBaseUrl();
	const path = `${ ONBOARDING_ASSETS_PATH }${ fileName }`;

	return baseUrl ? `${ baseUrl }${ path }` : path;
};

const buildBackground = ( fileName?: string ) => {
	if ( ! fileName ) {
		return DEFAULT_RIGHT_PANEL_BACKGROUND;
	}

	const imageUrl = getOnboardingAssetUrl( fileName );

	return `${ DEFAULT_RIGHT_PANEL_BACKGROUND } url(${ imageUrl }) ${ BACKGROUND_POSITION } / ${ BACKGROUND_SIZE } ${ BACKGROUND_REPEAT }`;
};

const DEFAULT_CONFIG: StepVisualConfig = {
	rightWidthRatio: DEFAULT_RIGHT_PANEL_RATIO,
	background: DEFAULT_RIGHT_PANEL_BACKGROUND,
	assets: [],
};

export const LOGIN_CONFIG: StepVisualConfig = {
	rightWidthRatio: DEFAULT_RIGHT_PANEL_RATIO,
	background: buildBackground( 'login.png' ),
	assets: [],
};

const BUILDING_FOR_CONFIG: StepVisualConfig = {
	rightWidthRatio: DEFAULT_RIGHT_PANEL_RATIO,
	background: buildBackground( 'step-1.png' ),
	assets: [],
};

const SITE_ABOUT_CONFIG: StepVisualConfig = {
	rightWidthRatio: COMPACT_RIGHT_PANEL_RATIO,
	background: buildBackground( 'step-2.png' ),
	assets: [],
};

const EXPERIENCE_LEVEL_CONFIG: StepVisualConfig = {
	rightWidthRatio: DEFAULT_RIGHT_PANEL_RATIO,
	background: buildBackground( 'step-3.png' ),
	assets: [],
};

const THEME_SELECTION_CONFIG: StepVisualConfig = {
	rightWidthRatio: DEFAULT_RIGHT_PANEL_RATIO,
	background: buildBackground( 'step-4.png' ),
	assets: [],
};

const SITE_FEATURES_CONFIG: StepVisualConfig = {
	rightWidthRatio: DEFAULT_RIGHT_PANEL_RATIO,
	background: buildBackground( 'step-5.png' ),
	assets: [],
};

const stepVisuals: Record< StepIdType, StepVisualConfig > = {
	[ StepId.BUILDING_FOR ]: BUILDING_FOR_CONFIG,
	[ StepId.SITE_ABOUT ]: SITE_ABOUT_CONFIG,
	[ StepId.EXPERIENCE_LEVEL ]: EXPERIENCE_LEVEL_CONFIG,
	[ StepId.THEME_SELECTION ]: THEME_SELECTION_CONFIG,
	[ StepId.SITE_FEATURES ]: SITE_FEATURES_CONFIG,
};

export const getLoginVisualConfig = (): StepVisualConfig => LOGIN_CONFIG;

export const getStepVisualConfig = ( stepId: StepIdType ): StepVisualConfig => stepVisuals[ stepId ] ?? DEFAULT_CONFIG;
