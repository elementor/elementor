import * as React from 'react';
import { __createPanel as createPanel } from '@elementor/editor-panels';
import { changeEditMode } from '@elementor/editor-v1-adapters';
import { selectOpenId } from '../../editor-panels/src/store';
import {
	__getState as getState,
	__useSelector as useSelector,
} from '@elementor/store';

import { DefaultStylesPanelContent } from './components/default-styles-panel-content';

export const DEFAULT_STYLES_PANEL_ID = 'default-styles';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
	id: DEFAULT_STYLES_PANEL_ID,
	component: DefaultStylesPanelRoot,
	allowedEditModes: [ 'edit', DEFAULT_STYLES_PANEL_ID ],
	onOpen: () => {
		changeEditMode( DEFAULT_STYLES_PANEL_ID );
	},
	onClose: async () => {
		changeEditMode( 'edit' );
	},
	isOpenPreviousElement: true,
} );

function DefaultStylesPanelRoot() {
	const { close } = usePanelActions();

	return (
		<DefaultStylesPanelContent
			onRequestClose={ () => {
				void close();
			} }
		/>
	);
}

export function useDefaultStylesPanelOpenInStore() {
	const openPanelId = useSelector( selectOpenId );

	return openPanelId === DEFAULT_STYLES_PANEL_ID;
}

export function isDefaultStylesPanelOpenInStore() {
	return selectOpenId( getState() ) === DEFAULT_STYLES_PANEL_ID;
}
