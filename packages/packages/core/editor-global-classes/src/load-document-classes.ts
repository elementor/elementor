import { getCurrentDocument } from '@elementor/editor-documents';
import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { __dispatch as dispatch } from '@elementor/store';

import { apiClient, type StyleDefinitionsNullableMap } from './api';
import { slice } from './store';
import { createLabelsForClasses } from './utils/create-labels-for-classes';

export function styleDefinitionsMapWithoutNull(
	map: StyleDefinitionsNullableMap
): Record< StyleDefinitionID, StyleDefinition > {
	return Object.fromEntries(
		Object.entries( map ).filter(
			( entry ): entry is [ StyleDefinitionID, StyleDefinition ] => entry[ 1 ] !== null
		)
	);
}

function resetGlobalClassesState( globalOrder: StyleDefinitionID[], classLabels: Record< StyleDefinitionID, string > ) {
	dispatch(
		slice.actions.load( {
			preview: { items: {}, order: globalOrder },
			frontend: { items: {}, order: globalOrder },
			classLabels,
		} )
	);
}

export async function loadCurrentDocumentClasses() {
	const [ previewIndexRes, frontendIndexRes ] = await Promise.all( [
		apiClient.all( 'preview' ),
		apiClient.all( 'frontend' ),
	] );

	const previewIndex = previewIndexRes.data.data;
	const frontendIndex = frontendIndexRes.data.data;

	const classLabels = createLabelsForClasses( previewIndex );
	const previewOrder = previewIndex.map( ( e ) => e.id );
	const frontendOrder = frontendIndex.map( ( e ) => e.id );

	// This is intended to establish the baseline with current labels and order
	// without it we won't be able to properly resolve the styles' class names
	resetGlobalClassesState( previewOrder, classLabels );

	const postId = getCurrentDocument()?.id;
	if ( ! postId ) {
		return;
	}

	const [ previewPostRes, frontendPostRes ] = await Promise.all( [
		apiClient.getStylesForPost( postId, 'preview' ),
		apiClient.getStylesForPost( postId, 'frontend' ),
	] );

	const previewItems = styleDefinitionsMapWithoutNull( previewPostRes.data.data );
	const frontendItems = styleDefinitionsMapWithoutNull( frontendPostRes.data.data );

	dispatch(
		slice.actions.load( {
			preview: { items: previewItems, order: previewOrder },
			frontend: { items: frontendItems, order: frontendOrder },
			classLabels,
		} )
	);
}

export async function addDocumentClasses( documentId: number ) {
	const [ previewPostRes, frontendPostRes ] = await Promise.all( [
		apiClient.getStylesForPost( documentId, 'preview' ),
		apiClient.getStylesForPost( documentId, 'frontend' ),
	] );

	const previewItems = styleDefinitionsMapWithoutNull( previewPostRes.data.data );
	const frontendItems = styleDefinitionsMapWithoutNull( frontendPostRes.data.data );

	dispatch(
		slice.actions.mergeExistingClasses( {
			preview: previewItems,
			frontend: frontendItems,
		} )
	);
}
