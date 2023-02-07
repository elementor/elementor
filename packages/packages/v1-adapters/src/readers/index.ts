import { ExtendedWindow } from './types';

export function isRouteActive( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	return !! extendedWindow.$e?.routes?.isPartOf( route );
}

export function getCurrentEditMode() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.channels?.dataEditMode?.request?.( 'activeMode' );
}
