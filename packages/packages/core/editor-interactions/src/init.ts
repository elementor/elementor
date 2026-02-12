import { Easing } from './components/controls/easing';
import { Effect } from './components/controls/effect';
import { Replay } from './components/controls/replay';
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

		registerInteractionsControl( {
			type: 'easing',
			component: Easing,
			options: [ 'easeIn' ],
		} );
		registerInteractionsControl( {
			type: 'replay',
			component: Replay,
			options: [ 'true', 'false' ],
		} );
		registerInteractionsControl( {
			type: 'effect',
			component: Effect,
			options: [ 'fade', 'slide', 'scale' ],
		} );
	} catch ( error ) {
		throw error;
	}
}
