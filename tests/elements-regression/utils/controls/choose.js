const { ControlBase } = require( './control-base' );

class Choose extends ControlBase {
	static getType() {
		return 'choose';
	}

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

	async test( assertionsCallback ) {
		const originalValue = await this.getValue(),
			availableOptions = Object.keys( this.config.options );

		for ( const currentOption of availableOptions ) {
			await this.setValue( currentOption );
			await assertionsCallback( await this.getValue() );
		}

		await this.setValue( originalValue );
	}
}

module.exports = {
	Choose,
};
