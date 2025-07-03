import { onElementDestroy, onElementRender } from './lifecycle-events';

export function init() {
	window.addEventListener( 'elementor/element/render', ( _event ) => {
		const event = _event as CustomEvent< { id: string; type: string; element: Element } >;
		const { id, type, element } = event.detail;

		// Ensure the "destroy" event was not triggered before the render event.
		onElementDestroy( { elementType: type, elementId: id } );

		onElementRender( { element, elementType: type, elementId: id } );
	} );

	window.addEventListener( 'elementor/element/destroy', ( _event ) => {
		const event = _event as CustomEvent< { id: string; type: string } >;
		const { id, type } = event.detail;

		onElementDestroy( { elementType: type, elementId: id } );
	} );

	document.addEventListener( 'DOMContentLoaded', () => {
		document.querySelectorAll( '[data-e-type]' ).forEach( ( element ) => {
			const el = element as HTMLElement;

			const { eType, id } = el.dataset;

			if ( ! eType || ! id ) {
				return;
			}

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: {
						id,
						type: eType,
						element,
					},
				} )
			);
		} );
	} );
}
