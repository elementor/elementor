export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.currentArgs = {};
		this.commands = {};
		this.dependencies = {};
		this.shortcuts = {};
	}

	registerDependency( component, callback ) {
		this.dependencies[ component ] = callback;
	}

	register( command, callback, shortcut ) {
		if ( this.commands[ command ] ) {
			this.error( '`' + command + '` is already registered.' );
		}

		this.commands[ command ] = callback;

		if ( shortcut ) {
			// Can be an object with args or simple 'ctrl+v'.
			if ( ! shortcut.keys ) {
				shortcut = {
					keys: shortcut,
				};
			}

			shortcut.callback = ( event ) => this.run( command, event );
			elementorCommon.shortcuts.register( shortcut.keys, shortcut );
		}

		return this;
	}

	unregister( command ) {
		delete this.commands[ command ];
	}

	is( command ) {
		const parts = command.split( '/' ),
			component = parts[ 0 ];

		return command === this.current[ component ];
	}

	getCurrent( component ) {
		if ( ! this.current[ component ] ) {
			return false;
		}

		return this.current[ component ];
	}

	getCurrentArgs( component ) {
		if ( ! this.currentArgs[ component ] ) {
			return false;
		}

		return this.currentArgs[ component ];
	}

	beforeRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( '`' + command + '` not found.' );
		}

		const parts = command.split( '/' ),
			component = parts[ 0 ];

		if ( this.dependencies[ component ] && ! this.dependencies[ component ].apply( null, [ args ] ) ) {
			return false;
		}

		this.current[ component ] = command;
		this.currentArgs[ component ] = args;

		return true;
	}

	run( command, args = {} ) {
		if ( ! this.beforeRun( command, args ) ) {
			return;
		}

		if ( args.onBefore ) {
			args.onBefore.apply( this, [ args ] );
		}

		this.commands[ command ].apply( this, [ args ] );

		if ( args.onAfter ) {
			args.onAfter.apply( this, [ args ] );
		}

		this.afterRun( command, args );
	}

	afterRun( command ) {
		const parts = command.split( '/' ),
			component = parts[ 0 ];

		delete this.current[ component ];
		delete this.currentArgs[ component ];
	}

	error( message ) {
		throw Error( 'Commands: ' + message );
	}
}
