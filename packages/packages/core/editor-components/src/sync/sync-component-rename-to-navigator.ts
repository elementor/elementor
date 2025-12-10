import { useEffect } from 'react';
import { getElements, updateElementEditorSettings } from '@elementor/editor-elements';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { SLICE_NAME } from '../store/store';

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
				console.warn( `Failed to update element ${ element.model.get( 'id' ) } with component rename:`, error );
			}
		} );
	} catch ( error ) {
		console.warn( `Failed to sync component rename to navigator for component ${ componentUid }:`, error );
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
				syncComponentRenameToNavigator( uid, name );
			}
		} );

		previousComponentsData = currentComponentsData.map( ( { name, uid } ) => ( { uid, name } ) );
	} catch ( error ) {
		console.warn( 'Failed to sync component rename to navigator store:', error );
	}
}

let unsubscribe: ( () => void ) | null = null;

export function initSyncComponentRenameToNavigator() {
	try {
		unsubscribe = subscribeWithSelector(
			( state ) => state[ SLICE_NAME ]?.data,
			() => {
				syncComponentRenameToNavigatorStore();
			}
		);
	} catch ( error ) {
		console.warn( 'Store not ready yet, sync will be initialized later:', error );
	}
}

export function SyncComponentRenameToNavigator() {
	useEffect( () => {
		if ( ! unsubscribe ) {
			initSyncComponentRenameToNavigator();
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
