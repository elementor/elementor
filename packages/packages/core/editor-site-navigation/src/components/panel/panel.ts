import { __createPanel } from '@elementor/editor-panels';

import Shell from './shell';

export const { panel, usePanelStatus, usePanelActions } = __createPanel( {
	id: 'site-navigation-panel',
	component: Shell,
} );
