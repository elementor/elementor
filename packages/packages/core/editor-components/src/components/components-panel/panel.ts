import { createPanel } from '@elementor/editor-panels';

import { Components } from '../components-tab/components';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: 'components-panel',
	component: Components,
} );
