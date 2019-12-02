export default class Helpers {
	softDeprecated( name, version, replacement ) {
		if ( elementorCommon.config.isDebug ) {
			this.deprecatedMessage( 'soft', name, version, replacement );
		}
	}

	hardDeprecated( name, version, replacement ) {
		this.deprecatedMessage( 'hard', name, version, replacement );
	}

	deprecatedMessage( type, name, version, replacement ) {
		let message = `%c   %c\`${ name }\` is ${ type } deprecated since ${ version }`;

		const style = `font-size: 12px; background-image: url("${ elementorCommon.config.urls.assets }images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;`;

		if ( replacement ) {
			message += ` - Use \`${ replacement }\` instead`;
		}

		console.warn( message, style, '' ); // eslint-disable-line no-console
	}

	deprecatedMethod( methodName, version, replacement ) {
		this.deprecatedMessage( 'hard', methodName, version, replacement );

		// This itself is deprecated.
		this.softDeprecated( 'elementorCommon.helpers.deprecatedMethod', '2.8.0', 'elementorCommon.helpers.softDeprecated || elementorCommon.helpers.hardDeprecated' );
	}

	cloneObject( object ) {
		return JSON.parse( JSON.stringify( object ) );
	}

	upperCaseWords( string ) {
		return ( string + '' ).replace( /^(.)|\s+(.)/g, function( $1 ) {
			return $1.toUpperCase();
		} );
	}
}
