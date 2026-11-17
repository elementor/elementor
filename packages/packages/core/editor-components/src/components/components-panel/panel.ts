import { createPanel } from '@elementor/editor-panels';

import { ComponentsPanel } from './components-panel';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: 'components-panel',
	component: ComponentsPanel,
} );
