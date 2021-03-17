import CommandBase from 'elementor-api/modules/command-base';

export class Start extends CommandBase {
	apply( args ) {
		elementor.$previewContents.find( 'body' ).addClass( 'elementor-editor__ui-state__color-picker' );

		this.component.currentPicker = {
			container: args.container,
			control: args.control,
			initialColor: args.container.getSetting( args.control ),
		};

		// Prevent elements from triggering edit mode on click.
		elementor.changeEditMode( 'picker' );

		// Initialize a swatch on click.
		elementor.$previewContents.on( 'click.color-picker', '.elementor-element', ( e ) => {
			$e.run( 'elements-color-picker/show-swatches', { event: e } );
		} );

		// Stop the picking process when the user leaves the preview area.
		elementor.$previewWrapper.on( 'mouseleave.color-picker', () => {
			$e.run( 'elements-color-picker/end' );
		} );
	}
}
