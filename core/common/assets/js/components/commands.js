export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.currentArgs = {};
		this.commands = {};
		this.components = {};
	}

	getAll() {
		return Object.keys( this.commands ).sort();
	}

	register( component, command, callback ) {
		let namespace;
		if ( 'string' === typeof component ) {
			namespace = component;
			component = $e.components.get( namespace );

			if ( ! component ) {
				this.error( `'${ namespace }' component is not exist.` );
			}
		} else {
			namespace = component.getNamespace();
		}

		const fullCommand = namespace + ( command ? '/' + command : '' );

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
			$e.shortcuts.register( shortcut.keys, shortcut );
		}

		return this;
	}

	getComponent( command ) {
		const namespace = this.components[ command ];

		return $e.components.get( namespace );
	}

	is( command ) {
		const component = this.getComponent( command );

		if ( ! component ) {
			return false;
		}

		return command === this.current[ component.getRootContainer() ];
	}

	getCurrent( container = '' ) {
		if ( container ) {
			if ( ! this.current[ container ] ) {
				return false;
			}

			return this.current[ container ];
		}

		return this.current;
	}

	getCurrentArgs( container = '' ) {
		if ( container ) {
			if ( ! this.currentArgs[ container ] ) {
				return false;
			}

			return this.currentArgs[ container ];
		}

		return this.currentArgs;
	}

	beforeRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( `\`${ command }\` not found.` );
		}

		if ( ! this.getComponent( command ).dependency( args ) ) {
			return false;
		}

		return true;
	}

	run( command, args = {} ) {
		if ( ! this.beforeRun( command, args ) ) {
			return false;
		}

		const component = this.getComponent( command ),
			container = component.getRootContainer();

		this.current[ container ] = command;
		this.currentArgs[ container ] = args;

		if ( args.onBefore ) {
			args.onBefore.apply( component, [ args ] );
		}

		this.commands[ command ].apply( component, [ args ] );

		if ( args.onAfter ) {
			args.onAfter.apply( component, [ args ] );
		}

		this.afterRun( command, args );

		return true;
	}

	// It's separated in order to allow override.
	runShortcut( command, event ) {
		this.run( command, event );
	}

	afterRun( command ) {
		const component = this.getComponent( command ),
			container = component.getRootContainer();

		delete this.current[ container ];
		delete this.currentArgs[ container ];
	}

	error( message ) {
		throw Error( `Commands: ${ message }` );
	}
}
