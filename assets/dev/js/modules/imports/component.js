import Module from './module';

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

export default class extends Module {
	constructor( ...args ) {
		super( ...args );

		// this.router = new Router( this.getRoutes() );
		// this.commander = new Commander( this.getCommands() );

		this.tabs = {};
		this.dependency = {};
		this.isActive = {};

		this.current = false;
		this.currentArgs = false;

		this.defaultRoute = '';
	}

	init( args ) {
		if ( ! this.title ) {
			throw Error( 'title is required' );
		}

		if ( ! this.namespace ) {
			throw Error( 'namespace is required' );
		}

		if ( ! args.view ) {
			throw Error( 'view is required' );
		}

		this.view = args.view;

		const shortcuts = this.getShortcuts();

		const routes = this.getRoutes();

		_( this.getTabs() ).each( ( title, tab ) => {
			routes[ tab ] = () => this.activateTab( tab );
		} );

		_( routes ).each( ( callback, route ) => {
			const fullRoute = this.namespace + '/' + route,
				shortcut = shortcuts[ route ] ? shortcuts[ route ] : false;

			const parts = fullRoute.split( '/' ),
				component = parts[ 0 ],
				componentArgs = {};

			if ( this.open ) {
				componentArgs.open = this.open.bind( this );
			}

			elementorCommon.route.registerComponent( component, componentArgs );

			elementorCommon.route.register( fullRoute, callback, shortcut );
		} );

		_( this.getCommands() ).each( ( callback, command ) => {
			const fullCommand = this.namespace ? this.namespace + '/' + command : command,
				shortcut = shortcuts[ command ] ? shortcuts[ command ] : false;

			const parts = fullCommand.split( '/' ),
				component = parts[ 0 ],
				componentArgs = {};

			if ( this.open ) {
				componentArgs.open = this.open;
			}

			elementorCommon.commands.registerComponent( component );

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
		return this.tabs;
	}

	setDefault( route ) {
		this.defaultRoute = route;
	}

	getDefault() {
		return this.defaultRoute;
	}

	removeTab( tab ) {
		delete this.tabs[ tab ];
	}

	addTab( tab, title, position ) {
		this.tabs[ tab ] = title;

		if ( undefined !== typeof position ) {
			const newTabs = {};
			let ids = Object.keys( this.tabs );
			ids = ids.slice( 0, position ).concat( ids.slice( position + 1 ) );

			ids.forEach( () => {
				newTabs[ tab ] = this.tabs[ tab ];
			} );

			this.tabs = newTabs;
		}
	}

	activateTab( tab ) {
		this.view.currentPageView.activateTab( tab )._renderChildren();
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
