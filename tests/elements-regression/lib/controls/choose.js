const { ControlBase } = require( './control-base' );

class Choose extends ControlBase {
	getSelector() {
		return `.elementor-control-${ this.config.name } .elementor-choices`;
	}

	async getValue() {
		const elementHandle = await this.elementLocator.elementHandle(),
			radio = await elementHandle.$( `input[type="radio"]:checked` );

		if ( ! radio ) {
			return '';
		}

		return await radio.inputValue();
	}

	async setValue( newValue ) {
		const currentValue = await this.getValue();

		if ( currentValue === newValue ) {
			return;
		}

		const elementHandle = await this.elementLocator.elementHandle();

		const isDefaultValue = ( '' === newValue ),
			radioValueToClick = isDefaultValue ? currentValue : newValue;

		const radioId = await elementHandle.$eval( `input[type="radio"][value="${ radioValueToClick }"]`, ( radio ) => radio.id );

		await this.elementLocator.locator( `label[for="${ radioId }"]` ).click();
	}

	async getTestValues( initialValue ) {
		return Object.keys( this.config.options )
			.filter( ( value ) => value !== initialValue );
	}
}

module.exports = {
	Choose,
};
