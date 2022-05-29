// TODO: Copied from `core/common/assets/js/utils/helpers.js` and modified into static functions.
export default class Helpers {
	static softDeprecated( name, version, replacement ) {
		if ( elementorWebCliConfig.isDebug ) {
			this.deprecatedMessage( 'soft', name, version, replacement );
		}
	}

	static hardDeprecated( name, version, replacement ) {
		this.deprecatedMessage( 'hard', name, version, replacement );
	}

	static deprecatedMessage( type, name, version, replacement ) {
		let message = `\`${ name }\` is ${ type } deprecated since ${ version }`;

		if ( replacement ) {
			message += ` - Use \`${ replacement }\` instead`;
		}

		this.consoleWarn( message );
	}

	static consoleWarn( ...args ) {
		const style = `font-size: 12px; background-image: url("${ elementorWebCliConfig.urls.assets }images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;`;

		args.unshift( '%c  %c', style, '' );

		console.warn( ...args ); // eslint-disable-line no-console
	}

	static consoleError( message ) {
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

	static deprecatedMethod( methodName, version, replacement ) {
		this.deprecatedMessage( 'hard', methodName, version, replacement );

		// This itself is deprecated.
		this.softDeprecated( 'Helpers.deprecatedMethod', '2.8.0', 'Helpers.softDeprecated || Helpers.hardDeprecated' );
	}

	static cloneObject( object ) {
		return JSON.parse( JSON.stringify( object ) );
	}

	static upperCaseWords( string ) {
		return ( string + '' ).replace( /^(.)|\s+(.)/g, function( $1 ) {
			return $1.toUpperCase();
		} );
	}

	static getUniqueId() {
		return Math.random().toString( 16 ).substr( 2, 7 );
	}
}
