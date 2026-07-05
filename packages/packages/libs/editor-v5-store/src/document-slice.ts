import { __createSlice, __registerSlice, type PayloadAction } from '@elementor/store';

import { collectElementIds, generateElementId } from './generate-id';
import type { DocumentState, ElementNode } from './types';

const initialState: DocumentState = {
	elements: [],
	selectedIds: [],
	dirty: false,
};

function findElementPath(
	elements: ElementNode[],
	targetId: string,
	path: number[] = []
): number[] | null {
	for ( let index = 0; index < elements.length; index++ ) {
		const element = elements[ index ];

		if ( element.id === targetId ) {
			return [ ...path, index ];
		}

		const childPath = findElementPath( element.elements ?? [], targetId, [ ...path, index ] );

		if ( childPath ) {
			return childPath;
		}
	}

	return null;
}

function getElementAtPath( elements: ElementNode[], path: number[] ): ElementNode | null {
	let currentElements = elements;
	let current: ElementNode | null = null;

	for ( const index of path ) {
		current = currentElements[ index ] ?? null;

		if ( ! current ) {
			return null;
		}

		currentElements = current.elements ?? [];
	}

	return current;
}

function updateElementAtPath(
	elements: ElementNode[],
	path: number[],
	updater: ( element: ElementNode ) => ElementNode
): ElementNode[] {
	if ( ! path.length ) {
		return elements;
	}

	const [ index, ...rest ] = path;

	return elements.map( ( element, elementIndex ) => {
		if ( elementIndex !== index ) {
			return element;
		}

		if ( ! rest.length ) {
			return updater( element );
		}

		return {
			...element,
			elements: updateElementAtPath( element.elements ?? [], rest, updater ),
		};
	} );
}

function removeElementAtPath( elements: ElementNode[], path: number[] ): ElementNode[] {
	if ( ! path.length ) {
		return elements;
	}

	const [ index, ...rest ] = path;

	if ( ! rest.length ) {
		return elements.filter( ( _, elementIndex ) => elementIndex !== index );
	}

	return elements.map( ( element, elementIndex ) => {
		if ( elementIndex !== index ) {
			return element;
		}

		return {
			...element,
			elements: removeElementAtPath( element.elements ?? [], rest ),
		};
	} );
}

function insertElement(
	elements: ElementNode[],
	parentId: string | null,
	element: ElementNode
): ElementNode[] {
	if ( ! parentId ) {
		return [ ...elements, element ];
	}

	const path = findElementPath( elements, parentId );

	if ( ! path ) {
		return elements;
	}

	return updateElementAtPath( elements, path, ( parent ) => ( {
		...parent,
		elements: [ ...( parent.elements ?? [] ), element ],
	} ) );
}

export const documentSlice = __createSlice( {
	name: 'editorV5Document',
	initialState,
	reducers: {
		hydrate( state, action: PayloadAction< { elements: ElementNode[] } > ) {
			state.elements = action.payload.elements;
			state.selectedIds = [];
			state.dirty = false;
		},
		select( state, action: PayloadAction< { ids: string[] } > ) {
			state.selectedIds = action.payload.ids;
		},
		createElement(
			state,
			action: PayloadAction< {
				parentId?: string | null;
				elType: string;
				widgetType?: string;
				settings?: Record< string, unknown >;
			} >
		) {
			const existingIds = collectElementIds( state.elements );
			const element: ElementNode = {
				id: generateElementId( existingIds ),
				elType: action.payload.elType,
				widgetType: action.payload.widgetType,
				settings: action.payload.settings ?? {},
				elements: [],
			};

			state.elements = insertElement( state.elements, action.payload.parentId ?? null, element );
			state.selectedIds = [ element.id ];
			state.dirty = true;
		},
		updateSetting(
			state,
			action: PayloadAction< { id: string; key: string; value: unknown } >
		) {
			const path = findElementPath( state.elements, action.payload.id );

			if ( ! path ) {
				return;
			}

			state.elements = updateElementAtPath( state.elements, path, ( element ) => ( {
				...element,
				settings: {
					...element.settings,
					[ action.payload.key ]: action.payload.value,
				},
			} ) );
			state.dirty = true;
		},
		removeElement( state, action: PayloadAction< { id: string } > ) {
			const path = findElementPath( state.elements, action.payload.id );

			if ( ! path ) {
				return;
			}

			state.elements = removeElementAtPath( state.elements, path );
			state.selectedIds = state.selectedIds.filter( ( id ) => id !== action.payload.id );
			state.dirty = true;
		},
		markSaved( state ) {
			state.dirty = false;
		},
	},
} );

__registerSlice( documentSlice );

export const {
	hydrate,
	select,
	createElement,
	updateSetting,
	removeElement,
	markSaved,
} = documentSlice.actions;

export function getElementById( elements: ElementNode[], id: string ): ElementNode | null {
	const path = findElementPath( elements, id );

	if ( ! path ) {
		return null;
	}

	return getElementAtPath( elements, path );
}

export type DocumentSliceState = {
	editorV5Document: DocumentState;
};
