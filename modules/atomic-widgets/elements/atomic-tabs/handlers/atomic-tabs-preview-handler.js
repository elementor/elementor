import { register } from '@elementor/frontend-handlers';
import { Alpine, refreshTree } from '@elementor/alpinejs';
import { TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE, getIndex, getDirectTabCount } from './utils';
import { setActiveTabIndex, validateActiveTab } from './editor-tabs-selection';

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
			setActiveTabIndex( element.dataset.id, targetIndex );
		}, { signal } );

		listenToChildren( [ TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE ] )
			.render( ( { childType, eventType } ) => {
				// If a tab is being destroyed, validate the active tab count in order to prevent the active tab from being set to an invalid index.
				if ( TAB_ELEMENT_TYPE === childType && 'destroyed' === eventType ) {
					const tabCount = getDirectTabCount( element ) - 1;
					validateActiveTab( element.dataset.id, tabCount );
				}

				refreshTree( element );
			} );
	},
} );
