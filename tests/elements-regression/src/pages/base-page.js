module.exports = class BasePage {
	/**
	 * @type {import('@playwright/test').Page}
	 */
	page;

	/**
	 * @type {{}}
	 */
	config = {};

	/**
	 * @param {import('@playwright/test').Page} page
	 * @param {{}}                              config
	 */
	constructor( page, config ) {
		if ( ! page ) {
			throw new Error( 'Page must be provided' );
		}

		this.page = page;
		this.config = config;
	}
};
