import * as commands from './commands';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'editor/browser-import';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
