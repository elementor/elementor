import { type ExtendedWindow } from './types';

export default function getCurrentDocumentContainer() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.documents?.getCurrent?.()?.container ?? null;
}
