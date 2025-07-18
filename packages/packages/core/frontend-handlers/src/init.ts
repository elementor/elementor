import { onElementDestroy, onElementRender } from './lifecycle-events';

const sleep = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

export function init() {
	window.addEventListener( 'elementor/element/render', async ( _event ) => {
		const event = _event as CustomEvent< { id: string; type: string; element: Element } >;
		const { id, type } = event.detail;
		let { element } = event.detail;

		// Editor does not capture the element immediately, so we need to wait for it to actually be placed
		let retries = 5;
		while ( ! element && retries > 0 ) {
			await sleep( 150 );
			element = document.getElementById( id ) as Element;
			retries--;
		}

		// Ensure the "destroy" event was not triggered before the render event.
		onElementDestroy( { elementType: type, elementId: id } );

		onElementRender( { element, elementType: type, elementId: id } );
	} );

	window.addEventListener( 'elementor/element/destroy', ( _event ) => {
		const event = _event as CustomEvent< { id: string; type: string } >;
		const { id, type } = event.detail;

		onElementDestroy( { elementType: type, elementId: id } );
	});
	
	const handleDOMContentLoaded = () => {
		document.querySelectorAll( '[data-e-type]' ).forEach( ( element ) => {
			const el = element as HTMLElement;

			const { eType, id = el.id } = el.dataset;

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
	}

	document.addEventListener('DOMContentLoaded', () => handleDOMContentLoaded());
	if (document.readyState === 'complete') {
		handleDOMContentLoaded();
	}
}
