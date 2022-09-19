const { ControlBase } = require( './control-base' );

class Text extends ControlBase {
	getSelector() {
		return `input[data-setting="${ this.config.name }"]`;
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
	Text,
};
