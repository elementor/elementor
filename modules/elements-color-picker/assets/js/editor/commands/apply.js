/**
 * Apply & Save the selected color on click.
 */
export class Apply extends $e.modules.CommandBase {
	/**
	 * Validate the command arguments.
	 *
	 * @param {Object} args
	 */
	validateArgs( args ) {
		this.requireArgumentType( 'value', 'string', args );
	}

	/**
	 * Execute the color apply command.
	 *
	 * @param {Object}      root0
	 * @param {string}      root0.value   The new color to apply.
	 * @param {HTMLElement} root0.trigger The element which triggered the Apply command. Used to show `Selected` text & listen to `mouseleave`.
	 *
	 * @return {void}
	 */
	apply( { value, trigger } ) {
		this.setColor( value );

		if ( trigger ) {
			const prevText = trigger.swatch.dataset.text;

			// Show `Selected!` message.
			trigger.swatch.dataset.text = __( 'Selected', 'elementor' );

			// Hide message after a second.
			setTimeout( () => {
				trigger.swatch.dataset.text = prevText;
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
	 * @param {*} color
	 *
	 * @return {void}
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
