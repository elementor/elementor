import { __createSlice, __registerSlice, type PayloadAction } from '@elementor/store';

import { canAcceptChild, getDefaultElementSettings } from './element-display';
import { collectElementIds, generateElementId } from './generate-id';
import type { DocumentState, ElementNode } from './types';

const initialState: DocumentState = {
	elements: [],
	selectedIds: [],
	dirty: false,
};

function findElementPath( elements: ElementNode[], targetId: string, path: number[] = [] ): number[] | null {
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

function insertElement( elements: ElementNode[], parentId: string | null, element: ElementNode ): ElementNode[] {
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

function insertElementAtIndex(
	elements: ElementNode[],
	parentId: string | null,
	index: number,
	element: ElementNode
): ElementNode[] {
	if ( ! parentId ) {
		const nextElements = [ ...elements ];
		const boundedIndex = Math.max( 0, Math.min( index, nextElements.length ) );

		nextElements.splice( boundedIndex, 0, element );

		return nextElements;
	}

	const path = findElementPath( elements, parentId );

	if ( ! path ) {
		return elements;
	}

	return updateElementAtPath( elements, path, ( parent ) => {
		const children = [ ...( parent.elements ?? [] ) ];
		const boundedIndex = Math.max( 0, Math.min( index, children.length ) );

		children.splice( boundedIndex, 0, element );

		return {
			...parent,
			elements: children,
		};
	} );
}

function extractElement(
	elements: ElementNode[],
	targetId: string
): { elements: ElementNode[]; element: ElementNode | null } {
	const path = findElementPath( elements, targetId );

	if ( ! path ) {
		return { elements, element: null };
	}

	const element = getElementAtPath( elements, path );

	if ( ! element ) {
		return { elements, element: null };
	}

	return {
		elements: removeElementAtPath( elements, path ),
		element: { ...element, elements: element.elements ?? [] },
	};
}

function isDescendant( elements: ElementNode[], ancestorId: string, targetId: string ): boolean {
	const ancestor = getElementById( elements, ancestorId );

	if ( ! ancestor ) {
		return false;
	}

	return Boolean( findElementPath( ancestor.elements ?? [], targetId ) );
}

function getElementById( elements: ElementNode[], id: string ): ElementNode | null {
	const path = findElementPath( elements, id );

	if ( ! path ) {
		return null;
	}

	return getElementAtPath( elements, path );
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
				index?: number;
			} >
		) {
			const existingIds = collectElementIds( state.elements );
			const element: ElementNode = {
				id: generateElementId( existingIds ),
				elType: action.payload.elType,
				widgetType: action.payload.widgetType,
				settings:
					action.payload.settings ??
					getDefaultElementSettings( action.payload.elType, action.payload.widgetType ),
				elements: [],
			};

			const parentId = action.payload.parentId ?? null;

			if ( ! canAcceptChild( state.elements, parentId ) ) {
				return;
			}

			if ( typeof action.payload.index === 'number' ) {
				state.elements = insertElementAtIndex( state.elements, parentId, action.payload.index, element );
			} else {
				state.elements = insertElement( state.elements, parentId, element );
			}

			state.selectedIds = [ element.id ];
			state.dirty = true;
		},
		updateSetting( state, action: PayloadAction< { id: string; key: string; value: unknown } > ) {
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
		moveElement( state, action: PayloadAction< { id: string; parentId: string | null; index: number } > ) {
			const { id, parentId } = action.payload;
			let { index } = action.payload;

			if ( parentId === id || ( parentId && isDescendant( state.elements, id, parentId ) ) ) {
				return;
			}

			if ( ! canAcceptChild( state.elements, parentId ) ) {
				return;
			}

			const sourcePath = findElementPath( state.elements, id );

			if ( ! sourcePath ) {
				return;
			}

			const sourceParentId =
				sourcePath.length === 1
					? null
					: getElementAtPath( state.elements, sourcePath.slice( 0, -1 ) )?.id ?? null;
			const sourceIndex = sourcePath[ sourcePath.length - 1 ];

			if ( sourceParentId === parentId && sourceIndex < index ) {
				index -= 1;
			}

			const { elements, element } = extractElement( state.elements, id );

			if ( ! element ) {
				return;
			}

			state.elements = insertElementAtIndex( elements, parentId, index, element );
			state.selectedIds = [ id ];
			state.dirty = true;
		},
		markSaved( state ) {
			state.dirty = false;
		},
	},
} );

__registerSlice( documentSlice );

export const { hydrate, select, createElement, updateSetting, removeElement, moveElement, markSaved } =
	documentSlice.actions;

export { getElementById };

export type DocumentSliceState = {
	editorV5Document: DocumentState;
};
