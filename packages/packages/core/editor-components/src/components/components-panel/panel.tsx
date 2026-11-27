import * as React from 'react';
import { createPanel } from '@elementor/editor-panels';

import { ComponentsPanel } from './components-panel';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: 'components-panel',
	component: ComponentsPanelWithClose,
} );

function ComponentsPanelWithClose() {
	const { close } = usePanelActions();

	return <ComponentsPanel onRequestClose={ close } />;
}
