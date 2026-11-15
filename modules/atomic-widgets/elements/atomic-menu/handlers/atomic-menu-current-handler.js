import { register } from '@elementor/frontend-handlers';
import AnchorLinks from './anchor-links';
import { getLinkedItems, setCurrent } from './current-state';
import { getAnchorId, isCurrentPageLink } from './url-matcher';

const MENU_ELEMENT_TYPE = 'e-menu';

function findAnchorEntries( items ) {
	return items.flatMap( ( item ) => {
		const anchorId = getAnchorId( item.getAttribute( 'href' ) );
		const target = anchorId ? document.getElementById( anchorId ) : null;

		return target ? [ { item, target } ] : [];
	} );
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

		const anchorEntries = findAnchorEntries( items );

		if ( ! anchorEntries.length ) {
			render( new Set() );

			return;
		}

		const anchorLinks = new AnchorLinks( anchorEntries, render );

		anchorLinks.initialize();
		signal.addEventListener( 'abort', () => anchorLinks.destroy(), { once: true } );
	},
} );
