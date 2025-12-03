import { initCleanInteractionIdsOnDuplicate } from './hooks/on-duplicate';
import { interactionsRepository } from './interactions-repository';
import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';

export function init() {
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
		initCleanInteractionIdsOnDuplicate();
	} catch ( error ) {
		throw error;
	}
}
