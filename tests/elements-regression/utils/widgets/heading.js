const { WidgetBase } = require( './widget-base' );

class Heading extends WidgetBase {
	static getType() {
		return 'heading';
	}

	async beforeControlTest( { control, controlId } ) {
		if ( 'blend_mode' === controlId ) {
			// Set the parent section background to red in order to test controls such as "blend mode".
			await this.setSectionBackgroundColor( '#F00' );
		}

		await super.beforeControlTest( { control, controlId } );
	}

	async afterControlTest( { control, controlId } ) {
		await super.afterControlTest( { control, controlId } );

		if ( 'blend_mode' === controlId ) {
			await this.setSectionBackgroundColor( '#FFF' );
		}
	}

	async setSectionBackgroundColor( newColor ) {
		await this.editor.page.evaluate( ( [ backgroundColor ] ) => {
			const section = elementor.getContainer( 'document' ).children[ 0 ];

			$e.run( 'document/elements/settings', {
				container: section,
				settings: {
					background_background: 'classic',
					background_color: backgroundColor,
				},
				options: { external: true },
			} );
		}, [ newColor ] );
	}
}

module.exports = {
	Heading,
};
