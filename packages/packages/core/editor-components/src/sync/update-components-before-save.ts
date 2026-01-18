import { isDocumentDirty } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';

import { apiClient } from '../api';
import { type DocumentSaveStatus } from '../types';
import { invalidateComponentDocumentData } from '../utils/component-document-data';
import { getComponentDocuments } from '../utils/get-component-documents';

type Options = {
	status: DocumentSaveStatus;
	elements: V1ElementData[];
};

export async function updateComponentsBeforeSave( { status, elements }: Options ) {
	if ( status !== 'publish' ) {
		return;
	}

	const documents = await getComponentDocuments( elements );

	const draftIds = [ ...documents.values() ].filter( isDocumentDirty ).map( ( document ) => document.id );

	if ( draftIds.length === 0 ) {
		return;
	}

	await apiClient.updateStatuses( draftIds, 'publish' );

	draftIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );
}
