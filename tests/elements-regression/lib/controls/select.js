const BaseControl = require( './base-control' );

module.exports = class Select extends BaseControl {
	options;

	constructor( { options, ...args } ) {
		super( args );

		this.options = options;
	}

	getSelector() {
		return `select[data-setting="${ this.name }"]`;
	}

	getTestValues() {
		return this.options.filter( ( value ) => value !== this.defaultValue );
	}

	async getValue( locator ) {
		return await locator.inputValue();
	}

	async setValue( locator, value ) {
		await locator.selectOption( value );
	}
};
