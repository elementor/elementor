import { __createPanel as createPanel } from '@elementor/editor-panels';
import { changeEditMode } from '@elementor/editor-v1-adapters';

import { blockPanelInteractions, unblockPanelInteractions } from './panel-interactions';

const id = 'global-classes-manager';

export const { usePanelActions } = createPanel( {
	id,
	component: () => null, // Placeholder component
	allowedEditModes: [ 'edit', id ],
	onOpen: () => {
		changeEditMode( id );
		blockPanelInteractions();
	},
	onClose: () => {
		changeEditMode( 'edit' );
		unblockPanelInteractions();
	},
} );
