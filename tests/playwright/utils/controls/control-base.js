class ControlBase {
	/**
	 * @type {import('@playwright/test').Page}
	 */
	page = null;

	/**
	 * Control's config.
	 *
	 * @type {null}
	 */
	config = null;

	/**
	 * @type {import('@playwright/test').Locator}
	 */
	elementLocator = null;

	constructor( page, config ) {
		this.page = page;
		this.config = config;
		this.elementLocator = page.locator( this.getSelector() );
	}

	/**
	 * Retreive the control type.
	 *
	 * @return {string}
	 */
	static getType() {
		throw this.constructor.name + '.getType() is not implemented!';
	}

	/**
	 * Get the current control value.
	 *
	 * @return {any}
	 */
	async getValue() {
		throw this.constructor.name + '.getValue() is not implemented!';
	}

	/**
	 * Set the current control value.
	 *
	 * @param {any} newValue
	 *
	 * @return {void}
	 */
	async setValue( newValue ) {
		throw this.constructor.name + '.setValue() is not implemented!';
	}

	/**
	 * Retrieve the control selector.
	 *
	 * @return {string}
	 */
	getSelector() {
		throw this.constructor.name + '.getSelector() is not implemented!';
	}

	/**
	 * Iterate over all of the control's available values.
	 *
	 * @return {void}
	 */
	async test() {
		throw this.constructor.name + '.test() is not implemented!';
	}

	/**
	 * Make sure the control is visible.
	 *
	 * @return {Promise<void>}
	 */
	async switchToView() {
		await this.page.locator( `.elementor-panel-navigation-tab[data-tab="${ this.config.tab }"]` ).click();

		const section = await this.page.$$( `.elementor-control-${ this.config.section }:not( .elementor-open )` );

		if ( section.length ) {
			await section[ 0 ].click();
		}

		// TODO: Handle popvoers?
	}
}

module.exports = {
	ControlBase,
};
