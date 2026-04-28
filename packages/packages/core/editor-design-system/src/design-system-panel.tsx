import * as React from 'react';
import { __createPanel as createPanel } from '@elementor/editor-panels';
import { changeEditMode } from '@elementor/editor-v1-adapters';

// import {
// 	blockPanelInteractions,
// 	reloadCurrentDocument,
// 	unblockPanelInteractions,
// } from '@elementor/editor-global-classes';

import { DesignSystemPanelContent } from './components/design-system-panel-content';

const PANEL_ID = 'design-system';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: PANEL_ID,
	component: DesignSystemPanelRoot,
	allowedEditModes: [ 'edit', PANEL_ID ],
	onOpen: () => {
		changeEditMode( PANEL_ID );
		// blockPanelInteractions();
	},
	onClose: async () => {
		changeEditMode( 'edit' );
		// await reloadCurrentDocument();
		// unblockPanelInteractions();
	},
	isOpenPreviousElement: true,
} );

function DesignSystemPanelRoot() {
	const { close: closePanel } = usePanelActions();
	return <DesignSystemPanelContent onRequestClose={ closePanel } />;
}