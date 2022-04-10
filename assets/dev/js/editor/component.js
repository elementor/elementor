import Documents from './components/documents/component';
import BrowserImport from './components/browser-import/manager';

import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'editor';
	}

	registerAPI() {
		super.registerAPI();

		elementor.browserImport = new BrowserImport();
		elementor.documents = $e.components.register( new Documents() );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
