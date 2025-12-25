import { useEffect } from 'react';
import { getElements, updateElementEditorSettings, updateElementSettings } from '@elementor/editor-elements';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { type ComponentsSlice, SLICE_NAME } from '../store/store';

let previousComponentsData: Array< { uid: string; name: string } > = [];
let unsubscribe: ( () => void ) | null = null;

function findElementsByComponentUid( componentUid: string ) {
	const allElements = getElements();
	return allElements.filter( ( element ) => {
		const editorSettings = element.model.get( 'editor_settings' );
		return editorSettings?.component_uid === componentUid;
	} );
}

function syncComponentRenameToNavigator( componentUid: string, newName: string ) {
	const elements = findElementsByComponentUid( componentUid );
	elements.forEach(async (element) => {
		await Promise.resolve();
		if (element.model.get('editor_settings')?.component_src_name !== newName) {
			updateElementEditorSettings( {
				elementId: element.model.get( 'id' ),
				settings: { component_src_name: newName },
			});
			updateElementSettings({
				id: element.model.get('id'),
				props: { title: newName, _title: newName },
			});
		}
	} );
}

export function syncComponentRenameToNavigatorStore() {
	const state = getState();
	const currentComponentsData = ( state[ SLICE_NAME ]?.data as Array< { uid: string; name: string } > ) ?? [];

	if ( previousComponentsData.length === 0 ) {
		previousComponentsData = currentComponentsData.map( ( { name, uid } ) => ( { uid, name } ) );
	}

	currentComponentsData.forEach( ( { name, uid } ) => {
		const previousComponent = previousComponentsData.find( ( prev ) => prev.uid === uid );

		if ( previousComponent && previousComponent.name !== name ) {
			syncComponentRenameToNavigator(uid, name);
		}
	} );

	previousComponentsData = currentComponentsData.map( ( { name, uid } ) => ( { uid, name } ) );
}

export function initSyncComponentRenameToNavigator() {
	unsubscribe = subscribeWithSelector(
		( state: ComponentsSlice ) => state[ SLICE_NAME ]?.data.map( ( { name, uid } ) => ( { uid, name } ) ),
		() => {
				syncComponentRenameToNavigatorStore();
		}
	);
}

export function SyncComponentRenameToNavigator() {
	useEffect(() => {
		
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