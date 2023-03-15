const { ControlBase } = require( './control-base' );

class Textarea extends ControlBase {
	getSelector() {
		return `textarea[data-setting="${ this.config.name }"]`;
	}

	async getValue() {
		return await this.elementLocator.inputValue();
	}

	async setValue( newValue ) {
		await this.elementLocator.fill( newValue );
	}

	async getTestValues() {
		return [ 'Test value' ];
	}
}

module.exports = {
	Textarea,
};
