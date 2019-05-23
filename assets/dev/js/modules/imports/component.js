import Module from './module';

export default class extends Module {
	__construct( args ) {
		if ( ! args.context ) {
			throw Error( 'context is required' );
		}

		this.context = args.context;
		this.tabs = {};
		this.isActive = {};
		this.defaultRoute = '';
	}

	onInit() {
		jQuery.each( this.getTabs(), ( tab ) => this.registerTabRoute( tab ) );

		jQuery.each( this.getRoutes(), ( route, callback ) => this.registerRoute( route, callback ) );

		jQuery.each( this.getCommands(), ( command, callback ) => this.registerCommand( command, callback ) );
	}

	getNamespace() {
		throw Error( 'getNamespace must be override is required' );
	}

	registerCommand( command, callback ) {
		elementorCommon.commands.register( this, command, callback );
	}

	registerRoute( route, callback ) {
		elementorCommon.route.register( this, route, callback );
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
		this.registerRoute( tab, () => this.activateTab( tab ) );
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
		this.defaultRoute = this.getNamespace() + '/' + route;
	}

	getDefault() {
		return this.defaultRoute;
	}

	removeTab( tab ) {
		delete this.tabs[ tab ];
	}

	addTab( tab, args, position ) {
		this.tabs[ tab ] = args;
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
		return this.getNamespace() + '/' + tab;
	}

	renderTab( tab ) {} // eslint-disable-line

	activateTab( tab ) {
		this.renderTab( tab );

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
