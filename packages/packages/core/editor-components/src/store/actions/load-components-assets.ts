import { isDocumentDirty, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { embeddedDocumentsManager } from '@elementor/editor-embedded-documents-manager';

import { type ComponentDocumentsMap, getComponentDocuments } from '../../utils/get-component-documents';
import { loadComponentsOverridableProps } from './load-components-overridable-props';

export async function loadComponentsAssets( elements: V1ElementData[] ) {
	const documents = await getComponentDocuments( { elements, isRecursive: false } );

	updateDocumentState( documents );
	documents.forEach( ( document, id ) => {
		embeddedDocumentsManager.setDocument( id, document );
	} );

	await loadComponentsOverridableProps( [ ...documents.keys() ] );
}

function updateDocumentState( documents: ComponentDocumentsMap ) {
	const isDrafted = [ ...documents.values() ].some( isDocumentDirty );

	if ( isDrafted ) {
		setDocumentModifiedStatus( true );
	}
}
