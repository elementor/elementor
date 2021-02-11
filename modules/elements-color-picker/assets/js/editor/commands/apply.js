import CommandBase from 'elementor-api/modules/command-base';

export class Apply extends CommandBase {
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
				$e.run( 'elements-color-picker/end' );
				trigger.palette.off( 'mouseleave.color-picker' );
			} );
		} else {
			$e.run( 'elements-color-picker/end' );
		}
	}

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
