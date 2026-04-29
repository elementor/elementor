import { type StyleDefinitionID } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from './api';
import { styleDefinitionsMapWithoutNull } from './load-global-classes-state';
import { selectGlobalClasses, slice } from './store';

let pendingLoad: Promise< void > | null = null;
const pendingIds = new Set< StyleDefinitionID >();

export async function loadExistingClasses( classIds: StyleDefinitionID[] ): Promise< void > {
	const existingClasses = selectGlobalClasses( getState() );
	const missingIds = classIds.filter( ( id ) => ! ( id in existingClasses ) );

	if ( missingIds.length === 0 ) {
		return;
	}

	missingIds.forEach( ( id ) => pendingIds.add( id ) );

	if ( pendingLoad ) {
		await pendingLoad;
		return loadExistingClasses( classIds );
	}

	pendingLoad = fetchAndMergeClasses();

	try {
		await pendingLoad;
	} finally {
		pendingLoad = null;
	}
}

async function fetchAndMergeClasses(): Promise< void > {
	const idsToFetch = Array.from( pendingIds );
	pendingIds.clear();

	if ( idsToFetch.length === 0 ) {
		return;
	}

	const previewResponse = await apiClient.getStylesByIds( idsToFetch, 'preview' );
	const frontendResponse = await apiClient.getStylesByIds( idsToFetch, 'frontend' );
	const previewItems = styleDefinitionsMapWithoutNull( previewResponse.data.data );
	const frontendItems = styleDefinitionsMapWithoutNull( frontendResponse.data.data );

	dispatch( slice.actions.mergeExistingClasses( { preview: previewItems, frontend: frontendItems } ) );
}
