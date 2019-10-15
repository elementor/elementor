import * as Commands from './commands/';
import * as Hooks from './hooks/';

export default class extends elementorModules.common.Component {

	onInit() {
		super.onInit();

		// Load hooks.
		Object.entries( Hooks ).forEach( ( [ hook, hookReference ] ) =>
			new hookReference()
		);
	}

	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		const commands = {};

		// Convert `Commands` to `elementorModules.common.Component` workable format.
		Object.entries( Commands ).forEach( ( [ command, classReference ] ) => {
			command = command.charAt( 0 ).toLowerCase() + command.slice( 1 );

			commands[ command ] = ( args ) => ( new classReference( args ) ).run();
		} );

		return commands;
	}

	defaultShortcuts() {
		return {
			copy: {
				keys: 'ctrl+c',
				exclude: [ 'input' ],
			},
			duplicate: {
				keys: 'ctrl+d',
			},
			delete: {
				keys: 'del',
				exclude: [ 'input' ],
			},
			paste: {
				keys: 'ctrl+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().isPasteEnabled();
				},
			},
			pasteStyle: {
				keys: 'ctrl+shift+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'clipboard' );
				},
			},
		};
	}
}
