import { register } from '@elementor/frontend-handlers';
import AnchorLinks from './anchor-links';
import { getAnchorId, isCurrentPageLink } from './url-matcher';

const MENU_ELEMENT_TYPE = 'e-menu';
const ITEM_ELEMENT_TYPE = 'e-menu-item';
const MENU_SELECTOR = '[data-element_type="e-menu"]';
const ITEM_SELECTOR = '[data-element_type="e-menu-item"]';
const CURRENT_CLASS = 'e--current';
const PREVIEW_STATE_ATTRIBUTE = 'data-e-preview-state';

function getLinkedItems( menu ) {
	return [ ...menu.querySelectorAll( ITEM_SELECTOR ) ].filter(
		( item ) => item.matches( 'a[href]' ) && item.closest( MENU_SELECTOR ) === menu,
	);
}

function findAnchorEntries( items ) {
	return items.flatMap( ( item ) => {
		const anchorId = getAnchorId( item.getAttribute( 'href' ) );
		const target = anchorId ? document.getElementById( anchorId ) : null;

		return target ? [ { item, target } ] : [];
	} );
}

function setCurrent( item, ariaCurrent ) {
	const isPreviewed = item.hasAttribute( PREVIEW_STATE_ATTRIBUTE );

	item.classList.toggle( CURRENT_CLASS, !! ariaCurrent || isPreviewed );

	if ( ariaCurrent ) {
		item.setAttribute( 'aria-current', ariaCurrent );
	} else {
		item.removeAttribute( 'aria-current' );
	}
}

register( {
	elementType: MENU_ELEMENT_TYPE,
	id: 'e-menu-current-handler',
	callback: ( { element, signal, listenToChildren } ) => {
		let anchorLinks = null;

		const setup = () => {
			anchorLinks?.destroy();
			anchorLinks = null;

			const items = getLinkedItems( element );
			const pageItems = new Set( items.filter( ( item ) => isCurrentPageLink( item.getAttribute( 'href' ) ) ) );

			const render = ( activeAnchorItems ) => {
				items.forEach( ( item ) => {
					if ( activeAnchorItems.has( item ) ) {
						setCurrent( item, 'location' );
					} else if ( ! activeAnchorItems.size && pageItems.has( item ) ) {
						setCurrent( item, 'page' );
					} else {
						setCurrent( item, null );
					}
				} );
			};

			render( new Set() );

			const anchorEntries = findAnchorEntries( items );

			if ( ! anchorEntries.length ) {
				return;
			}

			anchorLinks = new AnchorLinks( anchorEntries, render );
			anchorLinks.initialize();
		};

		setup();

		signal.addEventListener( 'abort', () => anchorLinks?.destroy(), { once: true } );

		listenToChildren( [ ITEM_ELEMENT_TYPE ] ).render( ( event ) => {
			if ( event.detail.element.closest( MENU_SELECTOR ) === element ) {
				setup();
			}
		} );
	},
} );
