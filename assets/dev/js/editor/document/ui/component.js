import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/ui';
	}

	defaultCommands() {
		return {
			copy: ( args ) => ( new commands.Copy( args ) ).run(),
			delete: ( args ) => ( new commands.Delete( args ) ).run(),
			duplicate: ( args ) => ( new commands.Duplicate( args ) ).run(),
			paste: ( args ) => ( new commands.Paste( args ) ).run(),
			'paste-style': ( args ) => ( new commands.PasteStyle( args ) ).run(),
		};
	}

	defaultShortcuts() {
		return {
			copy: {
				keys: 'ctrl+c',
				exclude: [ 'input' ],
			},
			delete: {
				keys: 'del',
				exclude: [ 'input' ],
			},
			duplicate: {
				keys: 'ctrl+d',
			},
			paste: {
				keys: 'ctrl+v',
				exclude: [ 'input' ],
			},
			'paste-style': {
				keys: 'ctrl+shift+v',
				exclude: [ 'input' ],
			},
		};
	}
}
