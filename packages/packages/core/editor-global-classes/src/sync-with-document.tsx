import { useEffect } from 'react';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { usePanelActions } from './components/class-manager/class-manager-panel';
import { syncWithDocumentSave } from './sync-with-document-save';

export function SyncWithDocumentSave() {
	const panelActions = usePanelActions();

	useEffect( () => {
		listenTo( v1ReadyEvent(), () => {
			syncWithDocumentSave( panelActions );
		} );

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
}
