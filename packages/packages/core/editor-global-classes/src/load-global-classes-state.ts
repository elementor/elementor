import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { __dispatch as dispatch } from '@elementor/store';

import { apiClient, type GlobalClassIndexEntry } from './api';
import { type GlobalClasses, slice } from './store';

export function indexEntriesToClassLabels( entries: GlobalClassIndexEntry[] ): Record< StyleDefinitionID, string > {
	return Object.fromEntries( entries.map( ( e ) => [ e.id, e.label ] ) );
}

export function buildGlobalClassesPayload(
	items: Record< StyleDefinitionID, StyleDefinition >,
	globalOrder: StyleDefinitionID[]
): GlobalClasses {
	return { items, order: globalOrder };
}

export async function fetchAndDispatchGlobalClasses( postId?: number ) {
	const previewIndexRes = await apiClient.all( 'preview' );
	const previewIndex = previewIndexRes.data.data;
	const classLabels = indexEntriesToClassLabels( previewIndex );
	const globalOrder = previewIndex.map( ( e ) => e.id );

	if ( ! postId ) {
		dispatch(
			slice.actions.load( {
				preview: buildGlobalClassesPayload( {}, globalOrder ),
				frontend: buildGlobalClassesPayload( {}, globalOrder ),
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

	const previewItems = previewPostRes.data.data as Record< StyleDefinitionID, StyleDefinition >;
	const frontendItems = frontendPostRes.data.data as Record< StyleDefinitionID, StyleDefinition >;

	dispatch(
		slice.actions.load( {
			preview: buildGlobalClassesPayload( previewItems, globalOrder ),
			frontend: buildGlobalClassesPayload( frontendItems, globalOrder ),
			classLabels,
		} )
	);
}
