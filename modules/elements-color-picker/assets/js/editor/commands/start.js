import { addNamespaceHandler } from '../utils';
import { COLOR_PICKING_ON } from '../ui-states/color-picking';

/**
 * Start the color picking process.
 */
export class Start extends $e.modules.CommandBase {
	apply( args ) {
		// Activate the component since the default behavior will activate it only on route change,
		// but this component doesn't have any routes.
		this.component.activate();

		// Enter color picking mode.
		$e.uiStates.set( 'elements-color-picker/color-picking', COLOR_PICKING_ON );

		this.component.currentPicker = {
			...args,
			initialColor: args.container.getSetting( args.control ),
		};

		// Set the picking process trigger to active mode.
		this.component.currentPicker.trigger.classList.add( 'e-control-tool-disabled' );

		// Initialize a swatch on click.
		const elementorElements = elementor.$previewContents[ 0 ].querySelectorAll( '.elementor-element' );

		addNamespaceHandler( elementorElements, 'click.color-picker', ( e ) => {
			e.preventDefault();
			$e.run( 'elements-color-picker/show-swatches', { event: e } );
		} );

		// Stop the picking process when the user leaves the preview area.
		addNamespaceHandler( elementor.$previewWrapper[ 0 ], 'mouseleave.color-picker', () => {
			$e.run( 'elements-color-picker/end' );
		} );
	}
}
