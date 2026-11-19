import { registerPanel } from '@elementor/editor-panels';

import { isAtomicElementsPanelEnabled } from './gate';
import { panel } from './panel';

export function init() {
	if ( ! isAtomicElementsPanelEnabled() ) {
		return;
	}

	registerPanel( panel );
}
