export default class ConfigService {
	/**
	 * ConfigService
	 *
	 * @param {string} app
	 * @return {Promise}
	 */

	get( app = '' ) {
		return new Promise( ( resolve, reject ) => {
			if ( elementorAppConfig.hasOwnProperty( app ) ) {
				resolve( elementorAppConfig[ app ] );
			}

			if ( elementorAppConfig ) {
				resolve( elementorAppConfig );
			}

			reject( 'Unable to retrieve elementorAppConfig object' );
		} );
	}
}
