import { useOnSwitchToLegacyElementsPanel } from '@elementor/editor-elements-panel';

import { usePanelActions, usePanelStatus } from './panel';

export function ComponentsLegacyGuard() {
	const { isOpen } = usePanelStatus();
	const { close } = usePanelActions();

	useOnSwitchToLegacyElementsPanel( () => {
		if ( isOpen ) {
			close();
		}
	} );

	return null;
}
