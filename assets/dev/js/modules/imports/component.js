import Module from './module';

export default class extends Module {
	__construct( args ) {
		if ( ! args || ! args.context ) {
			throw Error( 'context is required' );
		}

		this.context = args.context;
		this.tabs = {};
		this.isActive = {};
		this.isModal = false;
		this.defaultRoute = '';
		this.currentTab = '';
	}

	onInit() {
		jQuery.each( this.getTabs(), ( tab ) => this.registerTabRoute( tab ) );

		jQuery.each( this.getRoutes(), ( route, callback ) => this.registerRoute( route, callback ) );

		jQuery.each( this.getCommands(), ( command, callback ) => this.registerCommand( command, callback ) );

		if ( this.isModal ) {
			elementorCommon.shortcuts.register( 'esc', {
				scopes: [ this.getNamespace() ],
				callback: () => this.close(),
			} );
		}
	}

	getNamespace() {
		throw Error( 'getNamespace must be override.' );
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

	registerCommand( command, callback ) {
		elementorCommon.commands.register( this, command, callback );
	}

	registerRoute( route, callback ) {
		elementorCommon.route.register( this, route, callback );
	}

	registerTabRoute( tab ) {
		this.registerRoute( tab, () => this.activateTab( tab ) );
	}

	dependency() {
		return true;
	}

	open() {
		return true;
	}

	close() {
		if ( ! this.isOpen ) {
			return false;
		}

		this.isOpen = false;

		this.inactivate();

		elementorCommon.route.clearCurrent( this.getNamespace() );

		return true;
	}

	activate() {
		elementorCommon.components.activate( this.getNamespace() );
	}

	inactivate() {
		elementorCommon.components.inactivate( this.getNamespace() );
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
			const ids = Object.keys( this.tabs );
			// Remove new tab
			ids.pop();

			// Add it to position.
			ids.splice( position, 0, tab );

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
		this.currentTab = tab;
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
