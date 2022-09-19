const { ControlBase } = require( './control-base' );

class Color extends ControlBase {
	static TYPE_GLOBAL_COLOR = 'global';
	static TYPE_LOCAL_COLOR = 'local';

	constructor( ...args ) {
		super( ...args );

		this.globalToggleButton = this.elementLocator.locator( '.e-global__popover-toggle' );
		this.localToggleButton = this.elementLocator.locator( '.pickr' );
	}

	getSelector() {
		return `.elementor-control-${ this.config.name } .elementor-control-input-wrapper`;
	}

	async getValue() {
		const isCurrentValueVGlobal = await this.hasGlobalOption() && await this.isGlobalValueActive();

		if ( isCurrentValueVGlobal ) {
			return [ this.constructor.TYPE_GLOBAL_COLOR, await this.getGlobalValue() ];
		}

		return [ this.constructor.TYPE_LOCAL_COLOR, await this.getLocalValue() ];
	}

	async setValue( [ type, value ] ) {
		const shouldSetGlobalValue = type === this.constructor.TYPE_GLOBAL_COLOR;

		if ( shouldSetGlobalValue ) {
			await this.setGlobalValue( value );

			return;
		}

		await this.setLocalValue( value );
	}

	async getTestValues( [ initialType, initialColor ] = [] ) {
		const testValues = [
			[ this.constructor.TYPE_LOCAL_COLOR, '#FF0000' ],
			[ this.constructor.TYPE_LOCAL_COLOR, '#0000FF' ],
		];

		if ( await this.hasGlobalOption() ) {
			const value = initialType === this.constructor.TYPE_GLOBAL_COLOR && 'primary' === initialColor
				? 'secondary'
				: 'primary';

			testValues.unshift( [ this.constructor.TYPE_GLOBAL_COLOR, value ] );
		}

		return testValues;
	}

	async hasGlobalOption() {
		return await this.globalToggleButton.count() > 0;
	}

	async isGlobalValueActive() {
		return await this.globalToggleButton.evaluate(
			( el ) => el.classList.contains( 'e-global__popover-toggle--active' ),
		);
	}

	async getGlobalValue() {
		await this.globalToggleButton.click();

		const value = await this.getGlobalPopoverLocator()
			.locator( '.e-global__preview-item--selected' )
			.evaluate( ( el ) => el.dataset.globalId );

		await this.globalToggleButton.click();

		return value;
	}

	async setGlobalValue( value ) {
		await this.globalToggleButton.click();

		await this.getGlobalPopoverLocator()
			.locator( `.e-global__preview-item[data-global-id=${ value }]` )
			.click();
	}

	async getLocalValue() {
		await this.localToggleButton.click();

		const value = await this.getColorPickerInputLocator().inputValue();

		await this.localToggleButton.click();

		return value;
	}

	async setLocalValue( value ) {
		await this.localToggleButton.click();

		await this.getColorPickerInputLocator().fill( value );

		await this.localToggleButton.click();
	}

	getColorPickerInputLocator() {
		return this.page.locator( '.pcr-app.visible input.pcr-result' );
	}

	getGlobalPopoverLocator() {
		return this.page.locator( '.dialog-widget.e-global__popover:visible' );
	}
}

module.exports = {
	Color,
};
