export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.currentArgs = {};
		this.commands = {};
		this.dependencies = {};
		this.containers = {};
		this.components = {};
	}

	printAll() {
		console.log( Object.keys( this.commands ).sort() ); // eslint-disable-line no-console
	}

	registerContainer( container, args = {} ) {
		this.containers[ container ] = args;

		if ( args.before ) {
			this.registerDependency( container, args.before );
		}

		return this;
	}

	registerDependency( container, callback ) {
		this.dependencies[ container ] = callback;

		return this;
	}

	register( component, command, callback, shortcut ) {
		const parts = command.split( '/' ),
			container = parts[ 0 ];

		if ( ! elementorCommon.components.get( component ) ) {
			this.error( `'${ component }' component is not exist.` );
		}
		if ( ! this.containers[ container ] ) {
			this.error( `'${ container }' container is not exist.` );
		}

		if ( this.commands[ command ] ) {
			this.error( `\`${ command }\` is already registered.` );
		}

		this.commands[ command ] = callback;
		this.components[ command ] = component;

		if ( shortcut ) {
			shortcut.command = command;
			shortcut.callback = ( event ) => this.runShortcut( command, event );
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

		const parts = command.split( '/' ),
			container = parts[ 0 ];

		if ( this.dependencies[ container ] && ! this.dependencies[ container ].apply( null, [ args ] ) ) {
			return false;
		}

		this.current[ container ] = command;
		this.currentArgs[ container ] = args;

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
