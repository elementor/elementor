import { onElementDestroy, onElementRender } from './lifecycle-events';

const ATOMIC_SELECTOR = '[data-e-type]';

const { appendChild, insertBefore, removeChild } = Node.prototype;
const appendedElements = new Map< string, Element >();

export function init() {
	window.addEventListener( 'elementor/element/render', ( _event ) => {
		const event = _event as CustomEvent< { id: string; type: string; element: Element } >;
		const { id, type, element } = event.detail;

		onElementRender( { element, elementType: type, elementId: id } );
	} );

	window.addEventListener( 'elementor/element/destroy', ( _event ) => {
		const event = _event as CustomEvent< { id: string; type: string; element: Element } >;
		const { id, type, element } = event.detail;

		onElementDestroy( { elementType: type, elementId: id, element } );
	} );

	window.addEventListener( 'elementor/frontend/init', () => {
		if ( isEditorContext() ) {
			return;
		}

		getAtomicChildren().forEach( triggerOnRender );
		modifyElementPrototype();
	} );
}

function getAtomicChildren( parent: HTMLElement | Document = document ): HTMLElement[] {
	const roots = filterAtomicElements( parent.querySelectorAll( ATOMIC_SELECTOR ) );

	return parent instanceof HTMLElement && parent.matches( ATOMIC_SELECTOR ) ? [ parent, ...roots ] : roots;
}

function filterAtomicElements( elements: NodeListOf< Element > ): HTMLElement[] {
	return [ ...elements ].filter( ( element ) => {
		const { eType, id } = ( element as HTMLElement ).dataset;

		return eType && id;
	} ) as HTMLElement[];
}

// Elements rendered after document is loaded need this to have events registered to them as well
function modifyElementPrototype() {
	Node.prototype.appendChild = function < T extends Node >( child: T ): T {
		const insertedRoots = getInsertedRootsBeforeMutation( child );
		const result = appendChild.apply( this, [ child ] );

		runRenderForInsertedRoots( insertedRoots );

		return result as T;
	};

	Node.prototype.insertBefore = function < T extends Node >( newNode: T, referenceNode: Node | null ): T {
		const insertedRoots = getInsertedRootsBeforeMutation( newNode );
		const result = insertBefore.apply( this, [ newNode, referenceNode ] );

		runRenderForInsertedRoots( insertedRoots );

		return result as T;
	};

	Node.prototype.removeChild = function < T extends Node >( child: T ): T {
		if ( child instanceof HTMLElement ) {
			getAtomicChildren( child ).forEach( triggerOnDestroy );
		}

		return removeChild.apply( this, [ child ] ) as T;
	};
}

function getInsertedRootsBeforeMutation( node: Node ): HTMLElement[] {
	if ( node instanceof DocumentFragment ) {
		return Array.from( node.children ).filter( ( child ): child is HTMLElement => child instanceof HTMLElement );
	}

	if ( node instanceof HTMLElement ) {
		return [ node ];
	}

	return [];
}

function runRenderForInsertedRoots( roots: HTMLElement[] ) {
	roots.forEach( ( root ) => {
		getAtomicChildren( root ).forEach( triggerOnRender );
	} );
}

function triggerOnRender( atom: HTMLElement ) {
	const { eType, id } = atom.dataset;

	if ( ! eType || ! id ) {
		return;
	}

	if ( appendedElements.has( id ) ) {
		triggerOnDestroy( atom );
	}

	appendedElements.set( id, atom );
	onElementRender( { element: atom, elementType: eType, elementId: id } );
}

function triggerOnDestroy( atom: HTMLElement ) {
	const { id, eType } = atom.dataset;

	if ( ! id || ! eType ) {
		return;
	}

	appendedElements.delete( id );
	onElementDestroy( { elementType: eType, elementId: id, element: atom } );
}

function isEditorContext() {
	return !! window.elementor || !! window.parent?.elementor;
}
