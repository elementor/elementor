import { type V1Element, type V1ElementData } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { type ExtendedWindow } from '../types';
import {
	cleanOverridablePropsForContainers,
	cleanOverridablePropsFromElementData,
} from '../utils/clean-overridable-props';
import { isEditingComponent } from '../utils/is-editing-component';

type CopyArgs = {
	storageKey?: string;
};

type ClipboardData = {
	type: string;
	siteurl: string;
	elements: V1ElementData[];
};

export function initCleanOverridablesOnCopyDuplicate() {
	registerDataHook( 'after', 'document/elements/duplicate', ( _args, result: V1Element | V1Element[] ) => {
		if ( ! isEditingComponent() ) {
			return;
		}

		cleanOverridablePropsForContainers( result );
	} );

	registerDataHook( 'after', 'document/elements/copy', ( args: CopyArgs ) => {
		if ( ! isEditingComponent() ) {
			return;
		}

		cleanOverridablePropsFromStorage( args.storageKey ?? 'clipboard' );
	} );
}

function cleanOverridablePropsFromStorage( storageKey: string ) {
	const storage = ( window as unknown as ExtendedWindow ).elementorCommon?.storage;

	if ( ! storage ) {
		return;
	}

	const storageData = storage.get< ClipboardData >( storageKey );

	if ( ! storageData?.elements?.length ) {
		return;
	}

	const cleanedElements = storageData.elements.map( cleanOverridablePropsFromElementData );

	storage.set( storageKey, {
		...storageData,
		elements: cleanedElements,
	} );
}
