const { ControlBase } = require( './control-base' );

class Select extends ControlBase {
	static getType() {
		return 'select';
	}

	getSelector() {
		return `select[data-setting="${ this.config.name }"]`;
	}

	async getValue() {
		return await this.elementLocator.inputValue();
	}

	async setValue( newValue ) {
		await this.elementLocator.selectOption( newValue );
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
	Select,
};
