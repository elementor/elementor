const { ControlBase } = require( './control-base' );

class Color extends ControlBase {
	static GLOBAL_COLOR_TYPE = 'global';
	static LOCAL_COLOR_TYPE = 'local';

	constructor( ...args ) {
		super( ...args );

		this.globalToggleButton = this.elementLocator.locator( '.e-global__popover-toggle' );
		this.localToggleButton = this.elementLocator.locator( '.pickr' );
	}

	static getType() {
		return 'color';
	}

	getSelector() {
		return `.elementor-control-${ this.config.name } .elementor-control-input-wrapper`;
	}

	async hasGlobalOption() {
		return await this.globalToggleButton.count() > 0;
	}

	async getValue() {
		if ( await this.hasGlobalOption() ) {
			const isGlobalActive = await this.globalToggleButton.evaluate(
				( el ) => el.classList.contains( 'e-global__popover-toggle--active' ),
			);

			if ( isGlobalActive ) {
				await this.globalToggleButton.click();

				const value = await this.page
					.locator( '.dialog-widget.e-global__popover:visible .e-global__preview-item--selected' )
					.evaluate( ( el ) => el.dataset.globalId );

				await this.globalToggleButton.click();

				return [ this.constructor.GLOBAL_COLOR_TYPE, value ];
			}
		}

		await this.localToggleButton.click();

		const value = await this.page.locator( '.pcr-app.visible input.pcr-result' ).inputValue();

		await this.localToggleButton.click();

		return [ this.constructor.LOCAL_COLOR_TYPE, value ];
	}

	async setValue( [ type, value ] ) {
		if ( type === this.constructor.GLOBAL_COLOR_TYPE ) {
			await this.globalToggleButton.click();

			await this.page
				.locator( `.dialog-widget.e-global__popover:visible .e-global__preview-item[data-global-id=${ value }]` )
				.click();

			return;
		}

		await this.localToggleButton.click();

		await this.page.locator( '.pcr-app.visible input.pcr-result' ).fill( value );

		await this.localToggleButton.click();
	}

	async test( assertionsCallback ) {
		const [ originalType, originalColor ] = await this.getValue();

		const testValues = [
			[ this.constructor.LOCAL_COLOR_TYPE, '#FF0000' ],
			[ this.constructor.LOCAL_COLOR_TYPE, '#0000FF' ],
		];

		if ( await this.hasGlobalOption() ) {
			const colorChooseDictonary = {
				primary: 'secondary',
				secondary: 'primary',
				text: 'primary',
				accent: 'primary',
			};

			const value = originalType === this.constructor.GLOBAL_COLOR_TYPE
				? colorChooseDictonary[ originalColor ]
				: 'primary';

			testValues.push( [ this.constructor.GLOBAL_COLOR_TYPE, value ] );
		}

		for ( const [ type, value ] of testValues ) {
			await this.setValue( [ type, value ] );

			await assertionsCallback( `${ type }-${ value.replace( '#', '' ) }` );
		}

		await this.setValue( [ originalType, originalColor ] );
	}
}

module.exports = {
	Color,
};
