import { type Document } from '@elementor/editor-documents';
import { ajax } from '@elementor/editor-v1-adapters';

// Mirrors the v1 documents manager request args so both share one ajax cache entry, keeping
// `elementor.documents.invalidateCache()` effective. Unlike the manager, this omits `immediately`,
// so component fetches triggered together merge into a single batched request.
const getComponentDocumentParams = ( id: number ) => ( {
	action: 'get_document_config',
	unique_id: `document-${ id }`,
	data: { id },
} );

export const getComponentDocumentData = async ( id: number ) => {
	try {
		return await ajax.load< { id: number }, Document >( getComponentDocumentParams( id ) );
	} catch {
		return null;
	}
};
