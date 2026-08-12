import * as React from 'react';
import { __createPanel as createPanel } from '@elementor/editor-panels';
import { changeEditMode } from '@elementor/editor-v1-adapters';

import { DefaultStylesPanelContent } from './components/default-styles-panel-content';

const PANEL_ID = 'default-styles';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: PANEL_ID,
	component: DefaultStylesPanelRoot,
	allowedEditModes: [ 'edit', PANEL_ID ],
	onOpen: () => {
		changeEditMode( PANEL_ID );
	},
	onClose: async () => {
		changeEditMode( 'edit' );
	},
	isOpenPreviousElement: true,
} );

function DefaultStylesPanelRoot() {
	const { close: closePanel } = usePanelActions();

	return <DefaultStylesPanelContent onRequestClose={ closePanel } />;
}
