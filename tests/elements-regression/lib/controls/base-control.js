module.exports = class BaseControl {
	/**
	 * @type {string}
	 */
	name;

	/**
	 * @type {string}
	 */
	defaultValue;

	/**
	 * @type {string}
	 */
	tab;

	/**
	 * @type {string}
	 */
	section;

	/**
	 * @type {boolean}
	 */
	isInsidePopover;

	constructor( { name, defaultValue, tab, section, isInsidePopover } ) {
		this.name = name;
		this.defaultValue = defaultValue;
		this.tab = tab;
		this.section = section;
		this.isInsidePopover = isInsidePopover;
	}

	/**
	 * @return {string}
	 */
	getSelector() {
		throw this.constructor.name + '.getSelector() is not implemented!';
	}

	/**
	 * @return {string[]}
	 */
	getTestValues() {
		throw this.constructor.name + '.getTestValues() is not implemented!';
	}

	/**
	 * @param {import('@playwright/test').Locator} locator
	 * @param {string}                             value
	 * @return {Promise<void>}
	 */
	async setValue( locator, value ) {
		throw this.constructor.name + '.setValue() is not implemented!';
	}

	/**
	 * @param {import('@playwright/test').Locator} locator
	 * @return {Promise<any>}
	 */
	async getValue( locator ) {
		throw this.constructor.name + '.getValue() is not implemented!';
	}

	/**
	 * @param {import('@playwright/test').Locator} locator
	 * @return {Promise<void>}
	 */
	async resetValue( locator ) {
		await this.setValue( locator, this.defaultValue );
	}
};
