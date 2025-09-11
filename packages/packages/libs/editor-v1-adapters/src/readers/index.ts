import { type ExtendedWindow } from './types';

export const EXPERIMENTAL_FEATURES = {
	CUSTOM_CSS: 'atomic_custom_css',
};

export function isRouteActive( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.$e?.routes?.isPartOf( route );
}

export const isExperimentActive = ( experiment: keyof typeof EXPERIMENTAL_FEATURES | string ) => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.elementorCommon?.config?.experimentalFeatures?.[ experiment ];
};
