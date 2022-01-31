exports.BasePage = class BasePage {
	/**
	 * @param {import('@playwright/test').Page} page
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

		// If you are wordpress located for e.g: at local/test-wordpress/ playwright baseURL cannot handle it.
		// The next code handles it, use it only in local environment.
		if ( this.config.baseURLPrefixProxy ) {
			this.page = new Proxy( this.page, {
				get: ( target, key ) => {
					if ( 'goto' === key ) {
						return ( path ) => {
							return page.goto( this.config.baseURL + path );
						};
					} else if ( 'waitForNavigation' === key ) {
						return ( args ) => {
							if ( args.url ) {
								return page.waitForNavigation( { url: this.config.baseURL + args.url } );
							}

							return page.waitForNavigation( args || {} );
						};
					}

					return target[ key ];
				},
			} );
		}
	}
};
