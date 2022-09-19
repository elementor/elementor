const { ControlBase } = require( './control-base' );

class Select extends ControlBase {
	getSelector() {
		return `select[data-setting="${ this.config.name }"]`;
	}

	async getValue() {
		return await this.elementLocator.inputValue();
	}

	async setValue( newValue ) {
		await this.elementLocator.selectOption( newValue );
	}

	async getTestValues( initialValue ) {
		if ( this.config.groups ) {
			return this.config.groups.reduce( ( carry, group ) => {
				return [
					...carry,
					...Object.keys( group.options ),
				];
			}, [] );
		}

		return Object.keys( this.config.options )
			.filter( ( value ) => value !== initialValue );
	}
}

module.exports = {
	Select,
};
