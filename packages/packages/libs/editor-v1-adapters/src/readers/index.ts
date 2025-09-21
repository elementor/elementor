import { type ExtendedWindow } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const EXPERIMENTAL_FEATURES = {
	// Note: Add new experimental features here as needed
};

export function isRouteActive( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.$e?.routes?.isPartOf( route );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isExperimentActive = ( experiment: keyof typeof EXPERIMENTAL_FEATURES | string ) => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.elementorCommon?.config?.experimentalFeatures?.[ experiment ];
};
