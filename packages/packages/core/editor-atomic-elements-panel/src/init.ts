import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { registerPanel } from '@elementor/editor-panels';

import { AtomicEntryRedirect } from './components/atomic-entry-redirect';
import { LegacyPanelSwitcher } from './components/legacy-panel-switcher';
import { isAtomicElementsPanelEnabled } from './gate';
import { panel } from './panel';

export function init() {
	if ( ! isAtomicElementsPanelEnabled() ) {
		return;
	}

	registerPanel( panel );

	injectIntoLogic( { id: 'atomic-elements-panel-entry-redirect', component: AtomicEntryRedirect } );
	injectIntoTop( { id: 'atomic-elements-panel-legacy-switcher', component: LegacyPanelSwitcher } );
}
