import { isDocumentDirty } from '@elementor/editor-documents';

import { apiClient } from '../api';
import { type Container, type DocumentSaveStatus } from '../types';
import { getComponentDocumentData, invalidateComponentDocumentData } from '../utils/component-document-data';
import { getComponentIds } from '../utils/get-component-ids';

type Options = {
	status: DocumentSaveStatus;
	container: Container;
};

export async function updateComponentsBeforeSave( { status, container }: Options ) {
	if ( status !== 'publish' ) {
		return;
	}

	const elements = container.model.get( 'elements' ).toJSON();

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
