import { register } from '@elementor/frontend-handlers';
import { Alpine, refreshTree } from '@elementor/alpinejs';
import { ITEM_ELEMENT_TYPE, PANEL_ELEMENT_TYPE, getItemId, getIndex } from './utils';

register( {
	elementType: 'e-mega-menu',
	id: 'e-mega-menu-preview-handler',
	callback: ( { element, signal, listenToChildren } ) => {
		window?.parent.addEventListener( 'elementor/navigator/item/click', ( event ) => {
			const { id, type } = event.detail;

			if ( type !== ITEM_ELEMENT_TYPE && type !== PANEL_ELEMENT_TYPE ) {
				return;
			}

			const targetElement = Alpine.$data( element ).$refs[ id ];

			if ( ! targetElement ) {
				return;
			}

			const targetIndex = getIndex( targetElement, type );
			Alpine.$data( element ).activeItem = getItemId( element.dataset.id, targetIndex );
		}, { signal } );

		listenToChildren( [ ITEM_ELEMENT_TYPE, PANEL_ELEMENT_TYPE ] )
			.render( () => refreshTree( element ) );
	},
} );
