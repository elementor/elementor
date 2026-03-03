import { __createPanel as createPanel } from '@elementor/editor-panels';

import { EditingPanel } from './components/editing-panel';

export const { panel, usePanelActions, usePanelStatus } = createPanel( {
	id: 'editing-panel',
	component: EditingPanel,
} );
