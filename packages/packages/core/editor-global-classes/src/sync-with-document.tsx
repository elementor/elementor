import { useEffect } from 'react';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { openClassManager } from './open-design-system';
import { syncWithDocumentSave } from './sync-with-document-save';

export function SyncWithDocumentSave() {
	useEffect( () => {
		const unsubscribe = listenTo( v1ReadyEvent(), () => {
			syncWithDocumentSave( { open: openClassManager } );
		} );

		return unsubscribe;
	}, [] );

	return null;
}
