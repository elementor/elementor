import Base from 'elementor-frontend/handlers/base';
import {
	changeScrollStatus,
	setHorizontalScrollAlignment,
	setHorizontalTitleScrollValues,
} from 'elementor-frontend-utils/flex-horizontal-scroll';

export default class NestedTabsHtml extends Base {
	constructor( ...args ) {
		super( ...args );

		this.resizeListenerNestedTabs = null;
	}

	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabTitleFilterSelector( tabIndex ) {
		return `[data-tab-index="${ tabIndex }"]`;
	}

	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabContentFilterSelector( tabIndex ) {
		return `*:nth-child(${ tabIndex })`;
	}

	/**
	 * @param {HTMLElement} tabTitleElement
	 *
	 * @return {string}
	 */
	getTabIndex( tabTitleElement ) {
		return tabTitleElement.getAttribute( 'data-tab-index' );
	}

	getDefaultSettings() {
		return {
			selectors: {
				widgetContainer: '.e-n-tabs',
				tabTitle: '.e-n-tab-title',
				tabContent: '.e-n-tabs-content > .e-con',
				headingContainer: '.e-n-tabs-heading',
				activeTabContentContainers: '.e-con.e-active',
			},
			classes: {
				active: 'e-active',
			},
			ariaAttributes: {
				titleStateAttribute: 'aria-selected',
				activeTitleSelector: '[aria-selected="true"]',
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
			$headingContainer: this.findElement( selectors.headingContainer ),
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
			$widgetContainer = jQuery( tab.closest( this.getSettings( 'selectors' ).widgetContainer ) ),
			// eslint-disable-next-line @wordpress/no-unused-vars-before-return
			$tabs = $widgetContainer.find( this.getSettings( 'selectors' ).tabTitle ),
			isVertical = 'vertical' === $widgetContainer.attr( 'aria-orientation' );

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

		const tabIndex = tab.getAttribute( 'data-tab-index' ) - 1,
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
			activeTitleFilter = !! tabIndex ? this.getTabTitleFilterSelector( tabIndex ) : settings.ariaAttributes.activeTitleSelector,
			activeContentFilter = !! tabIndex ? this.getTabContentFilterSelector( tabIndex ) : '.' + activeClass,
			$activeTitle = this.elements.$tabTitles.filter( activeTitleFilter ),
			$activeContent = this.elements.$tabContents.filter( activeContentFilter );

		$activeTitle.attr( this.getTitleDeactivationAttributes() );
		$activeContent.removeClass( activeClass );

		$activeContent[ settings.hideTabFn ]( 0, () => this.onHideTabContent( $activeContent ) );
	}

	getTitleActivationAttributes() {
		return {
			tabindex: '0',
			'aria-selected': 'true',
		};
	}

	getTitleDeactivationAttributes() {
		return {
			tabindex: '-1',
			'aria-selected': 'false',
		};
	}

	onHideTabContent() {}

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

		$requestedTitle.attr( this.getTitleActivationAttributes() );
		$requestedContent.addClass( activeClass );

		$requestedContent[ settings.showTabFn ](
			animationDuration,
			() => this.onShowTabContent( $requestedContent ),
		);
	}

	onShowTabContent( $requestedContent ) {
		elementorFrontend.elements.$window.trigger( 'elementor-pro/motion-fx/recalc' );
		elementorFrontend.elements.$window.trigger( 'elementor/nested-tabs/activate', $requestedContent );
		elementorFrontend.elements.$window.trigger( 'elementor/bg-video/recalc' );
	}

	isActiveTab( tabIndex ) {
		return 'true' === this.elements.$tabTitles.filter( '[data-tab-index="' + tabIndex + '"]' ).attr( this.getSettings( 'ariaAttributes' ).titleStateAttribute );
	}

	onTabClick( event ) {
		event.preventDefault();
		this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab-index' ), true );
	}

	onTabKeyDown( event ) {
		this.onKeydownAvoidUndesiredPageScrolling( event );
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
				this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab-index' ), true );
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

	getHeadingEvents() {
		const navigationWrapper = this.elements.$headingContainer[ 0 ];

		return {
			mousedown: changeScrollStatus.bind( this, navigationWrapper ),
			mouseup: changeScrollStatus.bind( this, navigationWrapper ),
			mouseleave: changeScrollStatus.bind( this, navigationWrapper ),
			mousemove: setHorizontalTitleScrollValues.bind( this, navigationWrapper, this.getHorizontalScrollSetting() ),
		};
	}

	bindEvents() {
		this.elements.$tabTitles.on( this.getTabEvents() );
		this.elements.$headingContainer.on( this.getHeadingEvents() );

		const settingsObject = {
			element: this.elements.$headingContainer[ 0 ],
			direction: this.getTabsDirection(),
			justifyCSSVariable: '--n-tabs-heading-justify-content',
			horizontalScrollStatus: this.getHorizontalScrollSetting(),
		};

		this.resizeListenerNestedTabs = setHorizontalScrollAlignment.bind( this, settingsObject );
		elementorFrontend.elements.$window.on( 'resize', this.resizeListenerNestedTabs );

		elementorFrontend.elements.$window.on( 'resize', this.setTouchMode.bind( this ) );
		elementorFrontend.elements.$window.on( 'elementor/nested-tabs/activate', this.reInitSwipers );
	}

	unbindEvents() {
		this.elements.$tabTitles.off();
		this.elements.$headingContainer.off();
		elementorFrontend.elements.$window.off( 'resize' );
		elementorFrontend.elements.$window.off( 'elementor/nested-tabs/activate' );
	}

	onKeydownAvoidUndesiredPageScrolling( event ) {
		// We listen to keydowon event for these keys in order to prevent undesired page scrolling
		if ( [ 'End', 'Home', 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
			this.handleKeyboardNavigation( event );
		}
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
		super.onInit( ...args );

		if ( this.getSettings( 'autoExpand' ) ) {
			this.activateDefaultTab();
		}

		const settingsObject = {
			element: this.elements.$headingContainer[ 0 ],
			direction: this.getTabsDirection(),
			justifyCSSVariable: '--n-tabs-heading-justify-content',
			horizontalScrollStatus: this.getHorizontalScrollSetting(),
		};

		setHorizontalScrollAlignment( settingsObject );

		this.setTouchMode();
	}

	onEditSettingsChange( propertyName, value ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.changeActiveTab( value, false );
		}
	}

	onElementChange( propertyName ) {
		if ( this.checkSliderPropsToWatch( propertyName ) ) {
			const settingsObject = {
				element: this.elements.$headingContainer[ 0 ],
				direction: this.getTabsDirection(),
				justifyCSSVariable: '--n-tabs-heading-justify-content',
				horizontalScrollStatus: this.getHorizontalScrollSetting(),
			};

			setHorizontalScrollAlignment( settingsObject );
		}
	}

	checkSliderPropsToWatch( propertyName ) {
		return 0 === propertyName.indexOf( 'horizontal_scroll' ) ||
			'breakpoint_selector' === propertyName ||
			0 === propertyName.indexOf( 'tabs_justify_horizontal' ) ||
			0 === propertyName.indexOf( 'tabs_title_space_between' );
	}

	/**
	 * @param {string}  tabIndex
	 * @param {boolean} fromUser - Whether the call is caused by the user or internal.
	 */
	changeActiveTab( tabIndex, fromUser = false ) {
		// `document/repeater/select` is used only in the editor, only when the element
		// is in the currently-edited document, and only when its not internal call,
		if ( fromUser && this.isEdit && this.isElementInTheCurrentDocument() ) {
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
			if ( this.isAccordionVersion() ) {
				this.activateMobileTab( tabIndex );
				return;
			}

			this.activateTab( tabIndex );
		}
	}

	activateMobileTab( tabIndex ) {
		// Timeout time added to ensure that opening of the active tab starts after closing the other tab on Apple devices.
		setTimeout( () => {
			this.activateTab( tabIndex );
			this.forceActiveTabToBeInViewport( tabIndex );
		}, 10 );
	}

	forceActiveTabToBeInViewport( tabIndex ) {
		if ( ! elementorFrontend.isEditMode() ) {
			return;
		}

		const $activeTabTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( tabIndex ) );

		if ( ! elementor.helpers.isInViewport( $activeTabTitle[ 0 ] ) ) {
			$activeTabTitle[ 0 ].scrollIntoView( { block: 'center' } );
		}
	}

	getActiveClass() {
		const settings = this.getSettings();

		return settings.classes.active;
	}

	getVisibleTabTitle( tabTitleFilter ) {
		const $tabTitle = this.elements.$tabTitles.filter( tabTitleFilter ),
			isTabTitleDesktopVisible = null !== $tabTitle[ 0 ]?.offsetParent;

		return isTabTitleDesktopVisible ? $tabTitle[ 0 ] : $tabTitle[ 1 ];
	}

	getKeyPressed( event ) {
		const keyTab = 9,
			keyEscape = 27,
			isTabPressed = keyTab === event?.which,
			isShiftPressed = event?.shiftKey,
			isShiftAndTabPressed = !! isTabPressed && isShiftPressed,
			isOnlyTabPressed = !! isTabPressed && ! isShiftPressed,
			isEscapePressed = keyEscape === event?.which;

		if ( isShiftAndTabPressed ) {
			return 'ShiftTab';
		} else if ( isOnlyTabPressed ) {
			return 'Tab';
		} else if ( isEscapePressed ) {
			return 'Escape';
		}
	}

	changeFocusFromContentContainerItemBackToTabTitle( event ) {
		if ( this.hasDropdownLayout() ) {
			return;
		}

		const isShiftAndTabPressed = 'ShiftTab' === this.getKeyPressed( event ),
			isOnlyTabPressed = 'Tab' === this.getKeyPressed( event ),
			isEscapePressed = 'Escape' === this.getKeyPressed( event ),
			firstItemIsInFocus = this.itemInsideContentContainerHasFocus( 0 ),
			lastItemIsInFocus = this.itemInsideContentContainerHasFocus( 'last' ),
			activeTabTitleFilter = `.${ this.getActiveClass() }`,
			activeTabTitleVisible = this.getVisibleTabTitle( activeTabTitleFilter ),
			activeTabTitleIndex = parseInt( activeTabTitleVisible?.getAttribute( 'data-tab-index' ) ),
			nextTabTitleFilter = this.getTabTitleFilterSelector( activeTabTitleIndex + 1 ),
			nextTabTitleVisible = this.getVisibleTabTitle( nextTabTitleFilter ),
			pressShiftTabOnFirstFocusableItem = isShiftAndTabPressed && firstItemIsInFocus && !! activeTabTitleVisible,
			pressTabOnLastFocusableItem = isOnlyTabPressed && lastItemIsInFocus && !! nextTabTitleVisible;

		if ( pressShiftTabOnFirstFocusableItem || isEscapePressed ) {
			event.preventDefault();

			activeTabTitleVisible?.focus();
		} else if ( pressTabOnLastFocusableItem ) {
			event.preventDefault();

			this.setTabindexOfActiveContainerItems( '-1' );

			nextTabTitleVisible?.focus();
		}
	}

	changeFocusFromActiveTabTitleToContentContainer( event ) {
		const isOnlyTabPressed = 'Tab' === this.getKeyPressed( event ),
			$focusableItems = this.getFocusableItemsInsideActiveContentContainer(),
			$firstFocusableItem = $focusableItems[ 0 ],
			currentTabTitle = elementorFrontend.elements.window.document.activeElement,
			currentTabTitleIndex = parseInt( currentTabTitle.getAttribute( 'data-tab-index' ) );

		if ( isOnlyTabPressed && this.tabTitleHasActiveContentContainer( currentTabTitleIndex ) && !! $firstFocusableItem ) {
			event.preventDefault();
			$firstFocusableItem.trigger( 'focus' );
		}
	}

	itemInsideContentContainerHasFocus( position ) {
		const currentItem = elementorFrontend.elements.window.document.activeElement,
			$focusableItems = this.getFocusableItemsInsideActiveContentContainer(),
			itemIndex = 'last' === position ? $focusableItems.length - 1 : position;

		return $focusableItems[ itemIndex ] === currentItem;
	}

	getFocusableItemsInsideActiveContentContainer() {
		const settings = this.getSettings();

		return this.$element.find( settings.selectors.activeTabContentContainers ).find( ':focusable' );
	}

	setTabindexOfActiveContainerItems( tabIndex ) {
		const $focusableItems = this.getFocusableItemsInsideActiveContentContainer();

		$focusableItems.attr( 'tabindex', tabIndex );
	}

	setActiveCurrentContainerItemsToFocusable() {
		const currentTabTitle = elementorFrontend.elements.window.document.activeElement,
			currentTabTitleIndex = parseInt( currentTabTitle?.getAttribute( 'data-tab-index' ) );

		if ( this.tabTitleHasActiveContentContainer( currentTabTitleIndex ) ) {
			this.setTabindexOfActiveContainerItems( '0' );
		}
	}

	tabTitleHasActiveContentContainer( index ) {
		const $tabTitleElement = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( index ) ),
			isTabTitleActive = $tabTitleElement[ 0 ]?.classList.contains( `${ this.getActiveClass() }` ),
			$tabTitleContainerElement = this.elements.$tabContents.filter( this.getTabContentFilterSelector( index ) );

		return !! $tabTitleContainerElement && isTabTitleActive ? true : false;
	}

	getTabsDirection() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'tabs_justify_horizontal', '', currentDevice );
	}

	getHorizontalScrollSetting() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'horizontal_scroll', '', currentDevice );
	}

	isAccordionVersion() {
		return 'contents' === this.elements.$headingContainer.css( 'display' );
	}

	setTouchMode() {
		const widgetSelector = this.getSettings( 'selectors' ).widgetContainer;

		if ( elementorFrontend.isEditMode() || 'resize' === event?.type ) {
			const responsiveDevices = [ 'mobile', 'mobile_extra', 'tablet', 'tablet_extra' ],
				currentDevice = elementorFrontend.getCurrentDeviceMode();

			if ( -1 !== responsiveDevices.indexOf( currentDevice ) ) {
				this.$element.find( widgetSelector ).attr( 'data-touch-mode', 'true' );
				return;
			}
		} else if ( 'ontouchstart' in window ) {
			this.$element.find( widgetSelector ).attr( 'data-touch-mode', 'true' );
			return;
		}

		this.$element.find( widgetSelector ).attr( 'data-touch-mode', 'false' );
	}
}
