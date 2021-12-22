export default class BasePage {
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

		page.on( "pageerror", ( err ) => {
			console.error( err )
		} )

		// Listen for all console logs
		page.on( 'console', msg => console.log( msg.text() ) )
	}
}
