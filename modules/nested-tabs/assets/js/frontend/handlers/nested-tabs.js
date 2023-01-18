import Base from '../../../../../../assets/dev/js/frontend/handlers/base';

export default class NestedTabs extends Base {
	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabTitleFilterSelector( tabIndex ) {
		return `[data-tab="${ tabIndex }"]`;
	}

	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-con` should have 'e-collapse'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	/**
	 * @param {HTMLElement} tabTitleElement
	 *
	 * @return {string}
	 */
	getTabIndex( tabTitleElement ) {
		return tabTitleElement.getAttribute( 'data-tab' );
	}

	getDefaultSettings() {
		return {
			selectors: {
				tablist: '[role="tablist"]',
				tabTitle: '.e-n-tab-title',
				tabContent: '.e-con',
				headingContainer: '.e-n-tabs-heading',
			},
			classes: {
				active: 'e-active',
			},
			showTabFn: 'show',
			hideTabFn: 'hide',
			toggleSelf: false,
			hidePrevious: true,
			autoExpand: true,
			keyDirection: {
				ArrowLeft: elementorFrontendConfig.is_rtl ? 1 : -1,
				ArrowUp: -1,
				ArrowRight: elementorFrontendConfig.is_rtl ? -1 : 1,
				ArrowDown: 1,
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
		const tab = event.currentTarget,
			$tabList = jQuery( tab.closest( this.getSettings( 'selectors' ).tablist ) ),
			// eslint-disable-next-line @wordpress/no-unused-vars-before-return
			$tabs = $tabList.find( this.getSettings( 'selectors' ).tabTitle ),
			isVertical = 'vertical' === $tabList.attr( 'aria-orientation' );

		switch ( event.key ) {
			case 'ArrowLeft':
			case 'ArrowRight':
				if ( isVertical ) {
					return;
				}
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				if ( ! isVertical ) {
					return;
				}
				event.preventDefault();
				break;
			case 'Home':
				event.preventDefault();
				$tabs.first().trigger( 'focus' );
				return;
			case 'End':
				event.preventDefault();
				$tabs.last().trigger( 'focus' );
				return;
			default:
				return;
		}

		const tabIndex = tab.getAttribute( 'data-tab' ) - 1,
			direction = this.getSettings( 'keyDirection' )[ event.key ],
			nextTab = $tabs[ tabIndex + direction ];

		if ( nextTab ) {
			nextTab.focus();
		} else if ( -1 === tabIndex + direction ) {
			$tabs.last().trigger( 'focus' );
		} else {
			$tabs.first().trigger( 'focus' );
		}
	}

	deactivateActiveTab( tabIndex ) {
		const settings = this.getSettings(),
			activeClass = settings.classes.active,
			activeTitleFilter = tabIndex ? this.getTabTitleFilterSelector( tabIndex ) : '.' + activeClass,
			activeContentFilter = tabIndex ? this.getTabContentFilterSelector( tabIndex ) : '.' + activeClass,
			$activeTitle = this.elements.$tabTitles.filter( activeTitleFilter ),
			$activeContent = this.elements.$tabContents.filter( activeContentFilter );

		$activeTitle.add( $activeContent ).removeClass( activeClass );
		$activeTitle.attr( {
			tabindex: '-1',
			'aria-selected': 'false',
			'aria-expanded': 'false',
		} );

		$activeContent[ settings.hideTabFn ]();
		$activeContent.attr( 'hidden', 'hidden' );
	}

	activateTab( tabIndex ) {
		const settings = this.getSettings(),
			activeClass = settings.classes.active,
			animationDuration = 'show' === settings.showTabFn ? 0 : 400;

		let $requestedTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( tabIndex ) ),
			$requestedContent = this.elements.$tabContents.filter( this.getTabContentFilterSelector( tabIndex ) );

		// Check if the tabIndex exists.
		if ( ! $requestedTitle.length ) {
			// Activate the previous tab and ensure that the tab index is not less than 1.
			const previousTabIndex = Math.max( ( tabIndex - 1 ), 1 );

			$requestedTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( previousTabIndex ) );
			$requestedContent = this.elements.$tabContents.filter( this.getTabContentFilterSelector( previousTabIndex ) );
		}

		$requestedTitle.add( $requestedContent ).addClass( activeClass );
		$requestedTitle.attr( {
			tabindex: '0',
			'aria-selected': 'true',
			'aria-expanded': 'true',
		} );

		$requestedContent[ settings.showTabFn ](
			animationDuration,
			() => {
				elementorFrontend.elements.$window.trigger( 'elementor-pro/motion-fx/recalc' );
				elementorFrontend.elements.$window.trigger( 'elementor/nested-tabs/activate', $requestedContent );
			},
		);
		$requestedContent.removeAttr( 'hidden' );
	}

	isActiveTab( tabIndex ) {
		return this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ).hasClass( this.getSettings( 'classes.active' ) );
	}

	onTabClick( event ) {
		event.preventDefault();
		this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ), true );
	}

	onTabKeyDown( event ) {
		// Support for old markup that includes an `<a>` tag in the tab
		if ( jQuery( event.target ).is( 'a' ) && `Enter` === event.key ) {
			event.preventDefault();
		}

		// We listen to keydowon event for these keys in order to prevent undesired page scrolling
		if ( [ 'End', 'Home', 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
			this.handleKeyboardNavigation( event );
		}
	}

	onTabKeyUp( event ) {
		switch ( event.code ) {
			case 'ArrowLeft':
			case 'ArrowRight':
				this.handleKeyboardNavigation( event );
				break;
			case 'Enter':
			case 'Space':
				event.preventDefault();
				this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ), true );
				break;
		}
	}

	getTabEvents() {
		return {
			keydown: this.onTabKeyDown.bind( this ),
			keyup: this.onTabKeyUp.bind( this ),
			click: this.onTabClick.bind( this ),
		};
	}

	bindEvents() {
		this.elements.$tabTitles.on( this.getTabEvents() );
		elementorFrontend.elements.$window.on( 'elementor/nested-tabs/activate', this.reInitSwipers );
	}

	/**
	 * Fixes issues where Swipers that have been initialized while a tab is not visible are not properly rendered
	 * and when switching to the tab the swiper will not respect any of the chosen `autoplay` related settings.
	 *
	 * This is triggered when switching to a nested tab, looks for Swipers in the tab content and reinitializes them.
	 *
	 * @param {Object} event   - Incoming event.
	 * @param {Object} content - Active nested tab dom element.
	 */
	reInitSwipers( event, content ) {
		const swiperElements = content.querySelectorAll( `.${ elementorFrontend.config.swiperClass }` );
		for ( const element of swiperElements ) {
			if ( ! element.swiper ) {
				return;
			}
			element.swiper.initialized = false;
			element.swiper.init();
		}
	}

	onInit( ...args ) {
		this.createMobileTabs( args );

		super.onInit( ...args );

		if ( this.getSettings( 'autoExpand' ) ) {
			this.activateDefaultTab();
		}
	}

	onEditSettingsChange( propertyName, value ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.changeActiveTab( value, false );
		}
	}

	/**
	 * @param {string}  tabIndex
	 * @param {boolean} fromUser - Whether the call is caused by the user or internal.
	 */
	changeActiveTab( tabIndex, fromUser = false ) {
		// `document/repeater/select` is used only in edit mod, and only when its not internal call,
		// in other words only in editor and when user triggered the change.
		if ( fromUser && this.isEdit ) {
			return window.top.$e.run( 'document/repeater/select', {
				container: elementor.getContainer( this.$element.attr( 'data-id' ) ),
				index: parseInt( tabIndex ),
			} );
		}

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

	createMobileTabs( args ) {
		const settings = this.getSettings();
		if ( elementorFrontend.isEditMode() ) {
			const $widget = this.$element,
				$removed = this.findElement( '.e-collapse' ).remove();

			let index = 1;

			this.findElement( '.e-con' ).each( function() {
				const $current = jQuery( this ),
					$desktopTabTitle = $widget.find( `${ settings.selectors.headingContainer } > *:nth-child(${ index })` ),
					mobileTitleHTML = `<div class="${ settings.selectors.tabTitle.replace( '.', '' ) } e-collapse" data-tab="${ index }" role="tab">${ $desktopTabTitle.html() }</div>`;

				$current.before( mobileTitleHTML );

				++index;
			} );

			// On refresh since indexes are rearranged, do not call `activateDefaultTab` let editor control handle it.
			if ( $removed.length ) {
				return elementorModules.ViewModule.prototype.onInit.apply( this, args );
			}
		}
	}
}
