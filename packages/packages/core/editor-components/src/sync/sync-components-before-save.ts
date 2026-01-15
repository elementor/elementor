import { isDocumentDirty } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { __getState as getState } from '@elementor/store';

import { apiClient, type SyncResponse } from '../api';
import { selectArchivedThisSession, selectUnpublishedComponents, selectUpdatedComponentNames } from '../store/store';
import { type DocumentSaveStatus } from '../types';
import { getComponentDocumentData } from '../utils/component-document-data';
import { getComponentIds } from '../utils/get-component-ids';
import { handleArchivedComponents } from './handle-archived-components';
import { handleCreatedComponents } from './handle-created-components';
import { handlePublishedComponents } from './handle-published-components';
import { handleRenamedComponents } from './handle-renamed-components';

type Options = {
	elements: V1ElementData[];
	status: DocumentSaveStatus;
};

export async function syncComponentsBeforeSave( { elements, status }: Options ): Promise< void > {
	const state = getState();

	const created = selectUnpublishedComponents( state ).map( ( component ) => ( {
		uid: component.uid,
		title: component.name,
		elements: component.elements,
		settings: component.overridableProps ? { overridable_props: component.overridableProps } : undefined,
	} ) );

	const archived = selectArchivedThisSession( state );
	const renamed = selectUpdatedComponentNames( state );
	const published = shouldPublishDocumentNestedComponents( status )
		? await getDocumentNestedComponentsIds( elements )
		: [];

	const response = await apiClient.sync( {
		status,
		created,
		published,
		archived,
		renamed,
	} );

	handleSyncResponse( response, elements );
}

function shouldPublishDocumentNestedComponents( status: DocumentSaveStatus ): boolean {
	return status === 'publish';
}

async function getDocumentNestedComponentsIds( elements: V1ElementData[] ): Promise< number[] > {
	const componentIds = await getComponentIds( elements );
	const componentDocumentData = await Promise.all( componentIds.map( getComponentDocumentData ) );

	return componentDocumentData
		.filter( ( document ) => !! document )
		.filter( isDocumentDirty )
		.map( ( document ) => document.id );
}

function handleSyncResponse( response: SyncResponse, elements: V1ElementData[] ): void {
	handleCreatedComponents( response.created, elements );
	handlePublishedComponents( response.published );
	handleArchivedComponents( response.archived );
	handleRenamedComponents( response.renamed );
}
