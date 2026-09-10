import { getV1DocumentsManager } from '@elementor/editor-documents';
import { embeddedDocumentsManager } from '@elementor/editor-embedded-documents-manager';
import { __getState as getState } from '@elementor/store';

import { type ComponentsSlice, selectCurrentComponentId, selectPath } from '../../store/store';
import { getComponentDocumentData } from '../../utils/component-document-data';

export async function loadAncestorDocumentsAssets() {
	const ancestorIds = getAncestorDocumentIds();

	if ( ancestorIds.length === 0 ) {
		return;
	}

	await Promise.all(
		ancestorIds.map( async ( id ) => {
			const document = await getComponentDocumentData( id );

			if ( document ) {
				embeddedDocumentsManager.setDocument( id, document );
			}
		} )
	);
}

function getAncestorDocumentIds(): number[] {
	const state = getState() as ComponentsSlice;
	const currentComponentId = selectCurrentComponentId( state );

	if ( currentComponentId === null ) {
		return [];
	}

	const path = selectPath( state );
	const pathAncestors = path
		.filter( ( item ) => item.componentId !== currentComponentId )
		.map( ( item ) => item.componentId );

	const initialId = getV1DocumentsManager().getInitialId();

	return [ ...new Set( [ initialId, ...pathAncestors ] ) ];
}
