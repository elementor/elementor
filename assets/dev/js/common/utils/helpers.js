export default class Helpers {
	deprecatedMethod( methodName, version, replacement ) {
		let message = '%c   %c`' + methodName + '` is deprecated since ' + version;

		const style = 'font-size: 12px; background-image: url("' + elementor.config.assets_url + 'images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;';

		if ( replacement ) {
			message += ' - Use `' + replacement + '()` instead';
		}

		console.warn( message, style, '' ); // eslint-disable-line no-console
	}

	cloneObject( object ) {
		return JSON.parse( JSON.stringify( object ) );
	}

	firstLetterUppercase( string ) {
		return string[0].toUpperCase() + string.slice( 1 );
	}
}
