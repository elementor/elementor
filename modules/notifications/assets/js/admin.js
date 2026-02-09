if ( window.elementorNotificationCenter ) {
	return;
}

window.elementorNotificationCenter = {};

Object.defineProperty( window.elementorNotificationCenter, 'BarButtonNotification', {
	get() {
		elementorDevTools?.deprecation.deprecated( 'window.elementorNotificationCenter', '3.34.2' );

		return function() {
			return null;
		};
	},
} );
