export default class Helpers {
	softDeprecated( name, version, replacement ) {
		elementorDevToolsModule.deprecation.softDeprecated( name, version, replacement );

		elementorDevToolsModule.deprecation.softDeprecated(
			'elementorCommon.helpers.softDeprecated',
			'3.7.0',
			'elementorDevToolsModule.deprecation.softDeprecated'
		);
	}

	hardDeprecated( name, version, replacement ) {
		elementorDevToolsModule.deprecation.hardDeprecated( 'hard', name, version, replacement );

		elementorDevToolsModule.deprecation.softDeprecated(
			'elementorCommon.helpers.hardDeprecated',
			'3.7.0',
			'elementorDevToolsModule.deprecation.hardDeprecated'
		);
	}

	deprecatedMessage( type, name, version, replacement ) {
		elementorDevToolsModule.deprecation.deprecatedMessage( type, name, version, replacement );

		elementorDevToolsModule.deprecation.softDeprecated(
			'elementorCommon.helpers.deprecatedMessage',
			'3.7.0',
			'elementorDevTools.deprecation.deprecatedMessage'
		);
	}

	consoleWarn( ...args ) {
		elementorDevToolsModule.consoleWarn( ...args );

		elementorDevToolsModule.deprecation.softDeprecated(
			'elementorCommon.helpers.consoleWarn',
			'3.7.0',
			'elementorDevToolsModule.deprecation.consoleWarn'
		);
	}

	consoleError( message ) {
		// eslint-disable-next-line no-console
		console.error( message );

		elementorDevToolsModule.deprecation.softDeprecated(
			'elementorCommon.helpers.consoleError',
			'3.7.0',
			'console.error'
		);
	}

	deprecatedMethod( methodName, version, replacement ) {
		elementorDevToolsModule.deprecation.deprecatedMessage( 'hard', methodName, version, replacement );

		// This itself is deprecated.
		this.softDeprecated( 'elementorCommon.helpers.deprecatedMethod', '2.8.0', 'elementorDevToolsModule.deprecation.softDeprecated || elementorDevToolsModule.deprecation.hardDeprecated' );
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
