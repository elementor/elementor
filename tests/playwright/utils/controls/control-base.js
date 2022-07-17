class ControlBase {
	/**
	 * @protected
	 * @type {import('@playwright/test').Page}
	 */
	page = null;

	/**
	 * Control's config.
	 *
	 * @protected
	 * @type {Object}
	 */
	config = null;

	/**
	 * @protected
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
	 * @protected
	 *
	 * @return {string}
	 */
	getSelector() {
		throw this.constructor.name + '.getSelector() is not implemented!';
	}

	/**
	 * Iterate over all of the control's available values.
	 *
	 * @param {Function} assertionsCallback
	 *
	 * @return {void}
	 */
	async test( assertionsCallback ) {
		throw this.constructor.name + '.test() is not implemented!';
	}

	/**
	 * Test setup.
	 * Can be overriden in sub-classes.
	 *
	 * @return {Promise<*>}
	 */
	async setup() {
		await this.switchToView();
	}

	/**
	 * Test teardown.
	 * Can be overriden in sub-classes.
	 *
	 * @return {Promise<*>}
	 */
	async teardown() {
		if ( this.config.popover?.end ) {
			await this.resetPopover();
		}
	}

	/**
	 * Make sure the control is visible.
	 *
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async switchToView() {
		await this.page.locator( `.elementor-panel-navigation-tab[data-tab="${ this.config.tab }"]` ).click();

		const section = await this.page.$( `.elementor-control-${ this.config.section }:not( .elementor-open )` );

		if ( section ) {
			await section.click();
		}

		if ( this.config.popover && ! await this.isPopoverOpen() ) {
			await this.openPopover();
		}
	}

	/**
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async openPopover() {
		await this.clickPopoverToggle( true );
	}

	/**
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async resetPopover() {
		await this.clickPopoverToggle( false );
	}

	/**
	 * @protected
	 *
	 * @return {Promise<boolean>}
	 */
	async isPopoverOpen() {
		const popover = await this.getPopover();

		if ( ! popover ) {
			return false;
		}

		return await popover.evaluate( ( node ) => 'block' === node.style.display );
	}

	/**
	 * Open or reset the popover
	 *
	 * @protected
	 *
	 * @param {boolean} open - Whether to open or reset the popover.
	 *
	 * @return {Promise<void>}
	 */
	async clickPopoverToggle( open = true ) {
		const popoverToggleId = await this.getPopoverToggleId(),
			labelType = open ? 'custom' : 'defalt';

		await this.page.click( `label.elementor-control-popover-toggle-toggle-label[for="${ popoverToggleId }-${ labelType }"]` );
	}

	/**
	 * @protected
	 *
	 * @return {Promise<string>}
	 */
	async getPopoverToggleId() {
		const popover = await this.getPopover();

		return await popover.evaluate( ( node ) => node.dataset.popoverToggle );
	}

	/**
	 * @protected
	 *
	 * @return {Promise<import('@playwright/test').ElementHandle>}
	 */
	async getPopover() {
		return this.page.$( '.elementor-controls-popover', {
			has: this.elementLocator,
		} );
	}
}

module.exports = {
	ControlBase,
};
