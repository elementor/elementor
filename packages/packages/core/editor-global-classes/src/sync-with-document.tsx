import { useEffect } from 'react';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { syncWithDocumentSave } from './sync-with-document-save';

export function SyncWithDocumentSave() {
	useEffect( () => {
		const unsubscribe = listenTo( v1ReadyEvent(), () => {
			const open = () => {
				window.dispatchEvent( new CustomEvent( 'elementor/open-global-classes-manager' ) );
			};

			syncWithDocumentSave( { open } );
		} );

		return unsubscribe;
	}, [] );

	return null;
}
