import { onElementDestroy, onElementRender } from './lifecycle-events';

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
		document.querySelectorAll( '[data-e-type]' ).forEach( ( element ) => {
			const el = element as HTMLElement;
			const { eType, id } = el.dataset;

			if ( ! eType || ! id ) {
				return;
			}

			onElementRender( { element: el, elementType: eType, elementId: id } );
		} );
	} );
}
