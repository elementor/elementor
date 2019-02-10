module.exports = elementorModules.frontend.handlers.Base.extend( {
	$activeContent: null,

	getDefaultSettings: function() {
		return {
			selectors: {
				tabTitle: '.elementor-tab-title',
				tabContent: '.elementor-tab-content',
			},
			classes: {
				active: 'elementor-active',
			},
			showTabFn: 'show',
			hideTabFn: 'hide',
			toggleSelf: true,
			hidePrevious: true,
			autoExpand: true,
		};
	},

	getDefaultElements: function() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$tabTitles: this.findElement( selectors.tabTitle ),
			$tabContents: this.findElement( selectors.tabContent ),
		};
	},

	activateDefaultTab: function() {
		const settings = this.getSettings();

		if ( ! settings.autoExpand || ( 'editor' === settings.autoExpand && ! this.isEdit ) ) {
			return;
		}

		const defaultActiveTab = this.getEditSettings( 'activeItemIndex' ) || 1,
			originalToggleMethods = {
				showTabFn: settings.showTabFn,
				hideTabFn: settings.hideTabFn,
			};

		// Toggle tabs without animation to avoid jumping
		this.setSettings( {
			showTabFn: 'show',
			hideTabFn: 'hide',
		} );

		this.changeActiveTab( defaultActiveTab );

		// Return back original toggle effects
		this.setSettings( originalToggleMethods );
	},

	deactivateActiveTab: function( tabIndex ) {
		const settings = this.getSettings(),
			activeClass = settings.classes.active,
			activeFilter = tabIndex ? '[data-tab="' + tabIndex + '"]' : '.' + activeClass,
			$activeTitle = this.elements.$tabTitles.filter( activeFilter ),
			$activeContent = this.elements.$tabContents.filter( activeFilter );

		$activeTitle.add( $activeContent ).removeClass( activeClass );

		$activeContent[ settings.hideTabFn ]();
	},

	activateTab: function( tabIndex ) {
		const settings = this.getSettings(),
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
		this.elements.$tabTitles.on( {
			keydown: ( event ) => {
				if ( 'Enter' === event.key ) {
					event.preventDefault();

					this.changeActiveTab( event.currentTarget.dataset.tab );
				}
			},
			click: ( event ) => {
				event.preventDefault();

				this.changeActiveTab( event.currentTarget.dataset.tab );
			},
		} );
	},

	onInit: function() {
		elementorModules.frontend.handlers.Base.prototype.onInit.apply( this, arguments );

		this.activateDefaultTab();
	},

	onEditSettingsChange: function( propertyName ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.activateDefaultTab();
		}
	},

	changeActiveTab: function( tabIndex ) {
		const isActiveTab = this.isActiveTab( tabIndex ),
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
	},
} );
