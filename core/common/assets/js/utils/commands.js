export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.currentArgs = {};
		this.commands = {};
		this.components = {};
	}

	printAll() {
		console.log( Object.keys( this.commands ).sort() ); // eslint-disable-line no-console
	}

	register( namespace, command, callback ) {
		const component = elementorCommon.components.get( namespace );
		if ( ! component ) {
			this.error( `'${ namespace }' component is not exist.` );
		}

		const fullCommand = component.namespace + ( command ? '/' + command : '' );

		if ( this.commands[ fullCommand ] ) {
			this.error( `\`${ fullCommand }\` is already registered.` );
		}

		this.commands[ fullCommand ] = callback;
		this.components[ fullCommand ] = namespace;

		const shortcuts = component.getShortcuts(),
			shortcut = shortcuts[ command ];

		if ( shortcut ) {
			shortcut.command = fullCommand;
			shortcut.callback = ( event ) => this.runShortcut( fullCommand, event );
			elementorCommon.shortcuts.register( shortcut.keys, shortcut );
		}

		return this;
	}

	unregister( command ) {
		delete this.commands[ command ];

		return this;
	}

	getComponent( command ) {
		const componentName = this.components[ command ];

		return elementorCommon.components.get( componentName );
	}

	is( command ) {
		const parts = command.split( '/' ),
			container = parts[ 0 ];

		return command === this.current[ container ];
	}

	getCurrent( container ) {
		if ( ! this.current[ container ] ) {
			return false;
		}

		return this.current[ container ];
	}

	getCurrentArgs( container ) {
		if ( ! this.currentArgs[ container ] ) {
			return false;
		}

		return this.currentArgs[ container ];
	}

	beforeRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( `\`${ command }\` not found.` );
		}

		if ( ! this.getComponent( command ).dependency( args ) ) {
			return false;
		}

		const parts = command.split( '/' ),
			container = parts[ 0 ];

		this.current[ container ] = command;
		this.currentArgs[ container ] = args;

		return true;
	}

	run( command, args = {} ) {
		if ( ! this.beforeRun( command, args ) ) {
			return;
		}

		if ( args.onBefore ) {
			args.onBefore.apply( undefined, [ args ] );
		}

		this.commands[ command ].apply( this, [ args ] );

		if ( args.onAfter ) {
			args.onAfter.apply( undefined, [ args ] );
		}

		this.afterRun( command, args );
	}

	runShortcut( command, event ) {
		this.run( command, event );
	}

	afterRun( command ) {
		const parts = command.split( '/' ),
			container = parts[ 0 ];

		delete this.current[ container ];
		delete this.currentArgs[ container ];
	}

	error( message ) {
		throw Error( `Commands: ${ message }` );
	}
}
