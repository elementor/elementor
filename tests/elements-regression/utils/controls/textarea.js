const { ControlBase } = require( './control-base' );

class Textarea extends ControlBase {
	static getType() {
		return 'textarea';
	}

	getSelector() {
		return `textarea[data-setting="${ this.config.name }"]`;
	}

	async getValue() {
		return await this.elementLocator.inputValue();
	}

	async setValue( newValue ) {
		await this.elementLocator.fill( newValue );
	}

	async test( assertionsCallback ) {
		const originalValue = await this.getValue();

		await this.setValue( 'test-value' );

		await assertionsCallback( await this.getValue() );

		await this.setValue( originalValue );
	}
}

module.exports = {
	Textarea,
};
