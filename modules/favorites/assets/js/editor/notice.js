export function registerHooks() {
	elementor.hooks.addFilter( 'panel/elements/regionViews', onFilter );
	$e.routes.on( 'run:after', onRoute );
}

export function unregisterHooks() {
	elementor.hooks.removeFilter( 'panel/elements/regionViews', onFilter );
	$e.routes.off( 'run:after', onRoute );
}

function onRoute() {

}

function onFilter() {

}
