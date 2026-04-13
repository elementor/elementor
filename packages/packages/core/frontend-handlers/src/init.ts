import { onElementDestroy, onElementRender } from './lifecycle-events';

const ATOMIC_SELECTOR = '[data-e-type]';

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

	// 'elementor/element/render' doesn't fire on the frontend
	document.addEventListener( 'DOMContentLoaded', () => {
		scanDocumentForAtomicElements();
	} );
}

function triggerAtomicRender( atom: HTMLElement ) {
	const eType = atom.dataset.eType;
	const id = atom.dataset.id;

	if ( ! eType || ! id ) {
		return;
	}

	onElementRender( { element: atom, elementType: eType, elementId: id } );
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
