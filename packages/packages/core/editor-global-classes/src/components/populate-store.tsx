import { useEffect } from 'react';
import { getCurrentDocument } from '@elementor/editor-documents';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { fetchAndDispatchGlobalClasses } from '../load-global-classes-state';

export function PopulateStore() {
	useEffect( () => {
		fetchAndDispatchGlobalClasses( getCurrentDocument()?.id );

		registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
			await fetchAndDispatchGlobalClasses( getCurrentDocument()?.id );
		} );
	}, [] );

	return null;
}
