import * as Commands from './commands/';

export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		const commands = {};

		// Convert `Commands` to `elementorModules.common.Component` workable format.
		Object.entries( Commands ).forEach( ( [ command, classReference ] ) => {
			command = this.normalizeCommand( command );
			commands[ command ] = ( args ) => ( new classReference( args ) ).run();
		} );

		return commands;
	}

	normalizeCommand( command ) {
		let temp = '';

		// First character should be lowercase.
		command = command.charAt( 0 ).toLowerCase() + command.slice( 1 );

		/**
		 * If command includes uppercase character convert it to lowercase and add `-`.
		 * eg: by if, calling command name is `CopyAll` it will be `copy-all`.
		 */
		for ( let i = 0; i < command.length; i++ ) {
			const part = command[ i ];
			if ( part === part.toUpperCase() ) {
				temp += '-' + part.toLowerCase();
				continue;
			}

			temp += command[ i ];
		}

		return temp;
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
