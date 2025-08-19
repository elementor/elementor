import { type ExtendedWindow } from '../types';

export const getElementorConfig = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.config ?? {};
};
