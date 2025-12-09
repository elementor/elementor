import { type CanvasExtendedWindow } from './types';

const extendedWindow = window as unknown as CanvasExtendedWindow;

export const LicenseInfo = {
	hasPro: extendedWindow.elementor?.helpers?.hasPro ?? false,
};
