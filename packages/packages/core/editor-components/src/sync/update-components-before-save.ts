import { isDocumentDirty } from '@elementor/editor-documents';
import { apiClient } from '../api';
import { type DocumentSaveStatus } from '../types';
import { type V1ElementData } from '@elementor/editor-elements';
import { getComponentDocumentData, invalidateComponentDocumentData } from '../utils/component-document-data';
import { getComponentIds } from '../utils/get-component-ids';

type Options = {
	status: DocumentSaveStatus;
	elements: V1ElementData[];	
};

export async function updateComponentsBeforeSave( { status, elements }: Options ) {
	if ( status !== 'publish' ) {
		return;
	}

	const componentIds = await getComponentIds( elements );

	const componentDocumentData = await Promise.all( componentIds.map( getComponentDocumentData ) );

	const draftIds = componentDocumentData
		.filter( ( document ) => !! document )
		.filter( isDocumentDirty )
		.map( ( document ) => document.id );

	if ( draftIds.length === 0 ) {
		return;
	}

	await apiClient.updateStatuses( draftIds, 'publish' );

	draftIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );
}
