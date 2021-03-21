import CommandBase from 'elementor-api/modules/command-base';

export class Start extends CommandBase {
	apply( args ) {
		// Prevent elements from triggering edit mode on click.
		elementor.changeEditMode( 'picker' );

		elementor.$previewContents[ 0 ].querySelector( 'body' ).classList.add( 'elementor-editor__ui-state__color-picker', 'elementor-edit-area-active' );

		this.component.currentPicker = {
			...args,
			initialColor: args.container.getSetting( args.control ),
		};

		// Set the picking process trigger to active mode.
		this.component.currentPicker.trigger.classList.add( 'e-control-tool-disabled' );

		// Initialize a swatch on click.
		elementor.$previewContents.on( 'click.color-picker', '.elementor-element', ( e ) => {
			$e.run( 'elements-color-picker/show-swatches', { event: e } );
		} );

		// Prevent lightbox from opening.
		this.component.lightboxTriggers = elementor.$previewContents[ 0 ].querySelectorAll( '[data-elementor-open-lightbox="yes"]' );

		this.component.lightboxTriggers.forEach( ( item ) => {
			item.dataset.elementorOpenLightbox = 'no';
		} );

		// Stop the picking process when the user leaves the preview area.
		elementor.$previewWrapper.on( 'mouseleave.color-picker', () => {
			$e.run( 'elements-color-picker/end' );
		} );
	}
}
