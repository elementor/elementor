export function registerHooks() {
	elementor.hooks.addFilter( 'panel/elements/regionViews', onFilter );
	$e.routes.on( 'run:after', onRoute );
}

export function unregisterHooks() {
	elementor.hooks.removeFilter( 'panel/elements/regionViews', onFilter );
	$e.routes.off( 'run:after', onRoute );
}

function onRoute( component, route ) {
	if ( 'panel/elements/categories' === route ) {
		elementor.getPanelView().getCurrentPageView().showView( 'favoritesNotice' );
	}
}

function onFilter( regionViews, { notice } ) {
	regionViews.favoritesNotice = {
		region: notice,
		view: require( './views/notice' ),
	};

	return regionViews;
}
