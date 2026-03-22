import { register } from '@elementor/frontend-handlers';
import { Alpine, refreshTree } from '@elementor/alpinejs';
import { TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE, getTabId, getIndex } from './utils';
import { setActiveTabId } from './editor-tabs-selection';

register( {
	elementType: 'e-tabs',
	id: 'e-tabs-preview-handler',
	callback: ( { element, signal, listenToChildren } ) => {
		window?.parent.addEventListener( 'elementor/navigator/item/click', ( event ) => {
			const { id, type } = event.detail;

			if ( type !== TAB_ELEMENT_TYPE && type !== TAB_CONTENT_ELEMENT_TYPE ) {
				return;
			}

			const targetElement = Alpine.$data( element ).$refs[ id ];

			if ( ! targetElement ) {
				return;
			}

			const targetIndex = getIndex( targetElement, type );
			setActiveTabId( element.dataset.id, getTabId( element.dataset.id, targetIndex ) );
		}, { signal } );

		listenToChildren( [ TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE ] )
			.render( () => refreshTree( element ) );
	},
} );
