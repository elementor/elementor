import WpDashboardTracking from '../../../../../app/assets/js/event-track/wp-dashboard-tracking';

export const trackPromoClick = ( promoName, destination, path ) => {
	if ( WpDashboardTracking && 'function' === typeof WpDashboardTracking.trackPromoClicked ) {
		WpDashboardTracking.trackPromoClicked( promoName, destination, path );
	}
};

export const getHomeScreenPath = ( section ) => {
	return [ 'home', section ];
};

