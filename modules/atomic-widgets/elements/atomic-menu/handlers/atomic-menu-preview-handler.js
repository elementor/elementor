import { register } from '@elementor/frontend-handlers';
import { Alpine, refreshTree } from '@elementor/alpinejs';
import { TOGGLE_CLOSED_ELEMENT_TYPE, TOGGLE_OPEN_ELEMENT_TYPE } from './utils';

register( {
	elementType: 'e-menu',
	id: 'e-menu-preview-handler',
	callback: ( { element, signal } ) => {
		refreshTree( element );

		window?.parent.addEventListener( 'elementor/navigator/item/click', ( event ) => {
			const { id, type } = event.detail;

			if ( type !== TOGGLE_CLOSED_ELEMENT_TYPE && type !== TOGGLE_OPEN_ELEMENT_TYPE ) {
				return;
			}

			const target = element.querySelector( `[data-id="${ id }"]` );

			if ( ! target ) {
				return;
			}

			const data = Alpine.$data( element );

			if ( ! data ) {
				return;
			}

			data.open = type === TOGGLE_OPEN_ELEMENT_TYPE;
		}, { signal } );
	},
} );
