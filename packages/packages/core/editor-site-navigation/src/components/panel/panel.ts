import { createPanel } from '@elementor/editor-panels';

import Shell from './shell';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: 'site-navigation-panel',
	component: Shell,
} );
