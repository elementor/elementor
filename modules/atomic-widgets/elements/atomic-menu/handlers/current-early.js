import { getLinkedItems, setCurrent } from './current-state';
import { getAnchorId, isCurrentPageLink } from './url-matcher';

const menu = document.currentScript?.parentElement;

if ( menu ) {
	const items = getLinkedItems( menu );
	let hasAnchorItems = false;

	for ( let index = 0; index < items.length; index++ ) {
		hasAnchorItems = hasAnchorItems || null !== getAnchorId( items[ index ].getAttribute( 'href' ) );
	}

	for ( let index = 0; ! hasAnchorItems && index < items.length; index++ ) {
		if ( isCurrentPageLink( items[ index ].getAttribute( 'href' ) ) ) {
			setCurrent( items[ index ], 'page' );
		}
	}
}
