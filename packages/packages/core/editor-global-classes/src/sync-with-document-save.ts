import { getCurrentUser } from '@elementor/editor-current-user';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	__privateListenTo as listenTo,
	type CommandEvent,
	commandStartEvent,
} from '@elementor/editor-v1-adapters';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { UPDATE_CLASS_CAPABILITY_KEY } from './capabilities';
import { saveGlobalClasses } from './save-global-classes';
import { selectIsDirty } from './store';

export function syncWithDocumentSave( panelActions?: { open: () => void } ) {
	const unsubscribe = syncDirtyState();

	bindSaveAction( panelActions );

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

function bindSaveAction( panelActions?: { open: () => void } ) {
	listenTo( commandStartEvent( 'document/save/save' ), ( e ) => {
		if ( e.type !== 'command' ) {
			return;
		}

		const commandEvent = e as CommandEvent< { status: string } >;

		const user = getCurrentUser();

		const canEdit = user?.capabilities.includes( UPDATE_CLASS_CAPABILITY_KEY );

		if ( ! canEdit ) {
			return;
		}

		saveGlobalClasses( {
			context: commandEvent.args.status === 'publish' ? 'frontend' : 'preview',
			onApprove: panelActions?.open,
		} );
	} );
}

function isDirty() {
	return selectIsDirty( getState() );
}
