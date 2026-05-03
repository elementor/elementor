import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { __dispatch as dispatch } from '@elementor/store';

import { apiClient, type GlobalClassIndexEntry, type StyleDefinitionsNullableMap } from './api';
import { slice } from './store';

export function indexEntriesToClassLabels( entries: GlobalClassIndexEntry[] ): Record< StyleDefinitionID, string > {
	return Object.fromEntries( entries.map( ( e ) => [ e.id, e.label ] ) );
}

export function styleDefinitionsMapWithoutNull(
	map: StyleDefinitionsNullableMap
): Record< StyleDefinitionID, StyleDefinition > {
	return Object.fromEntries(
		Object.entries( map ).filter(
			( entry ): entry is [ StyleDefinitionID, StyleDefinition ] => entry[ 1 ] !== null
		)
	) as Record< StyleDefinitionID, StyleDefinition >;
}

export async function fetchAndDispatchGlobalClasses( postId?: number ) {
	const previewIndexRes = await apiClient.all( 'preview' );
	const previewIndex = previewIndexRes.data.data;
	const classLabels = indexEntriesToClassLabels( previewIndex );
	const globalOrder = previewIndex.map( ( e ) => e.id );

	if ( ! postId ) {
		dispatch(
			slice.actions.load( {
				preview: { items: {}, order: globalOrder },
				frontend: { items: {}, order: globalOrder },
				classLabels,
			} )
		);
		return;
	}

	const [ frontendIndexRes, previewPostRes, frontendPostRes ] = await Promise.all( [
		apiClient.all( 'frontend' ),
		apiClient.getStylesForPost( postId, 'preview' ),
		apiClient.getStylesForPost( postId, 'frontend' ),
	] );

	void frontendIndexRes;

	const previewItems = styleDefinitionsMapWithoutNull( previewPostRes.data.data );
	const frontendItems = styleDefinitionsMapWithoutNull( frontendPostRes.data.data );

	dispatch(
		slice.actions.load( {
			preview: { items: previewItems, order: globalOrder },
			frontend: { items: frontendItems, order: globalOrder },
			classLabels,
		} )
	);
}
