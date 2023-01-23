module.exports = class BasePage {
	/**
	 * @type {import('@playwright/test').Page}
	 */
	page;

	/**
	 * @param {import('@playwright/test').Page} page
	 */
	constructor( page ) {
		if ( ! page ) {
			throw new Error( 'Page must be provided' );
		}

		this.page = page;
	}
};
