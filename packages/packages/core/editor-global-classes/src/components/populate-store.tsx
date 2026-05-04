import { useEffect } from 'react';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { loadDocumentClasses } from '../load-document-classes';

export function PopulateStore() {
	useEffect( () => {
		// TODO - we run it early to have the labels mapping prior to the canvas rendering
		// but in fact we need a way to re-render any dependant twig-templated widgets/elements once we get the initial data
		// in case the canvas rendering has occurred prior to the resolving of this fetch
		loadDocumentClasses();

		registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
			await loadDocumentClasses();
		} );
	}, [] );

	return null;
}
