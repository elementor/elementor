import { type ExtendedWindow } from './types';

export function getHostDocumentId() {
	const extendedWindow = window as unknown as ExtendedWindow;

	try {
		return extendedWindow.elementor?.documents?.getInitialId?.() ?? null;
	} catch {
		return null;
	}
}
