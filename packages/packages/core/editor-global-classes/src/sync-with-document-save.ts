import { getCurrentUser } from '@elementor/editor-current-user';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { UPDATE_CLASS_CAPABILITY_KEY } from './capabilities';
import { saveGlobalClasses } from './save-global-classes';
import { selectIsDirty } from './store';

export function syncWithDocumentSave() {
	const unsubscribe = syncDirtyState();

	bindSaveAction();

	return unsubscribe;
}

function syncDirtyState() {
	return subscribeWithSelector( selectIsDirty, () => {
		if ( ! isDirty() ) {
			return;
		}

		setDocumentModifiedStatus( true );
	} );
}

function bindSaveAction() {
	registerDataHook( 'after', 'document/save/save', ( args ) => {
		const user = getCurrentUser();

		const canEdit = user?.capabilities.includes( UPDATE_CLASS_CAPABILITY_KEY );

		if ( ! canEdit ) {
			return;
		}

		return saveGlobalClasses( {
			context: args.status === 'publish' ? 'frontend' : 'preview',
		} );
	} );
}

function isDirty() {
	return selectIsDirty( getState() );
}
