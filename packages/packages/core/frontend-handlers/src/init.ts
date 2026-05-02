import { onElementDestroy, onElementRender } from './lifecycle-events';

const ATOMIC_SELECTOR = '[data-e-type]';

let domMutationObserverStarted = false;
const pendingMutationNodes = new Set< Node >();
let pendingMutationsRafId = 0;

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

	const bootDomHandlers = () => {
		scanDocumentForAtomicElements();
		startObservingDomForNewAtomicElements();
	};

	document.addEventListener( 'DOMContentLoaded', bootDomHandlers );

	if ( 'loading' !== document.readyState ) {
		bootDomHandlers();
	}
}

function triggerAtomicRender( atom: HTMLElement ) {
	const eType = atom.dataset.eType;
	const id = atom.dataset.id;

	if ( ! eType || ! id ) {
		return;
	}

	onElementRender( { element: atom, elementType: eType, elementId: id } );
}

function collectAtomicElementsInSubtree( root: Element ): HTMLElement[] {
	const found: HTMLElement[] = [];

	if ( root.matches( ATOMIC_SELECTOR ) ) {
		found.push( root as HTMLElement );
	}

	root.querySelectorAll( ATOMIC_SELECTOR ).forEach( ( el ) => {
		found.push( el as HTMLElement );
	} );

	return found;
}

function scanDocumentForAtomicElements() {
	document.querySelectorAll( ATOMIC_SELECTOR ).forEach( ( el ) => {
		const atom = el as HTMLElement;
		const { eType, id } = atom.dataset;

		if ( ! eType || ! id ) {
			return;
		}

		triggerAtomicRender( atom );
	} );
}

function startObservingDomForNewAtomicElements() {
	if ( domMutationObserverStarted || 'undefined' === typeof MutationObserver ) {
		return;
	}

	domMutationObserverStarted = true;

	const observer = new MutationObserver( ( mutations ) => {
		for ( const mutation of mutations ) {
			mutation.addedNodes.forEach( ( node ) => {
				pendingMutationNodes.add( node );
			} );
		}

		queueProcessPendingMutationNodes();
	} );

	observer.observe( document.documentElement, {
		childList: true,
		subtree: true,
	} );
}

function queueProcessPendingMutationNodes() {
	if ( pendingMutationsRafId || ! pendingMutationNodes.size ) {
		return;
	}

	pendingMutationsRafId = requestAnimationFrame( () => {
		pendingMutationsRafId = 0;

		const roots = Array.from( pendingMutationNodes );
		pendingMutationNodes.clear();

		const atoms = new Set< HTMLElement >();

		for ( const node of roots ) {
			if ( Node.ELEMENT_NODE !== node.nodeType ) {
				continue;
			}

			collectAtomicElementsInSubtree( node as Element ).forEach( ( atom ) => {
				atoms.add( atom );
			} );
		}

		atoms.forEach( ( atom ) => triggerAtomicRender( atom ) );
	} );
}
