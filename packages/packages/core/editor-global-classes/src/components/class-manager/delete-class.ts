import { getV1CurrentDocument, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { doUnapplyClass } from '@elementor/editor-editing-panel';
import { getElements } from '@elementor/editor-elements';
import { __privateListenTo as listenTo, getCurrentEditMode, windowEvent } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';

const deletedClassIds = new Set< string >();
let unsubscribeFromEditModeChange: ( () => void ) | null = null;

export const deleteClass = ( id: string ) => {
	trackGlobalClasses( {
		event: 'classDeleted',
		classId: id,
		runAction: () => {
			dispatch( slice.actions.delete( id ) );
			deletedClassIds.add( id );
			cleanupOnReturnToEdit();
		},
	} );
};

const cleanupOnReturnToEdit = () => {
	if ( unsubscribeFromEditModeChange ) {
		// already set an event handler to the return to edit
		return;
	}

	if ( getCurrentEditMode() === 'edit' ) {
		// future support for class deletion directly from the editing panel
		// as we know this is called for the first time (as no unsubscribe is set)
		removeDeletedClassesFromElements();
		return;
	}

	unsubscribeFromEditModeChange = listenTo( windowEvent( 'elementor/edit-mode/change' ), () => {
		const unsubscribe = () => {
			unsubscribeFromEditModeChange?.();
			unsubscribeFromEditModeChange = null;
		};

		if ( deletedClassIds.size === 0 ) {
			unsubscribe();

			return;
		}

		const wasModifiedBeforeCleanup = Boolean( getV1CurrentDocument()?.editor?.isChanged );
		removeDeletedClassesFromElements();

		if ( ! wasModifiedBeforeCleanup ) {
			setDocumentModifiedStatus( false );
		}

		unsubscribe();
	} );
};

const removeDeletedClassesFromElements = () => {
	const idsToCleanup = [ ...deletedClassIds ];
	deletedClassIds.clear();

	getElements().forEach( ( element ) => {
		idsToCleanup.forEach( ( classId ) => doUnapplyClass( element.id, classId ) );
	} );
};
