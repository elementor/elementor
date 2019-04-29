/**
 * start/stop
 * before/after
 * init/destroy
 * load/unload
 * create/
 * begin/end
 * open/close
 * active/inactive
 * component:
 * 	routes
 * 	commands
 */

export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.title = '';

		this.router = new Router( this.getRoutes() );
		this.commander = new Commander( this.getCommands() );

		this.routes = {};
		this.commands = {};
		this.shortcuts = {};
		this.tabs = {};
		this.dependency = {};
		this.isActive = {};

		this.current = false;
		this.currentArgs = false;

		const shortcuts = this.getShortcuts();

		const routes = this.getRoutes();

		_( this.getTabs() ).each( ( tab ) => {
			routes[ tab ] = () => this.activateTab( tab );
		} );

		_( routes ).each( ( route, callback ) => {
			const fullRoute = this.namespace ? this.namespace + '/' + route : route,
				shortcut = shortcuts[ route ] ? shortcuts[ route ] : false;

			elementorCommon.route.register( fullRoute, callback, shortcut );
		} );

		_( this.getCommands() ).each( ( command, callback ) => {
			const fullCommand = this.namespace ? this.namespace + '/' + command : command,
				shortcut = shortcuts[ command ] ? shortcuts[ command ] : false;

			elementorCommon.commands.register( fullCommand, callback, shortcut );
		} );
	}

	getCommands() {
		return {};
	}

	getShortcuts() {
		return {};
	}

	getRoutes() {
		return {};
	}

	getTabs() {
		return {};
	}

	setDefault( route ) {
		this.defaultRoute = route;
	}

	activateTab( tab ) {
	}

	setDependency( callback ) {
		this.dependency = callback;
		return this;
	}

	registerCommand( command, callback, shortcut ) {
		if ( this.commands[ command ] ) {
			this.error( `\`${ command }\` is already registered.` );
		}

		this.commands[ command ] = callback;

		if ( shortcut ) {
			shortcut.command = command;
			shortcut.callback = ( event ) => this.runShortcut( command, event );
			elementorCommon.shortcuts.register( shortcut.keys, shortcut );
		}

		return this;
	}

	unregisterCommand( command ) {
		delete this.commands[ command ];

		return this;
	}

	beforeRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( `\`${ command }\` not found.` );
		}

		if ( this.dependency && ! this.dependency.apply( null, [ args ] ) ) {
			return false;
		}

		this.current = command;
		this.currentArgs = args;

		return true;
	}

	is( command ) {
		return command === this.current;
	}

	getCurrent() {
		return this.current;
	}

	getCurrentArgs() {
		if ( ! this.currentArgs ) {
			return false;
		}

		return this.currentArgs;
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

	afterRun() {
		delete this.current;
		delete this.currentArgs;
	}

	error( message ) {
		throw Error( `Commands: ${ message }` );
	}
}
