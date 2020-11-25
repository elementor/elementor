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

	handleKeyboardArrows( event ) {
		const key = event.keyCode,
			tab = event.currentTarget,
			keys = this.getSettings( 'keys' ),
			isHorizontalKey = key === keys.left || key === keys.right,
			isVerticalKey = key === keys.up || key === keys.down,
			isHomeEndKey = key === keys.home || key === keys.end,
			tablist = tab.closest( this.getSettings( 'selectors' ).tablist ),
			isVertical = 'vertical' === tablist.getAttribute( 'aria-orientation' );

		if ( ( isVerticalKey && isVertical ) || ( isHorizontalKey && ! isVertical ) || isHomeEndKey ) {
			if ( isVerticalKey || isHomeEndKey ) {
				event.preventDefault();
			}

			this.switchTabOnKeyPress( key, tab, tablist );
		}
	}

	switchTabOnKeyPress( keyPressed, currentTab, tablist ) {
		const direction = this.getSettings( 'keyDirection' )[ keyPressed ],
			tabIndex = currentTab.getAttribute( 'data-tab' ) - 1,
			isHomeKey = this.getSettings( 'keys' ).home === keyPressed,
			isEndKey = this.getSettings( 'keys' ).end === keyPressed;

		if ( ( ! direction || 'number' !== typeof tabIndex ) && ! isHomeKey && ! isEndKey ) {
			return;
		}

		const $tabs = jQuery( tablist ).find( this.getSettings( 'selectors' ).tabTitle ),
			nextTab = $tabs[ tabIndex + direction ];

		if ( nextTab ) {
			nextTab.focus();
		} else if ( isEndKey || -1 === tabIndex + direction ) {
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
		this.elements.$tabTitles.on( {
			keydown: ( event ) => {
				const key = event.keyCode,
					keys = this.getSettings( 'keys' );

				switch ( key ) {
					case keys.end:
					case keys.home:
					// Up and down are in keydown
					// because we need to prevent page scroll >:)
					case keys.up:
					case keys.down:
						this.handleKeyboardArrows( event );
						break;
				}
			},
			keyup: ( event ) => {
				const key = event.keyCode,
					keys = this.getSettings( 'keys' );

				switch ( key ) {
					case keys.left:
					case keys.right:
						this.handleKeyboardArrows( event );
						break;
					case keys.enter:
					case keys.space:
						event.preventDefault();
						this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ) );
						break;
				}
			},
			click: ( event ) => {
				event.preventDefault();
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
