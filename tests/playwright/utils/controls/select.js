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

	async getTestValues( defaultValue ) {
		if ( this.config.groups ) {
			return this.config.groups.reduce( ( carry, group ) => {
				return [
					...carry,
					...Object.keys( group.options ),
				];
			}, [] );
		}

		return Object.keys( this.config.options )
			.filter( ( value ) => value !== defaultValue );
	}
}

module.exports = {
	Select,
};
