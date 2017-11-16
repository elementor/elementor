var HandlerModule = require( 'elementor-frontend/handler-module' );

module.exports = HandlerModule.extend( {
	$activeContent: null,

	getDefaultSettings: function() {
		return {
			selectors: {
				tabTitle: '.elementor-tab-title',
				tabContent: '.elementor-tab-content'
			},
			classes: {
				active: 'elementor-active'
			},
			showTabFn: 'show',
			hideTabFn: 'hide',
			toggleSelf: true,
			hidePrevious: true,
			autoExpand: true
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$tabTitles: this.findElement( selectors.tabTitle ),
			$tabContents: this.findElement( selectors.tabContent )
		};
	},

	activateDefaultTab: function() {
		var settings = this.getSettings();

		if ( ! settings.autoExpand || 'editor' === settings.autoExpand && ! this.isEdit ) {
			return;
		}

		var defaultActiveTab = this.getEditSettings( 'activeItemIndex' ) || 1,
			originalToggleMethods = {
				showTabFn: settings.showTabFn,
				hideTabFn: settings.hideTabFn
			};

		// Toggle tabs without animation to avoid jumping
		this.setSettings( {
			showTabFn: 'show',
			hideTabFn: 'hide'
		} );

		this.changeActiveTab( defaultActiveTab );

		// Return back original toggle effects
		this.setSettings( originalToggleMethods );
	},

	deactivateActiveTab: function( tabIndex ) {
		var settings = this.getSettings(),
			activeClass = settings.classes.active,
			activeFilter = tabIndex ? '[data-tab="' + tabIndex + '"]' : '.' + activeClass,
			$activeTitle = this.elements.$tabTitles.filter( activeFilter ),
			$activeContent = this.elements.$tabContents.filter( activeFilter );

		$activeTitle.add( $activeContent ).removeClass( activeClass );

		$activeContent[ settings.hideTabFn ]();
	},

	activateTab: function( tabIndex ) {
		var settings = this.getSettings(),
			activeClass = settings.classes.active,
			$requestedTitle = this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ),
			$requestedContent = this.elements.$tabContents.filter( '[data-tab="' + tabIndex + '"]' );

		$requestedTitle.add( $requestedContent ).addClass( activeClass );

		$requestedContent[ settings.showTabFn ]();
	},

	isActiveTab: function( tabIndex ) {
		return this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ).hasClass( this.getSettings( 'classes.active' ) );
	},

	bindEvents: function() {
		var self = this;

		self.elements.$tabTitles.on( 'focus', function( event ) {
			self.changeActiveTab( event.currentTarget.dataset.tab );
		} );

		if ( self.getSettings( 'toggleSelf' ) ) {
			self.elements.$tabTitles.on( 'mousedown', function( event ) {
				if ( jQuery( event.currentTarget ).is( ':focus' ) ) {
					self.changeActiveTab( event.currentTarget.dataset.tab );
				}
			} );
		}
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.activateDefaultTab();
	},

	onEditSettingsChange: function( propertyName ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.activateDefaultTab();
		}
	},

	changeActiveTab: function( tabIndex ) {
		var isActiveTab = this.isActiveTab( tabIndex ),
			settings = this.getSettings();

		if ( ( settings.toggleSelf || ! isActiveTab ) && settings.hidePrevious ) {
			this.deactivateActiveTab();
		}

		if ( ! settings.hidePrevious && isActiveTab ) {
			this.deactivateActiveTab( tabIndex );
		}

		if ( ! isActiveTab ) {
			this.activateTab( tabIndex );
		}
	}
} );
