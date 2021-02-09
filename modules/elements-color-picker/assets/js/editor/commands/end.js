import CommandBase from 'elementor-api/modules/command-base';

export class End extends CommandBase {
	apply( { value, trigger } ) {
		this.setColor( value );

		if ( trigger ) {
			// Show `Selected!` message.
			trigger.swatch.dataset.color = __( 'Selected!', 'elementor' );

			setTimeout( () => {
				trigger.swatch.dataset.color = value;
			}, 1000 );

			// End picking only after the user leaves the swatch container.
			trigger.palette.on( 'mouseleave.color-picker', () => {
				this.endPicking();
				trigger.palette.off( 'mouseleave.color-picker' );
			} );
		} else {
			this.endPicking();
		}
	}

	setColor( color ) {
		$e.run( 'document/elements/settings', {
			container: this.component.currentPicker.container,
			settings: {
				[ this.component.currentPicker.control ]: color,
			},
		} );

		this.component.currentPicker.initialColor = color;
	}

	endPicking() {
		elementor.$previewContents.find( 'body' ).removeClass( 'elementor-editor__ui-state__color-picker' );

		elementor.$previewContents.find( '.elementor-element-color-picker' ).remove();

		elementor.$previewContents.off( 'mouseenter.color-picker' );

		elementor.$previewWrapper.off( 'mouseleave.color-picker' );

		this.component.currentPicker = {
			container: null,
			control: null,
			initialColor: null,
		};
	}
}
