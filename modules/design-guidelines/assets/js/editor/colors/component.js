import * as commands from './commands/';
import ColorsHandler from "./handler";

export default class extends $e.modules.ComponentBase {
	constructor( editorHelper, config ) {
		super();
		this.handler = new ColorsHandler( editorHelper, config );
		this.handler.bindEvents();
	}

	/**
	 * Get the component namespace.
	 *
	 * @return {string} component namespace
	 */
	getNamespace() {
		return 'design-guidelines/colors';
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
