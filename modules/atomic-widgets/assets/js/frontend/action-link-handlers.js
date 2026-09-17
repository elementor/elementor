import { registerBySelector } from '@elementor/frontend-handlers';
import { isEditorContext, LINK_ACTIONS_EDITOR_WHITELIST, WHITELIST_FILTER, ACTION_LINK_SELECTOR, REGISTRATION_SELECTOR } from './utils';

registerBySelector( {
	id: 'atomic-link-action-handler',
	selector: REGISTRATION_SELECTOR,
	callback: ( { element } ) => handleLinkActions( element ),
} );

function shouldFireLinkActionHandler( url ) {
	if ( ! isEditorContext() ) {
		return true;
	}

	url = decodeURI( url );
	url = decodeURIComponent( url );

	const actionMatch = url.match( /action=([^&]+)/ );
	const action = actionMatch?.[ 1 ] ?? null;

	if ( ! action ) {
		return false;
	}

	const whitelist = elementorFrontend?.hooks?.applyFilters( WHITELIST_FILTER, LINK_ACTIONS_EDITOR_WHITELIST ) ??
		LINK_ACTIONS_EDITOR_WHITELIST;

	return !! whitelist.find( ( allowedAction ) => action.includes( allowedAction ) );
}

function handleLinkActions( element ) {
	const actionLinkElement = element.matches( ACTION_LINK_SELECTOR )
		? element
		: element.querySelector( ACTION_LINK_SELECTOR );
	const url = actionLinkElement?.dataset.actionLink;

	if ( ! url ) {
		return;
	}

	const handler = ( event ) => {
		if ( actionLinkElement && actionLinkElement !== element && ! actionLinkElement.contains( event.target ) ) {
			return;
		}

		if ( ! shouldFireLinkActionHandler( url ) ) {
			return;
		}

		if ( ! window.elementorFrontend?.utils?.urlActions ) {
			return;
		}

		event.preventDefault();
		elementorFrontend.utils.urlActions.runAction( url, event );
	};

	element.addEventListener( 'click', handler );

	return () => element.removeEventListener( 'click', handler );
}
