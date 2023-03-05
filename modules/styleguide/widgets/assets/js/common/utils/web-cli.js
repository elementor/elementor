
export const isInRoute = ( route ) => {
	if ( ! window.top || ! window.top.$e) {
		return false;
	}

	return window.top.$e.routes.isPartOf( route );
};

export const goToRoute = (route, args) => {
	if ( ! window.top || ! window.top.$e) {
		return;
	}

	window.top.$e.route( route, args );
};

export const goToMainRoute = () => {
	goToRoute( MAIN_ROUTE );
};

export const MAIN_ROUTE = 'panel/global/menu';