import * as React from 'react';
import { createPanel } from '@elementor/editor-panels';

import { AtomicElementsPanel } from './components/atomic-elements-panel';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: 'atomic-elements-panel',
	component: ConnectedAtomicElementsPanel,
	isOpenPreviousElement: true,
} );

function ConnectedAtomicElementsPanel() {
	const { isBlocked } = usePanelStatus();
	const { open, close } = usePanelActions();

	return <AtomicElementsPanel isBlocked={ isBlocked } open={ open } close={ close } />;
}
