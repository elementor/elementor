import { type Page, type TestInfo } from '@playwright/test';

export default class BasePage {
	readonly page: Page;
	readonly testInfo: TestInfo;
	/**
	 * @param {import('@playwright/test').Page}     page
	 * @param {import('@playwright/test').TestInfo} testInfo
	 */
	constructor( page: Page, testInfo: TestInfo ) {
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

		const { baseURL, proxy } = this.testInfo.config.projects[ 0 ].use;

		// If wordpress is not located on the domain's top-level (e.g:  http://local.host/test-wordpress ), playwright's `baseURL` cannot handle it.
		if ( proxy ) {
			this.page = new Proxy( this.page, {
				get: ( target, key ) => {
					switch ( key ) {
						case 'goto':
							return ( path: string ) => page.goto( baseURL + path );

						case 'waitForNavigation': {
							return ( args: { url?: string } ) => {
								args = ( args.url ) ? { url: baseURL + args.url } : args;

								return page.waitForNavigation( args );
							};
						}
					}

					return target[ key ];
				},
			} );
		}
	}
}
