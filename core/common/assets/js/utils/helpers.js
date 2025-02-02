export default class Helpers {
	/**
	 * @param {*} args
	 * @deprecated since 3.7.0, use `elementorDevTools.consoleWarn()` instead.
	 */
	consoleWarn( ...args ) {
		elementorDevTools.consoleWarn( ...args );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated( 'elementorCommon.helpers.consoleWarn()', '3.7.0', 'elementorDevTools.consoleWarn()' );
	}

	/**
	 * @param {string} message
	 * @deprecated since 3.7.0, use `console.error()` instead.
	 */
	consoleError( message ) {
		// eslint-disable-next-line no-console
		console.error( message );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated( 'elementorCommon.helpers.consoleError()', '3.7.0', 'console.error()' );
	}

	cloneObject( object ) {
		return JSON.parse( JSON.stringify( object ) );
	}

	upperCaseWords( string ) {
		return ( string + '' ).replace( /^(.)|\s+(.)/g, function( $1 ) {
			return $1.toUpperCase();
		} );
	}

	getUniqueId() {
		return Math.random().toString( 16 ).substr( 2, 7 );
	}
}
