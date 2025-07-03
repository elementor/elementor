import { type ExtendedWindow } from './types';

export function getWidgetsCache() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow?.elementor?.widgetsCache || null;
}
