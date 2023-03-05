export const isInRoute = ( route ) => {
	if ( ! window.top || ! window.top.$e) {
		return false;
	}

	return window.top.$e.routes.is( route );
};

export const goToRoute = (route, args) => {
	if ( ! window.top || ! window.top.$e) {
		return;
	}

	// Must go through main panel to allow back button to work
	goToMainRoute();
	window.top.$e.route( route, args );
};

const goToMainRoute = () => {
	window.top.$e.route( MAIN_ROUTE );
};

export const MAIN_ROUTE = 'panel/global/menu';
