import { listenTo, openRoute, routeOpenEvent } from '@elementor/v1-adapters';

export function sync() {
	redirectOldMenus();
}

function redirectOldMenus() {
	// Redirect the old hamburger menu to the default elements panel.
	listenTo( routeOpenEvent( 'panel/menu' ), () => {
		openRoute( 'panel/elements/categories' );
	} );
}
