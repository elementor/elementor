import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';
import { interactionsRepository } from './interactions-repository';

export function init() {
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
	} catch ( error ) {
		throw error;
	}
}

