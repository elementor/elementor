import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from './api';
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

	const response = await apiClient.getStylesByIds( idsToFetch, 'preview' );
	const items = response.data.data as Record< StyleDefinitionID, StyleDefinition >;

	dispatch( slice.actions.mergeExistingClasses( { items } ) );
}

export function loadExistingClassSync( classId: StyleDefinitionID ): void {
	const existingClasses = selectGlobalClasses( getState() );

	if ( classId in existingClasses ) {
		return;
	}

	loadExistingClasses( [ classId ] );
}
