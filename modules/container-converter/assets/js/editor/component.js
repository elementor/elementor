import * as commands from './commands/';

export default class extends $e.modules.ComponentBase {
	constructor() {
		super();

		this.bindEvents();
	}

	/**
	 * Listen to click event in the panel.
	 *
	 * @return {void}
	 */
	bindEvents() {
		elementor.channels.editor.on( 'elementorContainerConverter:convert', ( { container, el } ) => {
			const button = el.querySelector( '.elementor-button' );
			const loadingClass = 'e-loading';

			button.classList.add( loadingClass );

			// Defer the conversion process in order to force a re-render of the button, since the conversion is
			// synchronous and blocks the main thread from re-rendering.
			setTimeout( () => {
				if ( 'document' === container.type ) {
					$e.run( 'container-converter/convert-all' );
				} else {
					$e.run( 'container-converter/convert', { container } );
				}

				button.classList.remove( loadingClass );
				button.setAttribute( 'disabled', true );

				elementor.notifications.showToast( {
					message: __( 'Your changes have been updated.', 'elementor' ),
				} );
			} );
		} );
	}

	/**
	 * Get the component namespace.
	 *
	 * @return {string} component namespace
	 */
	getNamespace() {
		return 'container-converter';
	}

	/**
	 * Get the component default commands.
	 *
	 * @return {Object} commands
	 */
	defaultCommands() {
		return this.importCommands( commands );
	}
}
