import Module from './module';

export default class extends Module {
	constructor( ...args ) {
		super( ...args );

		this.tabs = {};
		this.isActive = {};
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

		jQuery.each( this.getTabs(), ( tab ) => this.registerTabRoute( tab ) );

		jQuery.each( this.getRoutes(), ( route, callback ) => this.registerRoute( route, callback ) );

		jQuery.each( this.getCommands(), ( command, callback ) => this.registerCommand( command, callback ) );
	}

	registerCommand( command, callback ) {
		elementorCommon.commands.register( this.namespace, command, callback );
	}

	registerRoute( route, callback ) {
		elementorCommon.route.register( this.namespace, route, callback );
	}

	dependency() {
		return true;
	}

	open() {
		return true;
	}

	close() {}

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
		// It can be 0.
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
}
