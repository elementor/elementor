import { register } from '@elementor/frontend-handlers';
import { Alpine, refreshTree } from '@elementor/alpinejs';
import { TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE, getIndex } from './utils';
import { setActiveTabIndex } from './editor-tabs-state';

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

		// Re-initialize Alpine to sync with editor DOM manipulations that bypass Alpine's reactivity.
		listenToChildren( [ TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE ] )
			.render( ( event ) => {
				const childElement = event.detail.element;
				const nearestTabs = childElement.closest( '[data-e-type="e-tabs"]' );

				if ( nearestTabs !== element ) {
					// eslint-disable-next-line no-console
					console.debug( `[ED-23464] refreshTree SKIPPED for ${ element.dataset.id } — child ${ childElement.dataset?.id } belongs to nested tabs ${ nearestTabs?.dataset?.id }` );
					return;
				}

				// eslint-disable-next-line no-console
				console.debug( `[ED-23464] refreshTree CALLED for ${ element.dataset.id } — direct child ${ childElement.dataset?.id }` );
				refreshTree( element );
			} );
	},
} );
