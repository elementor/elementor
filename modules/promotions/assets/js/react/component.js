import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'e-promotion';
	}
	//
	// static getEndpointFormat() {
	// 	return 'checklist';
	// }

	defaultCommands() {
		return this.importCommands( commands );
	}

	// defaultData() {
	// 	return this.importCommands( commandsData );
	// }
}
