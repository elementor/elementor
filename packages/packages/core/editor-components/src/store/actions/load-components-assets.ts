import { type Document, isDocumentDirty, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { announcePost } from '@elementor/editor-related-posts-manager';

import { type ComponentDocumentsMap, getComponentDocuments } from '../../utils/get-component-documents';
import { loadComponentsOverridableProps } from './load-components-overridable-props';

export async function loadComponentsAssets( elements: V1ElementData[] ) {
	const documents = await getComponentDocuments( elements );

	updateDocumentState( documents );
	registerComponentDocuments( documents );

	await loadComponentsOverridableProps( [ ...documents.keys() ] );
}

function registerComponentDocuments( documents: ComponentDocumentsMap ) {
	for ( const [ id, document ] of documents ) {
		announcePost( id, document );
	}
}

function updateDocumentState( documents: ComponentDocumentsMap ) {
	const isDrafted = [ ...documents.values() ].some( isDocumentDirty );

	if ( isDrafted ) {
		setDocumentModifiedStatus( true );
	}
}
