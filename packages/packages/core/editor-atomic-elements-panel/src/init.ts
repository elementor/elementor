import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { registerPanel } from '@elementor/editor-panels';
import { blockCommand } from '@elementor/editor-v1-adapters';

import { AtomicEntryRedirect } from './components/atomic-entry-redirect';
import { LegacyPanelSwitcher } from './components/legacy-panel-switcher';
import { isAtomicElementsPanelEnabled } from './gate';
import { isPanelOpen, panel } from './panel';

export function init() {
	if ( ! isAtomicElementsPanelEnabled() ) {
		return;
	}

	registerPanel( panel );

	blockCommand( { command: 'panel/open-default', condition: ( { refresh } ) => ! refresh && isPanelOpen() } );

	injectIntoLogic( { id: 'atomic-elements-panel-entry-redirect', component: AtomicEntryRedirect } );
	injectIntoTop( { id: 'atomic-elements-panel-legacy-switcher', component: LegacyPanelSwitcher } );
}
