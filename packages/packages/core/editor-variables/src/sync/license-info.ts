import { type CanvasExtendedWindow } from './types';

export function getLicenseInfo() {
	const extendedWindow = window as unknown as CanvasExtendedWindow;

	return {
		hasPro: !! extendedWindow.elementorPro,
	};
}
