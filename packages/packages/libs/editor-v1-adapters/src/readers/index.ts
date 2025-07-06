import { type ExtendedWindow } from './types';

export function isRouteActive( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.$e?.routes?.isPartOf( route );
}

export const isExperimentActive = ( experiment: string ) => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.elementorCommon?.config?.experimentalFeatures?.[ experiment ];
};
