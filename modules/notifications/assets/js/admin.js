( function() {
	if ( window.elementorNotificationCenter ) {
		return;
	}
	window.elementorNotificationCenter = {};
	Object.defineProperty( window.elementorNotificationCenter, 'BarButtonNotification', {
		get() {
			if ( typeof elementorDevTools !== 'undefined' ) {
				elementorDevTools.deprecation.deprecated( 'window.elementorNotificationCenter', '3.34.2' );
			}
			return function() {
				return null;
			};
		},
	} );
} )();
