import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { loadSubDocumentsStyles } from './load-sub-documents-styles';
import { clearSubDocumentStyles, subDocumentsStylesProvider } from './sub-documents-styles-provider';

export function initSubDocumentsStyles() {
	stylesRepository.register( subDocumentsStylesProvider );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		clearSubDocumentStyles();
		await loadSubDocumentsStyles();
	} );
}
