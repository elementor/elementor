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

	const componentDocumentData = await Promise.all(
		getComponentIds( elements ).map( ( id ) => getComponentDocumentData( id ) )
	);

	const draftIds = componentDocumentData
		.filter( ( data ) => !! data )
		.filter( ( data ) => {
			const isDraft = data.status.value === 'draft';

			// When the component is published, but have draft version.
			const hasAutosave = data.revisions.current_id !== data.id;

			return isDraft || hasAutosave;
		} )
		.map( ( data ) => data.id );

	if ( draftIds.length === 0 ) {
		return;
	}

	await apiClient.updateStatuses( draftIds, 'publish' );

	draftIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );
}
