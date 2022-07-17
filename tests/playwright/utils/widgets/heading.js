const { WidgetBase } = require( './widget-base' );

class Heading extends WidgetBase {
	static getType() {
		return 'heading';
	}

	async setup() {
		// Set the parent section background to red in order to test controls such as "blend mode".
		await this.editor.page.evaluate( () => {
			const section = elementor.getContainer( 'document' ).children[ 0 ];

			$e.run( 'document/elements/settings', {
				container: section,
				settings: {
					background_background: 'classic',
					background_color: '#F00',
				},
				options: { external: true },
			} );
		} );
	}

	async testControl( control, controlId, assertionsCallback ) {
		await control.setup();

		await control.test( async ( currentControlValue ) => {
			// Wait for renders.
			if ( [ 'size', 'header_size' ].includes( controlId ) ) {
				await this.editor.page.waitForTimeout( 250 );
			}

			if ( [ 'blend_mode' ].includes( controlId ) ) {
				await this.editor.page.waitForTimeout( 700 );
			}

			await assertionsCallback( controlId, currentControlValue );
		} );

		await control.teardown();
	}
}

module.exports = {
	Heading,
};
