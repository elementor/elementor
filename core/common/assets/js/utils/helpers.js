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
		let message = `\`${ name }\` is ${ type } deprecated since ${ version }`;

		if ( replacement ) {
			message += ` - Use \`${ replacement }\` instead`;
		}

		this.consoleWarn( message );
	}

	consoleWarn( ...args ) {
		const style = `font-size: 12px; background-image: url("${ elementorCommon.config.urls.assets }images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;`;

		args.unshift( '%c  %c', style, '' );

		console.warn( ...args ); // eslint-disable-line no-console
	}

	consoleError( message ) {
		// TODO: function is part of $e.
		// Show an error if devTools is available.
		if ( $e.devTools ) {
			$e.devTools.log.error( message );
		}

		// If not a 'Hook-Break' then show error.
		if ( ! ( message instanceof $e.modules.HookBreak ) ) {
			// eslint-disable-next-line no-console
			console.error( message );
		}
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

	getUniqueId() {
		return Math.random().toString( 16 ).substr( 2, 7 );
	}
}
