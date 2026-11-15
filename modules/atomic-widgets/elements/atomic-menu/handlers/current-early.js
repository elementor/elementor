import { getLinkedItems, setCurrent } from './current-state';
import { isCurrentPageLink } from './url-matcher';

const menu = document.currentScript?.parentElement;

if ( menu ) {
	const items = getLinkedItems( menu );

	for ( let index = 0; index < items.length; index++ ) {
		if ( isCurrentPageLink( items[ index ].getAttribute( 'href' ) ) ) {
			setCurrent( items[ index ], 'page' );
		}
	}
}
