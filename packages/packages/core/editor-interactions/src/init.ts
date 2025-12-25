import { Replay } from './components/controls/replay';
import { initCleanInteractionIdsOnDuplicate } from './hooks/on-duplicate';
import { registerInteractionsControl } from './interactions-controls-registry';
import { interactionsRepository } from './interactions-repository';
import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';

export function init() {
	registerInteractionsControl( {
		type: 'replay',
		component: Replay,
		options: [ 'yes', 'no' ],
	} );
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
		initCleanInteractionIdsOnDuplicate();
	} catch ( error ) {
		throw error;
	}
}
