import { type ExtendedWindow } from './types';

export const getElementorFrontendConfig = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementorFrontend?.config ?? {};
};
