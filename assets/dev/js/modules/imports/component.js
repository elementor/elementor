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

		if ( ! args.parent ) {
			throw Error( 'parent is required' );
		}

		this.parent = args.parent;

		this.tabRenderer = args.tabRenderer;

		const shortcuts = this.getShortcuts();

		const routes = this.getRoutes();

		_( this.getTabs() ).each( ( title, tab ) => this.registerTabRoute( tab ) );

		_( routes ).each( ( callback, route ) => this.registerRoute( route, callback ) );

		_( this.getCommands() ).each( ( callback, command ) => {
			const fullCommand = this.namespace ? this.namespace + '/' + command : command,
				shortcut = shortcuts[ command ] ? shortcuts[ command ] : false;

			const parts = fullCommand.split( '/' ),
				container = parts[ 0 ];

			elementorCommon.commands.registerContainer( container );

			elementorCommon.commands.register( this.namespace, fullCommand, callback, shortcut );
		} );
	}

	registerRoute( route, callback ) {
		const shortcuts = this.getShortcuts();

		const fullRoute = this.namespace + ( route ? '/' + route : '' ),
			shortcut = shortcuts[ route ] ? shortcuts[ route ] : false;

		const parts = fullRoute.split( '/' ),
			container = parts[ 0 ],
			containerArgs = {};

		if ( this.open ) {
			containerArgs.open = this.open.bind( this );
		}

		if ( this.close ) {
			containerArgs.close = this.close.bind( this );
		}

		elementorCommon.route.registerContainer( container, containerArgs );

		elementorCommon.route.register( this.namespace, fullRoute, callback, shortcut );
	}

	onRoute() {
		this.isActive = true;
		this.toggleUIIndicator( true );
	}

	onCloseRoute() {
		this.isActive = false;
		this.toggleUIIndicator( false );
	}

	toggleUIIndicator( value ) {
		if ( this.getUIIndicator ) {
			jQuery( this.getUIIndicator() ).toggleClass( 'elementor-open', value );
		}
	}

	registerTabRoute( tab ) {
		this.registerRoute( tab, ( routeArgs ) => this.activateTab( tab, routeArgs ) );
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
		this.defaultRoute = this.namespace + '/' + route;
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
			ids = ids.slice( 0, position ).concat( [ tab ] ).concat( ids.slice( position, -1 /* remove new tab */ ) );

			ids.forEach( ( id ) => {
				newTabs[ id ] = this.tabs[ id ];
			} );

			this.tabs = newTabs;
		}

		this.registerTabRoute( tab );
	}

	getTabsWrapperSelector() {
		return '';
	}

	getTabRoute( tab ) {
		return this.namespace + '/' + tab;
	}

	activateTab( tab, routeArgs ) {
		if ( this.tabRenderer ) {
			this.tabRenderer.apply( this, [ tab, routeArgs ] );
		}

		jQuery( this.getTabsWrapperSelector() + ' .elementor-component-tab' )
			.off( 'click' )
			.on( 'click', ( event ) => {
				elementorCommon.route.to( this.getTabRoute( event.currentTarget.dataset.tab ) );
			} )
			.removeClass( 'elementor-active' )
			.filter( '[data-tab="' + tab + '"]' )
			.addClass( 'elementor-active' );
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
