// import * as commands from './commands/';
import FontsHandler from "./handler";

export default class extends $e.modules.ComponentBase {
	constructor( editorHelper, config ) {
		super();
		new FontsHandler( editorHelper, config ).bindEvents();
	}

	/**
	 * Get the component namespace.
	 *
	 * @return {string} component namespace
	 */
	getNamespace() {
		return 'design-guidelines/fonts';
	}

	// /**
	//  * Get the component default commands.
	//  *
	//  * @return {Object} commands
	//  */
	// defaultCommands() {
	// 	return this.importCommands( commands );
	// }
}
