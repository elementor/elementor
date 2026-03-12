import { getCurrentUser } from '@elementor/editor-current-user';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { UPDATE_CLASS_CAPABILITY_KEY } from './capabilities';
import { saveGlobalClasses } from './save-global-classes';
import { selectIsDirty } from './store';

let pendingSave: Promise< void > | null = null;

export function syncWithDocumentSave( panelActions?: { open: () => void } ) {
	const unsubscribe = syncDirtyState();

	bindSaveAction( panelActions );
	bindBeforeSaveTemplateAction();

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

function triggerSave( panelActions?: { open: () => void }, context: 'preview' | 'frontend' = 'preview' ) {
	const user = getCurrentUser();
	const canEdit = user?.capabilities.includes( UPDATE_CLASS_CAPABILITY_KEY );

	if ( ! canEdit ) {
		return null;
	}

	if ( pendingSave ) {
		return pendingSave;
	}

	const promise = saveGlobalClasses( {
		context,
		onApprove: panelActions?.open,
	} );

	pendingSave = promise;
	promise.finally( () => {
		pendingSave = null;
	} );

	return promise;
}

function bindSaveAction( panelActions?: { open: () => void } ) {
	registerDataHook( 'dependency', 'document/save/save', ( args ) => {
		triggerSave( panelActions, args.status === 'publish' ? 'frontend' : 'preview' );

		return true;
	} );
}

function bindBeforeSaveTemplateAction() {
	window.addEventListener( 'elementor/global-styles/before-save', ( ( event: CustomEvent ) => {
		if ( ! pendingSave && isDirty() ) {
			triggerSave();
		}

		if ( pendingSave ) {
			event.detail.promises.push( pendingSave );
		}
	} ) as EventListener );
}

function isDirty() {
	return selectIsDirty( getState() );
}
