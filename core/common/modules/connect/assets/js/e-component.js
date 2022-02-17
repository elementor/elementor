import * as dataCommands from './data-commands/';

export default class EComponent extends $e.modules.ComponentBase {
	/**
	 * @return {string} the namespace of the component
	 */
	getNamespace() {
		return 'connect';
	}

	/**
	 * @return {*} All the data commands of the components
	 */
	defaultData() {
		return this.importCommands( dataCommands );
	}
}
