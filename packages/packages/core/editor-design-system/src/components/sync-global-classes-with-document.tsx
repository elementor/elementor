import { useEffect } from 'react';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { syncWithDocumentSave } from '@elementor/editor-global-classes';

import { usePanelActions } from '../design-system-panel';

export function SyncGlobalClassesWithDocument() {
	const panelActions = usePanelActions();

	useEffect( () => {
		listenTo( v1ReadyEvent(), () => {
			syncWithDocumentSave( panelActions );
		} );

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
}
