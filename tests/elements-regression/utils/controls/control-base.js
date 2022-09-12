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

	// eslint-disable-next-line jsdoc/require-returns-check
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
	async setValue( newValue ) { // eslint-disable-line no-unused-vars
		throw this.constructor.name + '.setValue() is not implemented!';
	}

	/**
	 * Get all the test values
	 *
	 * @param {any} initialValue the initial value of the control
	 * @return {Promise<any[]>}
	 */
	async getTestValues( initialValue ) { // eslint-disable-line no-unused-vars
		throw this.constructor.name + '.getTestValues() is not implemented!';
	}

	/**
	 * Generate label for the snapshot image name.
	 *
	 * @param {any} value
	 * @return {string}
	 */
	generateSnapshotLabel( value ) {
		if ( '' === value ) {
			return 'empty';
		}

		if ( Array.isArray( value ) ) {
			return value.join( '-' );
		}

		return value;
	}

	// eslint-disable-next-line jsdoc/require-returns-check
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
	 * @return {boolean}
	 */
	isForcingServerRender() {
		return 'template' === this.config.render_type;
	}

	/**
	 * Test's setup.
	 * Can be overriden in sub-classes.
	 *
	 * @return {Promise<*>}
	 */
	async setup() {
		await this.switchToView();

		// Open popover.
		if ( this.config.popover && ! await this.isPopoverOpen() ) {
			await this.clickPopoverToggle();
		}
	}

	/**
	 * Test's teardown.
	 * Can be overriden in sub-classes.
	 *
	 * @return {Promise<*>}
	 */
	async teardown() {
		// Close popover.
		if ( this.config.popover && await this.isPopoverOpen() ) {
			await this.clickPopoverToggle();
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
		// Open tab.
		await this.page.locator( `.elementor-panel-navigation-tab[data-tab="${ this.config.tab }"]` ).click();

		// Open section.
		const section = await this.page.$( `.elementor-control-${ this.config.section }:not( .elementor-open )` );

		if ( section ) {
			await section.click();
		}
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
	 * @return {Promise<void>}
	 */
	async clickPopoverToggle() {
		const popover = await this.getPopover();

		const popoverToggleId = await popover.evaluate( ( node ) => node.dataset.popoverToggle );

		await this.page.click( `label.elementor-control-popover-toggle-toggle-label[for="${ popoverToggleId }-custom"]` );
	}

	/**
	 * @protected
	 *
	 * @return {Promise<import('@playwright/test').ElementHandle>}
	 */
	async getPopover() {
		return this.page.$( `.elementor-controls-popover:has(${ this.getSelector() })` );
	}
}

module.exports = {
	ControlBase,
};
