import type { StarterConfig } from './types';

const ONBOARDING_ASSETS_PATH = 'images/app/e-onboarding/';

export function getStarterConfig(): StarterConfig | null {
	return ( ( window.elementor?.config as Record< string, unknown > )?.starter as StarterConfig | null ) ?? null;
}

export function deleteStarterConfig(): void {
	const config = window.elementor?.config as Record< string, unknown > | undefined;

	if ( config ) {
		delete config.starter;
	}
}

export function getAssetUrl( fileName: string ): string {
	const baseUrl = window.elementorCommon?.config?.urls?.assets ?? '';

	return baseUrl
		? `${ baseUrl }${ ONBOARDING_ASSETS_PATH }${ fileName }`
		: `${ ONBOARDING_ASSETS_PATH }${ fileName }`;
}

export function getEditingPanelWidth(): number {
	return document.querySelector( '.elementor-panel' )?.clientWidth || 0;
}

export function getTopBarHeight(): number {
	return document.querySelector( '.MuiAppBar-root' )?.clientHeight || 48;
}
