import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';
import { interactionsRepository } from './interactions-repository';

export function init() {
	console.log( '[Interactions Repo] init() called' );
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
		console.log( '[Interactions Repo] Provider registered successfully' );
	} catch ( error ) {
		console.error( '[Interactions Repo] Error during registration:', error );
		throw error;
	}
}

