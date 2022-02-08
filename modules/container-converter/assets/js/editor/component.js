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
		elementor.channels.editor.on( 'elementorContainerConverter:convert', ( { container } ) => {
			if ( 'document' === container.type ) {
				$e.run( 'container-converter/convert-all' );
				return;
			}

			$e.run( 'container-converter/convert', { container } );
		} );
	}

	/**
	 * Get the component namespace.
	 *
	 * @return {string}
	 */
	getNamespace() {
		return 'container-converter';
	}

	/**
	 * Get the component default commands.
	 *
	 * @return {Object}
	 */
	defaultCommands() {
		return this.importCommands( commands );
	}
}
