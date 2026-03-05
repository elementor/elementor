import { type ExtendedWindow } from './types';

export function getCurrentDocumentId() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.documents?.getCurrentId?.() ?? null;
}
