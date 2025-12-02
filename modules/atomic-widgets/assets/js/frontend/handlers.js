import { registerBySelector } from '@elementor/frontend-handlers';

registerBySelector( {
	id: 'atomic-link-action-handler',
	selector: '[data-action-link]',
	callback: ( { element } ) => {
		const cleanups = handleLinkActions( element );

		return () => cleanups.forEach( ( cleanup ) => cleanup?.() );
	},
} );

function handleLinkActions( element ) {
	const url = element.dataset.actionLink;
	const isEditorContext = !! window.elementor;

	if ( ! url ) {
		return;
	}

	const handler = ( event ) => {
		if ( isEditorContext ) {
			return;
		}

		event.preventDefault();

		if ( ! window.elementorFrontend?.utils?.urlActions ) {
			return;
		}

		elementorFrontend.utils.urlActions.runAction( url, event );
	};

	element.addEventListener( 'click', handler );

	return () => element.removeEventListener( 'click', handler );
}
