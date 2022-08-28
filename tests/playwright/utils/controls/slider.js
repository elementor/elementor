const { ControlBase } = require( './control-base' );

class Slider extends ControlBase {
	static NO_UNIT = 'default';

	static getType() {
		return 'slider';
	}

	getSelector() {
		return `.elementor-control-${ this.config.name }`;
	}

	async getValue() {
		return [
			this.hasUnits() ? await this.getCurrentUnit() : this.constructor.NO_UNIT,
			await this.getCurrentInputValue(),
		];
	}

	async setValue( [ unit, value ] ) {
		if ( this.hasUnits() ) {
			await this.setUnit( unit );
		}

		await this.setInputValue( value );
	}

	async getCurrentUnit() {
		return await this.elementLocator.locator( 'input[type="radio"]:checked' ).inputValue();
	}

	async setUnit( unit ) {
		const inputId = await this.elementLocator
			.locator( `input[type="radio"][value="${ unit }"]` )
			.evaluate( ( el ) => el.id );

		await this.elementLocator.locator( `label[for="${ inputId }"]` ).click();
	}

	async getCurrentInputValue() {
		return await this.elementLocator.locator( 'input[type="number"]' ).inputValue();
	}

	async setInputValue( value ) {
		await this.elementLocator.locator( 'input[type="number"]' ).fill( `${ value }` );
	}

	getTestValues( [ defaultUnit, defaultValue ] ) {
		return ( this.hasUnits() ? this.config.size_units : [ this.constructor.NO_UNIT ] )
			.reduce( ( carry, unit ) => {
				const range = this.getUnitRange( unit );

				return [
					...carry,
					...[
						[ unit, range.min.toString() ],
						[ unit, ( range.max / 2 ).toString() ],
						[ unit, range.max.toString() ],
					],
				];
			}, [] )
			.filter( ( [ unit, value ] ) => ! ( unit === defaultUnit && value === defaultValue ) );
	}

	hasUnits() {
		return this.config?.size_units?.length > 0;
	}

	getUnitRange( unit ) {
		const { min = 0, max = 100 } = (
			unit === this.constructor.NO_UNIT ? this.config?.range : this.config?.range?.[ unit ]
		) || {};

		return { min, max };
	}

	generateValueName( [ unit, value ] ) {
		unit = '%' === unit ? 'percentage' : unit;

		return `${ unit }-${ value }`;
	}
}

module.exports = {
	Slider,
};
