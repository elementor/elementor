import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';
import { interactionsRepository } from './interactions-repository';

export function init() {
	interactionsRepository.register( documentElementsInteractionsProvider );
}

