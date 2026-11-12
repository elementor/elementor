import { register } from '@elementor/frontend-handlers';
import AnchorLinks from './anchor-links';
import { getAnchorId, isCurrentPageLink } from './url-matcher';

const MENU_ELEMENT_TYPE = 'e-menu';
const ITEM_SELECTOR = '[data-element_type="e-menu-item"]';
const CURRENT_CLASS = 'e--current';

function getLinkedItems( menu ) {
	return [ ...menu.querySelectorAll( ITEM_SELECTOR ) ].filter( ( item ) => item.matches( 'a[href]' ) );
}

function findAnchorEntries( items ) {
	return items.flatMap( ( item ) => {
		const anchorId = getAnchorId( item.getAttribute( 'href' ) );
		const target = anchorId ? document.getElementById( anchorId ) : null;

		return target ? [ { item, target } ] : [];
	} );
}

function setCurrent( item, ariaCurrent ) {
	item.classList.toggle( CURRENT_CLASS, !! ariaCurrent );

	if ( ariaCurrent ) {
		item.setAttribute( 'aria-current', ariaCurrent );
	} else {
		item.removeAttribute( 'aria-current' );
	}
}

register( {
	elementType: MENU_ELEMENT_TYPE,
	id: 'e-menu-current-handler',
	callback: ( { element, signal } ) => {
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

		const anchorLinks = new AnchorLinks( anchorEntries, render );

		anchorLinks.initialize();
		signal.addEventListener( 'abort', () => anchorLinks.destroy(), { once: true } );
	},
} );
