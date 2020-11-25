export default class baseTabs extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				tablist: '[role="tablist"]',
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
			keys: {
				end: 35,
				home: 36,
				left: 37,
				up: 38,
				right: 39,
				down: 40,
				enter: 13,
				space: 32,
			},
			keyDirection: {
				37: elementorFrontendConfig.is_rtl ? 1 : -1,
				38: -1,
				39: elementorFrontendConfig.is_rtl ? -1 : 1,
				40: 1,
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$tabTitles: this.findElement( selectors.tabTitle ),
			$tabContents: this.findElement( selectors.tabContent ),
		};
	}

	activateDefaultTab() {
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
	}

	handleKeyboardNavigation( event ) {
		const key = event.keyCode,
			tab = event.currentTarget,
			keys = this.getSettings( 'keys' ),
			$tabList = jQuery( tab.closest( this.getSettings( 'selectors' ).tablist ) ),
			$tabs = $tabList.find( this.getSettings( 'selectors' ).tabTitle ),
			isVertical = 'vertical' === $tabList.attr( 'aria-orientation' );

		switch ( key ) {
			case keys.left:
			case keys.right:
				if ( isVertical ) {
					return;
				}
				break;
			case keys.up:
			case keys.down:
				if ( ! isVertical ) {
					return;
				}
				event.preventDefault();
				break;
			case keys.home:
				event.preventDefault();
				$tabs.first().focus();
				return;
			case keys.end:
				event.preventDefault();
				$tabs.last().focus();
				return;
			default:
				return;
		}

		const tabIndex = tab.getAttribute( 'data-tab' ) - 1,
			direction = this.getSettings( 'keyDirection' )[ key ],
			nextTab = $tabs[ tabIndex + direction ];

		if ( nextTab ) {
			nextTab.focus();
		} else if ( -1 === tabIndex + direction ) {
			$tabs.last().focus();
		} else {
			$tabs.first().focus();
		}
	}

	deactivateActiveTab( tabIndex ) {
		const settings = this.getSettings(),
			activeClass = settings.classes.active,
			activeFilter = tabIndex ? '[data-tab="' + tabIndex + '"]' : '.' + activeClass,
			$activeTitle = this.elements.$tabTitles.filter( activeFilter ),
			$activeContent = this.elements.$tabContents.filter( activeFilter );

		$activeTitle.add( $activeContent ).removeClass( activeClass );
		$activeTitle.attr( {
			tabindex: '-1',
			'aria-selected': 'false',
		} );

		$activeContent[ settings.hideTabFn ]();
		$activeContent.attr( 'hidden', 'hidden' );
	}

	activateTab( tabIndex ) {
		const settings = this.getSettings(),
			activeClass = settings.classes.active,
			$requestedTitle = this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ),
			$requestedContent = this.elements.$tabContents.filter( '[data-tab="' + tabIndex + '"]' ),
			animationDuration = 'show' === settings.showTabFn ? 0 : 400;

		$requestedTitle.add( $requestedContent ).addClass( activeClass );
		$requestedTitle.attr( {
			tabindex: '0',
			'aria-selected': 'true',
		} );

		$requestedContent[ settings.showTabFn ]( animationDuration, () => elementorFrontend.elements.$window.trigger( 'resize' ) );
		$requestedContent.removeAttr( 'hidden' );
	}

	isActiveTab( tabIndex ) {
		return this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ).hasClass( this.getSettings( 'classes.active' ) );
	}

	bindEvents() {
		const keys = this.getSettings( 'keys' );

		this.elements.$tabTitles.on( {
			keydown: ( event ) => {
				const key = event.keyCode;

				if ( [ keys.end, keys.home, keys.up, keys.down ].includes( key ) ) {
					this.handleKeyboardNavigation( event );
				}
			},
			keyup: ( event ) => {
				switch ( event.keyCode ) {
					case keys.left:
					case keys.right:
						this.handleKeyboardNavigation( event );
						break;
					case keys.enter:
					case keys.space:
						event.preventDefault();
						this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ) );
						break;
				}
			},
			click: ( event ) => {
				this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ) );
			},
		} );
	}

	onInit( ...args ) {
		super.onInit( ...args );

		this.activateDefaultTab();
	}

	onEditSettingsChange( propertyName ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.activateDefaultTab();
		}
	}

	changeActiveTab( tabIndex ) {
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
	}
}
