import { removeNamespaceHandler } from '../utils';

/**
 * End the color picking process and return to the normal editor state.
 */
export class End extends $e.modules.CommandBase {
	/**
	 * Initialize the command.
	 *
	 * @return {void}
	 */
	apply() {
		// In-Activate the component since the default behavior will in-activate it only on route change,
		// but this component doesn't have any routes.
		this.component.inactivate();

		// Remove all elements & event listeners.
		elementor.$previewContents[ 0 ].querySelectorAll( '.e-element-color-picker' ).forEach( ( picker ) => {
			jQuery( picker ).tipsy( 'hide' );
			picker.remove();
		} );

		const elementorElements = elementor.$previewContents[ 0 ].querySelectorAll( '.elementor-element' );

		removeNamespaceHandler( elementorElements, 'click.color-picker' );

		removeNamespaceHandler( elementor.$previewWrapper[ 0 ], 'mouseleave.color-picker' );

		// Set the picking process trigger to inactive mode.
		// eslint-disable-next-line no-unused-expressions
		this.component.currentPicker.trigger?.classList.remove( 'e-control-tool-disabled' );

		// Reset the current picker.
		this.component.resetPicker();

		// Exit color picking mode.
		$e.uiStates.remove( 'elements-color-picker/color-picking' );
	}
}
