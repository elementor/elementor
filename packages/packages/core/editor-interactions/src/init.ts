import { Trigger } from './components/controls/trigger';
import { initCleanInteractionIdsOnDuplicate } from './hooks/on-duplicate';
import { registerInteractionsControl } from './interactions-controls-registry';
import { interactionsRepository } from './interactions-repository';
import { documentElementsInteractionsProvider } from './providers/document-elements-interactions-provider';

export function init() {
	try {
		interactionsRepository.register( documentElementsInteractionsProvider );
		initCleanInteractionIdsOnDuplicate();
		registerInteractionsControl( {
			type: 'trigger',
			component: Trigger,
			options: [ 'load', 'scrollIn' ],
		} );
	} catch ( error ) {
		throw error;
	}
}
