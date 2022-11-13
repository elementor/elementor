const { isObject } = require( '../utils' );

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
	 * Section's config.
	 *
	 * @protected
	 * @type {Object}
	 */
	sectionConfig = null;

	/**
	 * @protected
	 * @type {import('@playwright/test').Locator}
	 */
	elementLocator = null;

	constructor( page, { config, sectionConfig } ) {
		this.page = page;
		this.config = config;
		this.sectionConfig = sectionConfig;
		this.elementLocator = page.locator( this.getSelector() );
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
		// Some values are empty string and some are spaces in a string,
		// in the final image name both of them are "empty" value.
		if ( 'string' === typeof value && '' === value.trim() ) {
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
	 * Test's setup.
	 * Can be overriden in sub-classes.
	 *
	 * @return {Promise<*>}
	 */
	async setup() {
		await this.switchToView();

		// Open popover.
		if ( this.isInsidePopover() && ! await this.isPopoverOpen() ) {
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
		if ( this.isInsidePopover() && await this.isPopoverOpen() ) {
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
		// Get the toggle control name from the condition of the current control.
		// to open the popover.
		const toggleControlName = Object.keys( this.config?.condition )[ 0 ].replace( '!', '' );

		await this.page.click( `.elementor-control-${ toggleControlName } label.elementor-control-popover-toggle-toggle-label` );
	}

	/**
	 * @protected
	 *
	 * @return {Promise<import('@playwright/test').ElementHandle>}
	 */
	async getPopover() {
		return this.page.$( `.elementor-controls-popover:has(${ this.getSelector() })` );
	}

	/**
	 * @return {boolean}
	 */
	hasConditions() {
		// There are 2 types of conditions, and sometime they exists in the config but empty.
		// when checking for object we make sure that the "conditions"/"condition" are not empty.
		return isObject( this.config.condition ) || isObject( this.config.conditions );
	}

	/**
	 * @return {boolean}
	 */
	hasSectionConditions() {
		// There are 2 types of conditions, and sometime they exists in the config but empty.
		// when checking for object we make sure that the "conditions"/"condition" are not empty.
		return this.sectionConfig && (
			isObject( this.sectionConfig?.condition ) ||
			isObject( this.sectionConfig?.conditions )
		);
	}

	/**
	 * @return {boolean}
	 */
	isInsidePopover() {
		// For now supporting only popover with one condition.
		return !! this.config.popover && 1 === Object.keys( this.config.condition ).length;
	}

	/**
	 * @return {boolean}
	 */
	canTestControl() {
		const isResponsiveControl = /(tablet|mobile|laptop|mobile_extra|widescreen|tablet_extra)$/i.test( this.config.name );
		const isHoverControl = /hover/i.test( this.config.name );
		const isAdvancedControl = 'advanced' === this.config.tab;

		return ! ( ! this.isInsidePopover() && this.hasConditions() ) &&
			! this.hasSectionConditions() &&
			! isResponsiveControl &&
			! isHoverControl &&
			! isAdvancedControl;
	}
}

module.exports = {
	ControlBase,
};
