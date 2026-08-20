import { getV1CurrentDocument } from '@elementor/editor-documents';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { embeddedDocumentsManager, setCurrentDocumentId } from './manager';
import { embeddedDocumentsStylesProvider } from './styles-provider';

export function init() {
	stylesRepository.register( embeddedDocumentsStylesProvider );

	registerDataHook( 'after', 'editor/documents/attach-preview', () => {
		const { id } = getV1CurrentDocument() ?? {};

		setCurrentDocumentId( id ?? null );
		embeddedDocumentsManager.reset();
	} );
}
