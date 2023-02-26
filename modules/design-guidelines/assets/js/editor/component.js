import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	/**
	 * Retrieve the Design-Guidelines namespace.
	 *
	 * @return {string} Design-Guidelines namespace
	 */
	getNamespace() {
		return 'design-guidelines';
	}

	/**
	 * Import the component commands.
	 *
	 * @return {Object} commands
	 */
	defaultCommands() {
		return this.importCommands( commands );
	}
}
