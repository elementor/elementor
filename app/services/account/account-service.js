export default class AccountService {
	/**
	 * Authorisation service.
	 *
	 * @param {string} buttonRef
	 * @param {string} parseUrl
	 * @param {Array} sizes
	 * @since 3.9.0
	 *
	 * @return {Promise}
	 */
	auth( buttonRef, parseUrl, sizes ) {
		return new Promise( ( resolve ) => {
			const success = ( e, data ) => {
				resolve( { data, error: null } );
			};

			const error = () => {
				resolve( { data: null, error: __( 'Unable to connect', 'elementor' ) } );
			};

			jQuery( buttonRef ).elementorConnect( {
				success,
				error,
				parseUrl,
				popup: sizes,
			} );
		} );
	}
}
