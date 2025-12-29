import { initCleanInteractionIdsOnDuplicate } from './hooks/on-duplicate';
import { interactionsRepository } from './interactions-repository';
import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';

type WindowWithElementorPro = Window & {
	elementorPro?: unknown;
};

const hasPro = !! ( window as WindowWithElementorPro ).elementorPro;

export function init() {
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
		initCleanInteractionIdsOnDuplicate();
	} catch ( error ) {
		throw error;
	}

	if ( hasPro ) {
		return;
	}

	// Add registerInteractionsControl for promotion replay control
}
