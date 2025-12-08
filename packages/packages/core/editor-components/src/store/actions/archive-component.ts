import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { __getStore as getStore } from '@elementor/store';

import { slice } from '../store';

export const archiveComponent = ( componentId: number ) => {
	const store = getStore();
	const dispatch = store?.dispatch;

	if ( ! dispatch ) {
		return;
	}

	dispatch( slice.actions.archive( componentId ) );
	setDocumentModifiedStatus( true );
};
