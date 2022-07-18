const { WidgetBase } = require( './widget-base' );

class Heading extends WidgetBase {
	static getType() {
		return 'heading';
	}

	async beforeControlTest( { controlId } ) {
		if ( 'blend_mode' === controlId ) {
			// Set the parent section background to red in order to test controls such as "blend mode".
			await this.setSectionBackgroundColor( '#F00' );
		}
	}

	async afterControlTest( { controlId } ) {
		if ( 'blend_mode' === controlId ) {
			await this.setSectionBackgroundColor( '#FFF' );
		}
	}

	async beforeControlAssertions( { controlId } ) {
		// Wait for renders.
		if ( [ 'size', 'header_size' ].includes( controlId ) ) {
			await this.editor.page.waitForTimeout( 250 );
		}

		if ( [ 'blend_mode', 'typography_font_weight' ].includes( controlId ) ) {
			await this.editor.page.waitForTimeout( 700 );
		}
	}

	async setSectionBackgroundColor( newColor ) {
		await this.editor.page.evaluate( ( [ newColor ] ) => {
			const section = elementor.getContainer( 'document' ).children[ 0 ];

			$e.run( 'document/elements/settings', {
				container: section,
				settings: {
					background_background: 'classic',
					background_color: newColor,
				},
				options: { external: true },
			} );
		}, [ newColor ] );
	}
}

module.exports = {
	Heading,
};
