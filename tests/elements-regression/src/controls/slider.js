const { ControlBase } = require( './control-base' );

class Slider extends ControlBase {
	static NO_UNIT = 'default';

	/**
	 * @protected
	 * @type {import('@playwright/test').Locator}
	 */
	inputLocator;

	constructor( ...args ) {
		super( ...args );

		this.inputLocator = this.elementLocator.locator( 'input[type="number"]' );
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

		await this.elementLocator.locator( `.e-units-switcher` ).click();
		await this.elementLocator.locator( `label[for="${ inputId }"]` ).click();
	}

	async getCurrentInputValue() {
		return await this.inputLocator.inputValue();
	}

	async setInputValue( value ) {
		await this.inputLocator.fill( `${ value }` );
	}

	async getTestValues( [ initialUnit, initialValue ] = [] ) {
		const units = this.hasUnits() ? this.config.size_units : [ this.constructor.NO_UNIT ];
		const values = [];

		for ( const unit of units ) {
			const range = await this.getUnitRange( unit );

			values.push(
				[ unit, range.min.toString() ],
				[ unit, ( ( range.max + range.min ) / 2 ).toString() ],
				[ unit, range.max.toString() ],
			);
		}

		return values.filter(
			( [ unit, value ] ) => ! ( unit === initialUnit && value === initialValue ),
		);
	}

	hasUnits() {
		return this.config?.size_units?.length > 1;
	}

	async getUnitRange( unit ) {
		if ( this.hasUnits() ) {
			await this.setUnit( unit );
		}

		return await this.inputLocator.evaluate( ( el ) => {
			return {
				min: parseInt( el.getAttribute( 'min' ) ) || 0,
				max: parseInt( el.getAttribute( 'max' ) ) || 100,
			};
		} );
	}

	generateSnapshotLabel( [ unit, value ] ) {
		unit = '%' === unit ? 'percentage' : unit;

		return `${ unit }-${ value }`;
	}
}

module.exports = {
	Slider,
};
