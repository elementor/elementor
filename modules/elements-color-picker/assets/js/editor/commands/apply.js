import CommandBase from 'elementor-api/modules/command-base';

export class Apply extends CommandBase {
	/**
	 * Execute the color apply command.
	 *
	 * @param value The new color to apply.
	 * @param trigger The element which triggered the Apply command. Used to show `Selected` text & listen to `mouseleave`.
	 */
	apply( { value, trigger } ) {
		this.setColor( value );

		if ( trigger ) {
			// Show `Selected!` message.
			trigger.swatch.dataset.color = __( 'Selected!', 'elementor' );

			setTimeout( () => {
				trigger.swatch.dataset.color = value;
			}, 1000 );

			// End picking only after the user leaves the swatch container.
			trigger.palette.addEventListener( 'mouseleave', function handler( e ) {
				e.currentTarget.removeEventListener( 'mouseleave', handler );

				$e.run( 'elements-color-picker/end' );
			} );
		} else {
			$e.run( 'elements-color-picker/end' );
		}
	}

	/**
	 * Set a color to the current selected element.
	 *
	 * @param color
	 */
	setColor( color ) {
		$e.run( 'document/elements/settings', {
			container: this.component.currentPicker.container,
			settings: {
				[ this.component.currentPicker.control ]: color,
			},
			options: { external: true },
		} );

		this.component.currentPicker.initialColor = color;
	}
}
