import { getHostDocumentId } from './get-host-document-id';
import { type ExtendedWindow, type V1Element } from './types';

export function getHostDocumentContainer(): V1Element | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const hostId = getHostDocumentId();

	if ( ! hostId ) {
		return null;
	}

	return extendedWindow.elementor?.documents?.get?.( hostId )?.container ?? null;
}
