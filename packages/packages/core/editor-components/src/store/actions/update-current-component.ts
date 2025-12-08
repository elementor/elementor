import { setDocumentModifiedStatus, type V1Document } from '@elementor/editor-documents';
import { __getStore as getStore } from '@elementor/store';

import { type ComponentsPathItem, slice } from '../store';

export function updateCurrentComponent( {
	path,
	currentComponentId,
}: {
	path: ComponentsPathItem[];
	currentComponentId: V1Document[ 'id' ] | null;
} ) {
	const dispatch = getStore()?.dispatch;

	if ( ! dispatch ) {
		return;
	}

	dispatch( slice.actions.setPath( path ) );
	dispatch( slice.actions.setCurrentComponentId( currentComponentId ) );
}

export const archiveComponent = ( componentId: number ) => {
	const store = getStore();
	const dispatch = store?.dispatch;

	if ( ! dispatch ) {
		return;
	}

	dispatch( slice.actions.archive( componentId ) );
	setDocumentModifiedStatus( true );
};
