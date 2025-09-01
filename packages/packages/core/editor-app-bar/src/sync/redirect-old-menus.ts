import {
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
	routeOpenEvent,
} from '@elementor/editor-v1-adapters';

export default function redirectOldMenus() {
	// Currently, in V1, when you click `esc` it opens the hamburger menu in the panel.
	// In V2, we don't have this panel, so we redirect the user to the elements panel instead.
	listenTo( routeOpenEvent( 'panel/menu' ), () => {
		openRoute( 'panel/elements/categories' );
	} );
}
