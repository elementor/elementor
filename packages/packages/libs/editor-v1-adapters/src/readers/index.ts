import { type ExtendedWindow } from './types';

export const EXPERIMENTAL_FEATURES = {
	// Note: Add new experimental features here as needed (editor reads live flags from elementorCommon.config.experimentalFeatures).
	e_atomic_grid_control: true,
};

export function isRouteActive( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.$e?.routes?.isPartOf( route );
}

export const isExperimentActive = ( experiment: keyof typeof EXPERIMENTAL_FEATURES | string ) => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.elementorCommon?.config?.experimentalFeatures?.[ experiment ];
};
