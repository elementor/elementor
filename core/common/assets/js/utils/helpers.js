import { softDeprecated, deprecatedMessage } from 'elementor/modules/dev-tools/assets/js/deprecation/utils';

export default class Helpers {
	softDeprecated( name, version, replacement ) {
		softDeprecated( name, version, replacement );

		// This is is self is deprecated.
		elementor.devTools.deprecation.deprecated(
			'elementorCommon.helpers.softDeprecated',
			'3.7.0',
			'elementor.devTools.deprecation.deprecated'
		);
	}

	hardDeprecated( name, version, replacement ) {
		deprecatedMessage( 'hard', name, version, replacement );

		// This is is self is deprecated.
		elementor.devTools.deprecation.deprecated(
			'elementorCommon.helpers.hardDeprecated',
			'3.7.0',
			'elementor.devTools.deprecation.deprecated'
		);
	}

	deprecatedMessage( type, name, version, replacement ) {
		deprecatedMessage( type, name, version, replacement );

		// This is is self is deprecated.
		elementor.devTools.deprecation.deprecated(
			'elementorCommon.helpers.deprecatedMessage',
			'3.7.0',
			'elementor.devTools.deprecation.deprecated'
		);
	}

	consoleWarn( ...args ) {
		elementor.devTools.consoleWarn( ...args );

		// This is is self is deprecated.
		elementor.devTools.deprecation.deprecated(
			'elementorCommon.helpers.consoleWarn',
			'3.7.0',
			'elementor.devTools.consoleWarn'
		);
	}

	consoleError( message ) {
		// eslint-disable-next-line no-console
		console.error( message );

		// This is is self is deprecated.
		elementor.devTools.deprecation.deprecated(
			'elementorCommon.helpers.consoleError',
			'3.7.0',
			'console.error'
		);
	}

	deprecatedMethod( methodName, version, replacement ) {
		deprecatedMessage( 'hard', methodName, version, replacement );

		// This itself is deprecated.
		elementor.devTools.deprecation.deprecated( 'elementorCommon.helpers.deprecatedMethod', '2.8.0', 'elementor.devTools.deprecation.deprecated' );
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
