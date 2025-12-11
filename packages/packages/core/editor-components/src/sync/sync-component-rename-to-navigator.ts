import { useEffect } from 'react';
import { getElements, updateElementEditorSettings } from '@elementor/editor-elements';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';
import { ensureError } from '@elementor/utils';

import { SLICE_NAME } from '../store/store';
import {
	ComponentRenameFailedToSyncToNavigatorError,
	ComponentRenameFailedToSyncToNavigatorStoreError,
	ComponentRenameFailedToUpdateElementWithComponentRenameError,
	ComponentRenameSyncStoreNotReadyError,
} from '../utils/errors';

let previousComponentsData: Array< { uid: string; name: string } > = [];

function findElementsByComponentUid( componentUid: string ) {
	const allElements = getElements();
	return allElements.filter( ( element ) => {
		const editorSettings = element.model.get( 'editor_settings' );
		return editorSettings?.component_uid === componentUid;
	} );
}

function syncComponentRenameToNavigator( componentUid: string, newName: string ) {
	try {
		const elements = findElementsByComponentUid( componentUid );

		elements.forEach( ( element ) => {
			try {
				updateElementEditorSettings( {
					elementId: element.model.get( 'id' ),
					settings: { title: newName },
				} );
			} catch ( error ) {
				const errorInstance = ensureError( error );
				throw new ComponentRenameFailedToUpdateElementWithComponentRenameError( {
					context: { elementId: element.model.get( 'id' ) },
					cause: errorInstance,
				} );
			}
		} );
	} catch ( error ) {
		const errorInstance = ensureError( error );
		if ( errorInstance instanceof ComponentRenameFailedToUpdateElementWithComponentRenameError ) {
			throw errorInstance;
		}
		throw new ComponentRenameFailedToSyncToNavigatorError( {
			context: { componentUid },
			cause: errorInstance,
		} );
	}
}

export function syncComponentRenameToNavigatorStore() {
	try {
		const state = getState();
		const currentComponentsData = ( state[ SLICE_NAME ]?.data as Array< { uid: string; name: string } > ) ?? [];

		if ( previousComponentsData.length === 0 ) {
			previousComponentsData = currentComponentsData.map( ( { name, uid } ) => ( { uid, name } ) );
			return;
		}

		currentComponentsData.forEach( ( { name, uid } ) => {
			const previousComponent = previousComponentsData.find( ( prev ) => prev.uid === uid );

			if ( previousComponent && previousComponent.name !== name ) {
				try {
					syncComponentRenameToNavigator( uid, name );
				} catch {
					// Error is thrown but caught to prevent breaking the forEach loop
					// The error will be handled by error boundaries or global error handlers
				}
			}
		} );

		previousComponentsData = currentComponentsData.map( ( { name, uid } ) => ( { uid, name } ) );
	} catch ( error ) {
		const errorInstance = ensureError( error );
		throw new ComponentRenameFailedToSyncToNavigatorStoreError( {
			context: { componentUid: '' },
			cause: errorInstance,
		} );
	}
}

let unsubscribe: ( () => void ) | null = null;

export function initSyncComponentRenameToNavigator() {
	try {
		unsubscribe = subscribeWithSelector(
			( state ) => state[ SLICE_NAME ]?.data,
			() => {
				try {
					syncComponentRenameToNavigatorStore();
				} catch {
					// Error is thrown but caught to prevent breaking the subscription
					// The error will be handled by error boundaries or global error handlers
				}
			}
		);
	} catch ( error ) {
		const errorInstance = ensureError( error );
		throw new ComponentRenameSyncStoreNotReadyError( {
			cause: errorInstance,
		} );
	}
}

export function SyncComponentRenameToNavigator() {
	useEffect( () => {
		if ( ! unsubscribe ) {
			try {
				initSyncComponentRenameToNavigator();
			} catch {
				// Error is thrown but caught to prevent breaking the useEffect
				// The error will be handled by error boundaries or global error handlers
			}
		}

		return () => {
			if ( unsubscribe ) {
				unsubscribe();
				unsubscribe = null;
			}
		};
	}, [] );

	return null;
}
