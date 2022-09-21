const { ControlBase } = require( './control-base' );

class Media extends ControlBase {
	getSelector() {
		return `.elementor-control-${ this.config.name }.elementor-control-type-media`;
	}

	async getValue() {
		await this.openMediaLibrary();

		const element = await this.page.$( 'li[role="checkbox"].selected' );

		const value = element
			? Object.entries( process.env )
				.find( ( [ key, value ] ) =>
					key.startsWith( 'ELEMENTS_REGRESSION_MEDIA_IDS_' ) &&
					value === mediaId,
				)
				?.[ 0 ]
				?.replace( 'ELEMENTS_REGRESSION_MEDIA_IDS_', '' )
			: null;

		await this.closeMediaLibrary();

		return value;
	}

	async setValue( newValue ) {
		const id = process.env?.[ `ELEMENTS_REGRESSION_MEDIA_IDS_${ newValue }` ];

		if ( ! id ) {
			throw new Error( `Media file with name '${ newValue }' was not found.` );
		}

		await this.openMediaLibrary();

		await this.page.locator( `li[role="checkbox"][data-id="${ id }"]` ).click();
		await this.page.locator( `button.media-button:has-text("Select")` ).click();
	}

	async getTestValues() {
		return [ 'elementor.png' ];
	}

	async openMediaLibrary() {
		await this.elementLocator.locator( '.elementor-control-media-area' ).click();
		await this.page.locator( 'h1:has-text("Insert Media")' ).waitFor();
	}

	async closeMediaLibrary() {
		await this.page.locator( '.media-modal button:has-text("Close dialog")' ).click();
	}
}

module.exports = {
	Media,
};
