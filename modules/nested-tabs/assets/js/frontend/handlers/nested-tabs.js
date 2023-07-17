import Base from '../../../../../../assets/dev/js/frontend/handlers/base';
import {
	changeScrollStatus,
	setHorizontalScrollAlignment,
	setHorizontalTitleScrollValues,
	setTabsPositionAbsolute,
} from 'elementor/assets/dev/js/frontend/utils/flex-horizontal-scroll';

export default class NestedTabs extends Base {
	constructor( ...args ) {
		super( ...args );

		this.resizeListenerNestedTabs = null;
		this.pageX = 0;
	}

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
		// Double by 2, since each `e-con` should have 'e-n-tab-title'.
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
				tabList: '[role="tablist"]',
				tabTitle: '.e-n-tab-title',
				tabContent: '.e-con',
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
			$tabList: this.findElement( selectors.tabList ),
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

		// SetTabsPositionAbsolute( this.elements.$tabList, this.elements.$tabTitles, this.getHorizontalScrollSetting() );
	}

	handleKeyboardNavigation( event ) {
		const tab = event.currentTarget,
			$tabs = this.elements.$tabTitles,
			currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			widgetDirection = elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'tabs_direction', '', currentDeviceMode ),
			hasVerticalTabs = [ 'start', 'end' ].includes( widgetDirection ),
			isVertical = this.isWidgetInDropdownMode() || hasVerticalTabs;

		switch ( event.key ) {
			case 'Escape':
				break;
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

		const tabIndex = parseInt( tab.getAttribute( 'data-tab' ) ),
			direction = this.getSettings( 'keyDirection' )[ event.key ],
			$nextTab = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( tabIndex + direction ) );

		if ( !! $nextTab ) {
			$nextTab.trigger( 'focus' );
		} else if ( -1 === tabIndex + direction ) {
			$tabs.last().trigger( 'focus' );
		} else {
			$tabs.first().trigger( 'focus' );
		}
	}

	deactivateActiveTab() {
		const settings = this.getSettings(),
			$activeTitle = this.getActiveTabObject().tabTitle,
			$activeContent = this.getActiveTabObject().tabContent;

		$activeTitle.attr( this.getTitleDeactivationAttributes() );

		$activeContent[ settings.hideTabFn ]( 0, () => this.onHideTabContent( $activeContent ) );
		$activeContent.attr( 'hidden', 'hidden' ); // I am not sure what this is used for...
	}

	getActiveTabObject( tabIndex ) {
		const activeTitleFilter = tabIndex ? this.getTabTitleFilterSelector( tabIndex ) : '[aria-selected="true"]';

		return {
			tabTitle: this.elements.$tabTitles.filter( activeTitleFilter ),
			tabContent: this.elements.$tabTitles.filter( activeTitleFilter ).next(),
		};
	}

	getTitleDeactivationAttributes() {
		return {
			'aria-selected': 'false',
		};
	}

	onHideTabContent() {}

	activateTab( tabIndex ) {
		const settings = this.getSettings(),
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

		$requestedTitle.attr( {
			'aria-selected': 'true',
		} );

		$requestedContent[ settings.showTabFn ](
			animationDuration,
			() => this.onShowTabContent( $requestedContent ),
		);

		$requestedContent.removeAttr( 'hidden' ); // I am not sure what this is used for.
	}

	setContentContainerPositionAndHeight( $contentContainer = this.elements.$tabContents.first() ) {
		const $wrapper = this.elements.$tabList;

		$wrapper.css( 'min-height', '' );

		this.elements.$tabContents.css( {
			top: '',
			left: '',
			width: '',
			height: '',
			position: '',
		} );

		$wrapper.addClass( 'set-container' );

		$wrapper.css( 'min-height', $wrapper.height() + 'px' );

		$contentContainer.css( {
			top: $contentContainer.position().top + 'px',
			left: $contentContainer.position().left + 'px',
			width: $wrapper.width() + 'px',
			height: $contentContainer.height() + 'px',
			position: 'absolute',
		} );

		$wrapper.removeClass( 'set-container' );
	}

	onShowTabContent( $requestedContent ) {
		elementorFrontend.elements.$window.trigger( 'elementor-pro/motion-fx/recalc' );
		elementorFrontend.elements.$window.trigger( 'elementor/nested-tabs/activate', $requestedContent );
	}

	isActiveTab( tabIndex ) {
		return 'true' === this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ).attr( 'aria-selected' );
	}

	onTabClick( event ) {
		event.preventDefault();
		this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ), true );
	}

	onTabKeyDown( event ) {
		this.preventDefaultLinkBehaviourForTabTitle( event );
		this.onKeydownAvoidUndesiredPageScrolling( event );
	}

	onTabKeyUp( event ) {
		switch ( event.code ) {
			case 'ArrowLeft':
			case 'ArrowRight':
			case 'ArrowUp':
			case 'ArrowDown':
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

	getHeadingEvents() {
		const navigationWrapper = this.elements.$tabList[ 0 ];

		return {
			touchstart: changeScrollStatus.bind( this, navigationWrapper ),
			touchend: changeScrollStatus.bind( this, navigationWrapper ),
			touchcancel: changeScrollStatus.bind( this, navigationWrapper ),
			pointerup: changeScrollStatus.bind( this, navigationWrapper ),
			pointerdown: changeScrollStatus.bind( this, navigationWrapper ),
			mousedown: changeScrollStatus.bind( this, navigationWrapper ),
			mouseup: changeScrollStatus.bind( this, navigationWrapper ),
			mouseleave: changeScrollStatus.bind( this, navigationWrapper ),
			mousemove: setHorizontalTitleScrollValues.bind( this, navigationWrapper, this.getHorizontalScrollSetting() ),
			touchmove: setHorizontalTitleScrollValues.bind( this, navigationWrapper, this.getHorizontalScrollSetting() ),
		};
	}
	bindEvents() {
		this.elements.$tabTitles.on( this.getTabEvents() );
		this.elements.$tabList.on( this.getHeadingEvents() );

		const settingsObject = {
			element: this.elements.$tabList[ 0 ],
			direction: this.getTabsDirection(),
			justifyCSSVariable: '--n-tabs-heading-justify-content',
			horizontalScrollStatus: this.getHorizontalScrollSetting(),
		};

		this.resizeListenerNestedTabs = setHorizontalScrollAlignment.bind( this, settingsObject );
		elementorFrontend.elements.$window.on( 'resize', this.resizeListenerNestedTabs );
		this.elements.$tabList.find( '.e-con' ).children().on( 'keydown', this.onEscapeContentContainer.bind( this ) );
		elementorFrontend.elements.$window.on( 'elementor/nested-tabs/activate', this.reInitSwipers );
	}

	unbindEvents() {
		this.elements.$tabTitles.off();
		elementorFrontend.elements.$window.off( 'resize' );
		elementorFrontend.elements.$window.off( 'elementor/nested-tabs/activate' );
	}

	preventDefaultLinkBehaviourForTabTitle( event ) {
		// Support for old markup that includes an `<a>` tag in the tab
		if ( jQuery( event.target ).is( 'a' ) && `Enter` === event.key ) {
			event.preventDefault();
		}
	}

	onKeydownAvoidUndesiredPageScrolling( event ) {
		// We listen to the keydown events for these keys in order to prevent undesired page scrolling.
		if ( [ 'End', 'Home', 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
			event.preventDefault();
		}
	}

	onEscapeContentContainer( event ) {
		if ( 'Escape' === event.key ) {
			const currentTab = event.currentTarget.closest( '.e-n-tabs > .e-con' ).previousSibling;
			currentTab.focus();
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
		this.createMobileTabs( args );

		super.onInit( ...args );

		const settingsObject = {
			element: this.elements.$tabList[ 0 ],
			direction: this.getTabsDirection(),
			justifyCSSVariable: '--n-tabs-heading-justify-content',
			horizontalScrollStatus: this.getHorizontalScrollSetting(),
		};

		setHorizontalScrollAlignment( settingsObject );

		if ( this.getSettings( 'autoExpand' ) ) {
			this.activateDefaultTab();
		}

		this.initSwiper();
		// This.widgetWidthChangeListener();
	}

	initSwiper() {
		const Swiper = elementorFrontend.utils.swiper;

		this.swiper = new Swiper( this.elements.$tabList, {
			// CssMode: true,
		} );

		console.log( 'swiper' );
	}

	onEditSettingsChange( propertyName, value ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.changeActiveTab( value, false );
		}
	}

	onElementChange( propertyName ) {
		// SetTabsPositionAbsolute( this.elements.$tabList, this.elements.$tabTitles, this.getHorizontalScrollSetting() );

		if ( this.checkSliderPropsToWatch( propertyName ) ) {
			const settingsObject = {
				element: this.elements.$tabList[ 0 ],
				direction: this.getTabsDirection(),
				justifyCSSVariable: '--n-tabs-heading-justify-content',
				horizontalScrollStatus: this.getHorizontalScrollSetting(),
			};

			setHorizontalScrollAlignment( settingsObject );
		}
	}

	widgetWidthChangeListener() {
		const widget = this.elements.$tabList[ 0 ];
		let previousWidth = 0;

		this.observedContainer = new ResizeObserver( ( widgetElement ) => {
			const currentWidth = widgetElement[ 0 ].borderBoxSize?.[ 0 ].inlineSize;

			if ( !! currentWidth && currentWidth !== previousWidth ) {
				previousWidth = currentWidth;

				if ( 0 !== previousWidth ) {
					setTabsPositionAbsolute( this.elements.$tabList, this.elements.$tabTitles, this.getHorizontalScrollSetting() );
				}
			}
		} );

		this.observedContainer.observe( widget );
	}

	checkSliderPropsToWatch( propertyName ) {
		return 0 === propertyName.indexOf( 'horizontal_scroll' ) ||
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
			if ( this.isWidgetInDropdownMode() ) {
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

		const $activeTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( tabIndex ) );

		if ( ! elementor.helpers.isInViewport( $activeTitle[ 0 ] ) ) {
			$activeTitle[ 0 ].scrollIntoView( { block: 'center' } );
		}
	}

	createMobileTabs() {
		if ( ! elementorFrontend.isEditMode() ) {
			return;
		}

		const settings = this.getSettings(),
			$widget = this.$element;

		let index = 0;

		this.findElement( '.e-con' ).each( function() {
			const $currentContainer = jQuery( this ),
				$tabTitle = $widget.find( settings.selectors.tabTitle )[ index ];

			$currentContainer.insertAfter( $tabTitle );

			++index;
		} );
	}

	isWidgetInDropdownMode() {
		const elementSettings = this.getElementSettings();

		if ( 'dropdown' === elementSettings.item_layout ) {
			return true;
		}

		const activeBreakpointsList = elementorFrontend.breakpoints.getActiveBreakpointsList( { withDesktop: true } ),
			breakpointIndex = activeBreakpointsList.indexOf( elementSettings.breakpoint_selector ),
			currentDeviceModeIndex = activeBreakpointsList.indexOf( elementorFrontend.getCurrentDeviceMode() );

		return currentDeviceModeIndex <= breakpointIndex;
	}

	getTabsDirection() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'tabs_justify_horizontal', '', currentDevice );
	}

	getHorizontalScrollSetting() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'horizontal_scroll', '', currentDevice );
	}
}
