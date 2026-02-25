import { isDocumentDirty, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentDocumentsMap, getComponentDocuments } from '../../utils/get-component-documents';
import { loadComponentsOverridableProps } from './load-components-overridable-props';
import { loadComponentsStyles } from './load-components-styles';

export async function loadComponentsAssets( elements: V1ElementData[] ) {
	const documents = await getComponentDocuments( elements );

	updateDocumentState( documents );
	loadComponentsStyles( documents );

	await loadComponentsOverridableProps( [ ...documents.keys() ] );
}

function updateDocumentState( documents: ComponentDocumentsMap ) {
	const isDrafted = [ ...documents.values() ].some( isDocumentDirty );

	if ( isDrafted ) {
		setDocumentModifiedStatus( true );
	}
}
