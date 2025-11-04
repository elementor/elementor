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

	const componentDocumentData = await Promise.all( getComponentIds( elements ).map( getComponentDocumentData ) );

	const draftIds = componentDocumentData
		.filter( ( data ) => data.status.value === 'draft' )
		.map( ( data ) => data.id );

	if ( draftIds.length === 0 ) {
		return;
	}

	await apiClient.updateStatuses( draftIds, 'publish' );

	draftIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );
}
