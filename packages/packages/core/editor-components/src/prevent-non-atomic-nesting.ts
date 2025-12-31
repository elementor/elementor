import { isAtomicWidget } from '@elementor/editor-canvas';
import { getAllDescendants, getElementType, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __getStore as getStore } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { type ComponentsSlice, selectCurrentComponentId } from './store/store';
import { type ExtendedWindow } from './types';

type CreateArgs = {
	container?: V1Element;
	model?: {
		elType?: string;
		widgetType?: string;
	};
};

type MoveArgs = {
	containers?: V1Element[];
	container?: V1Element;
	target?: V1Element;
};

type PasteArgs = {
	containers?: V1Element[];
	container?: V1Element;
	storageType?: string;
};

export type ClipboardElement = {
	elType?: string;
	widgetType?: string;
	elements?: ClipboardElement[];
};

type StorageContent = {
	clipboard?: {
		elements?: ClipboardElement[];
	};
};

const NON_ATOMIC_ELEMENT_ALERT: NotificationData = {
	type: 'default',
	message: __( "This Widget isn't compatible with components. Use Atomic elements instead.", 'elementor' ),
	id: 'non-atomic-element-blocked',
};

export function initNonAtomicNestingPrevention() {
	blockCommand( {
		command: 'document/elements/create',
		condition: blockNonAtomicCreate,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockNonAtomicMove,
	} );

	blockCommand( {
		command: 'document/elements/paste',
		condition: blockNonAtomicPaste,
	} );
}

function isEditingComponent(): boolean {
	const state = getStore()?.getState() as ComponentsSlice | undefined;

	if ( ! state ) {
		return false;
	}

	return selectCurrentComponentId( state ) !== null;
}

export function isElementAtomic( elementType: string ): boolean {
	return getElementType( elementType ) !== null;
}

function blockNonAtomicCreate( args: CreateArgs ): boolean {
	if ( ! isEditingComponent() ) {
		return false;
	}

	const { model } = args;
	const elementType = model?.widgetType || model?.elType;

	if ( ! elementType ) {
		return false;
	}

	if ( isElementAtomic( elementType ) ) {
		return false;
	}

	notify( NON_ATOMIC_ELEMENT_ALERT );
	return true;
}

function blockNonAtomicMove( args: MoveArgs ): boolean {
	if ( ! isEditingComponent() ) {
		return false;
	}

	const { containers = [ args.container ] } = args;

	const hasNonAtomicElement = containers.some( ( container ) => {
		if ( ! container ) {
			return false;
		}

		const allElements = getAllDescendants( container );

		return allElements.some( ( element ) => ! isAtomicWidget( element ) );
	} );

	if ( hasNonAtomicElement ) {
		notify( NON_ATOMIC_ELEMENT_ALERT );
	}

	return hasNonAtomicElement;
}

function blockNonAtomicPaste( args: PasteArgs ): boolean {
	if ( ! isEditingComponent() ) {
		return false;
	}

	const { storageType } = args;

	if ( storageType !== 'localstorage' ) {
		return false;
	}

	const data = (
		window as unknown as ExtendedWindow & { elementorCommon?: { storage?: { get: () => StorageContent } } }
	 )?.elementorCommon?.storage?.get();

	if ( ! data?.clipboard?.elements ) {
		return false;
	}

	const hasNonAtomicElement = hasNonAtomicElementsInTree( data.clipboard.elements );

	if ( hasNonAtomicElement ) {
		notify( NON_ATOMIC_ELEMENT_ALERT );
	}

	return hasNonAtomicElement;
}

export function hasNonAtomicElementsInTree( elements: ClipboardElement[] ): boolean {
	for ( const element of elements ) {
		const elementType = element.widgetType || element.elType;

		if ( elementType && ! isElementAtomic( elementType ) ) {
			return true;
		}

		if ( element.elements?.length ) {
			if ( hasNonAtomicElementsInTree( element.elements ) ) {
				return true;
			}
		}
	}

	return false;
}

export function findNonAtomicElements( elements: ClipboardElement[] ): string[] {
	const nonAtomicElements: string[] = [];

	for ( const element of elements ) {
		const elementType = element.widgetType || element.elType;

		if ( elementType && ! isElementAtomic( elementType ) ) {
			nonAtomicElements.push( elementType );
		}

		if ( element.elements?.length ) {
			nonAtomicElements.push( ...findNonAtomicElements( element.elements ) );
		}
	}

	return [ ...new Set( nonAtomicElements ) ];
}

type V1ElementLike = {
	elType?: string;
	widgetType?: string;
	elements?: V1ElementLike[];
};

export function findNonAtomicElementsInElement( element: V1ElementLike ): string[] {
	const nonAtomicElements: string[] = [];
	const elementType = element.widgetType || element.elType;

	if ( elementType && ! isElementAtomic( elementType ) ) {
		nonAtomicElements.push( elementType );
	}

	if ( element.elements?.length ) {
		for ( const child of element.elements ) {
			nonAtomicElements.push( ...findNonAtomicElementsInElement( child ) );
		}
	}

	return [ ...new Set( nonAtomicElements ) ];
}
