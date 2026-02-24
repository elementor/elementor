import { type V1Element, type V1ElementData } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { type ExtendedWindow } from '../../types';
import { isEditingComponent } from '../utils/is-editing-component';
import {
	revertAllOverridablesInContainer,
	revertAllOverridablesInElementData,
} from '../utils/revert-overridable-settings';

type CopyArgs = {
	storageKey?: string;
};

type ClipboardData = {
	type: string;
	siteurl: string;
	elements: V1ElementData[];
};

export function initRevertOverridablesOnCopyOrDuplicate() {
	registerDataHook( 'after', 'document/elements/duplicate', ( _args, result: V1Element | V1Element[] ) => {
		if ( ! isEditingComponent() ) {
			return;
		}

		revertOverridablesForDuplicatedElements( result );
	} );

	registerDataHook( 'after', 'document/elements/copy', ( args: CopyArgs ) => {
		if ( ! isEditingComponent() ) {
			return;
		}

		revertOverridablesInStorage( args.storageKey ?? 'clipboard' );
	} );
}

function revertOverridablesForDuplicatedElements( duplicatedElements: V1Element | V1Element[] ) {
	const containers = Array.isArray( duplicatedElements ) ? duplicatedElements : [ duplicatedElements ];

	containers.forEach( ( container ) => {
		revertAllOverridablesInContainer( container );
	} );
}

function revertOverridablesInStorage( storageKey: string ) {
	const storage = ( window as unknown as ExtendedWindow ).elementorCommon?.storage;

	if ( ! storage ) {
		return;
	}

	const storageData = storage.get< ClipboardData >( storageKey );

	if ( ! storageData?.elements?.length ) {
		return;
	}

	const elementsDataWithOverridablesReverted = storageData.elements.map( revertAllOverridablesInElementData );

	storage.set( storageKey, {
		...storageData,
		elements: elementsDataWithOverridablesReverted,
	} );
}
