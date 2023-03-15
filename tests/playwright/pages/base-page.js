module.exports = class BasePage {
	/**
	 * @param {import('@playwright/test').Page}     page
	 * @param {import('@playwright/test').TestInfo} testInfo
	 */
	constructor( page, testInfo ) {
		if ( ! page || ! testInfo ) {
			throw new Error( 'Page and TestInfo must be provided' );
		}

		/**
		 * @type {import('@playwright/test').Page}
		 */
		this.page = page;

		/**
		 * @type {import('@playwright/test').TestInfo}
		 */
		this.testInfo = testInfo;

		this.config = this.testInfo.config.projects[ 0 ].use;

		// If wordpress is not located on the domain's top-level (e.g:  http://local.host/test-wordpress ), playwright's `baseURL` cannot handle it.
		if ( this.config.baseURLPrefixProxy ) {
			this.page = new Proxy( this.page, {
				get: ( target, key ) => {
					switch ( key ) {
						case 'goto':
							return ( path ) => page.goto( this.config.baseURL + path );

						case 'waitForNavigation': {
							return ( args = {} ) => {
								args = ( args.url ) ? { url: this.config.baseURL + args.url } : args;

								return page.waitForNavigation( args );
							};
						}
					}

					return target[ key ];
				},
			} );
		}
	}
};
