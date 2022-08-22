const BaseControl = require( './base-control' );

module.exports = class Textarea extends BaseControl {
	getSelector() {
		return `textarea[data-setting="${ this.name }"]`;
	}

	getTestValues() {
		return [ 'Test value' ];
	}

	async getValue( locator ) {
		return await locator.inputValue();
	}

	async setValue( locator, value ) {
		await locator.fill( value );
	}
};
