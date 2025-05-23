export default class Helpers {
	softDeprecated( name, version, replacement ) {
		elementorDevTools.deprecation.deprecated( name, version, replacement );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated(
			'elementorCommon.helpers.softDeprecated',
			'3.7.0',
			'elementorDevTools.deprecation.deprecated',
		);
	}

	hardDeprecated( name, version, replacement ) {
		elementorDevTools.deprecation.deprecated( name, version, replacement );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated(
			'elementorCommon.helpers.hardDeprecated',
			'3.7.0',
			'elementorDevTools.deprecation.deprecated',
		);
	}

	deprecatedMessage( type, name, version, replacement ) {
		elementorDevTools.deprecation.deprecated( name, version, replacement );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated(
			'elementorCommon.helpers.deprecatedMessage',
			'3.7.0',
			'elementorDevTools.deprecation.deprecated',
		);
	}

	consoleWarn( ...args ) {
		elementorDevTools.consoleWarn( ...args );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated(
			'elementorCommon.helpers.consoleWarn',
			'3.7.0',
			'elementorDevTools.consoleWarn',
		);
	}

	consoleError( message ) {
		// eslint-disable-next-line no-console
		console.error( message );

		// This is is self is deprecated.
		elementorDevTools.deprecation.deprecated(
			'elementorCommon.helpers.consoleError',
			'3.7.0',
			'console.error',
		);
	}

	deprecatedMethod( methodName, version, replacement ) {
		elementorDevTools.deprecation.deprecated( methodName, version, replacement );

		// This itself is deprecated.
		elementorDevTools.deprecation.deprecated( 'elementorCommon.helpers.deprecatedMethod', '2.8.0', 'elementorDevTools.deprecation.deprecated' );
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
