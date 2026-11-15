const ITEM_SELECTOR = '[data-element_type="e-menu-item"]';
const CURRENT_CLASS = 'e--current';

export function getLinkedItems( menu ) {
	const candidates = menu.querySelectorAll( ITEM_SELECTOR );
	const linked = [];

	for ( let index = 0; index < candidates.length; index++ ) {
		if ( candidates[ index ].matches( 'a[href]' ) ) {
			linked[ linked.length ] = candidates[ index ];
		}
	}

	return linked;
}

export function setCurrent( item, ariaCurrent ) {
	item.classList.toggle( CURRENT_CLASS, !! ariaCurrent );

	if ( ariaCurrent ) {
		item.setAttribute( 'aria-current', ariaCurrent );
	} else {
		item.removeAttribute( 'aria-current' );
	}
}
