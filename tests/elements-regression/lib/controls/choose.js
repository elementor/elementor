const BaseControl = require( './base-control' );

module.exports = class Choose extends BaseControl {
	options;

	constructor( { options, ...args } ) {
		super( args );

		this.options = options;
	}

	getSelector() {
		return `.elementor-control-${ this.name } .elementor-choices`;
	}

	getTestValues() {
		return this.options.filter( ( value ) => value !== this.defaultValue );
	}

	async getValue( locator ) {
		const radio = await (
			await locator.elementHandle()
		).$( `input[type="radio"]:checked` );

		if ( ! radio ) {
			return '';
		}

		return await radio.inputValue();
	}

	async setValue( locator, value ) {
		const currentValue = await this.getValue( locator );

		if ( currentValue === value ) {
			return;
		}

		await this.clickOn( locator, value );
	}

	async resetValue( locator ) {
		const currentValue = await this.getValue( locator );

		if ( currentValue === this.defaultValue ) {
			return;
		}

		await this.clickOn( locator, currentValue );
	}

	async clickOn( locator, value ) {
		const radioId = await locator
			.locator( `input[type="radio"][value="${ value }"]` )
			.evaluate( ( el ) => el.id );

		const label = await (
			await locator.elementHandle()
		).$( `label[for="${ radioId }"]` );

		if ( ! label ) {
			return;
		}

		await label.click();
	}
};
