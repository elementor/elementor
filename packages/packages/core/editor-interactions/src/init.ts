import { interactionsRepository } from './interactions-repository';
import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';

export function init() {
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
	} catch ( error ) {
		throw error;
	}
}
