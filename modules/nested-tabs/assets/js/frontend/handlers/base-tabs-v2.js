import Tabs from 'elementor-frontend/handlers/tabs';

export default class BaseTabsV2 extends Tabs {
	/**
	 * @param {string|number} tabIndex
	 *
	 * @returns {string}
	 */
	getTabTitleFilterSelector( tabIndex ) {
		return `[data-tab="${ tabIndex }"]`;
	}

	/**
	 * @param {string|number} tabIndex
	 *
	 * @returns {string}
	 */
	getTabContentFilterSelector( tabIndex ) {
		return `[data-tab="${ tabIndex }"]`;
	}

	/**
	 * @param {HTMLElement} tabTitleElement

	 * @returns {string}
	 */
	getTabIndex( tabTitleElement ) {
		return tabTitleElement.getAttribute( 'data-tab' );
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
			$requestedTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( tabIndex ) ),
			$requestedContent = this.elements.$tabContents.filter( this.getTabContentFilterSelector( tabIndex ) ),
			animationDuration = 'show' === settings.showTabFn ? 0 : 400;

		$requestedTitle.add( $requestedContent ).addClass( activeClass );
		$requestedTitle.attr( {
			tabindex: '0',
			'aria-selected': 'true',
			'aria-expanded': 'true',
		} );

		$requestedContent[ settings.showTabFn ]( animationDuration, () => elementorFrontend.elements.$window.trigger( 'resize' ) );
		$requestedContent.removeAttr( 'hidden' );
	}

	bindEvents() {
		this.elements.$tabTitles.on( {
			keydown: ( event ) => {
				// Support for old markup that includes an `<a>` tag in the tab
				if ( jQuery( event.target ).is( 'a' ) && `Enter` === event.key ) {
					event.preventDefault();
				}

				// We listen to keydowon event for these keys in order to prevent undesired page scrolling
				if ( [ 'End', 'Home', 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
					this.handleKeyboardNavigation( event );
				}
			},
			keyup: ( event ) => {
				switch ( event.key ) {
					case 'ArrowLeft':
					case 'ArrowRight':
						this.handleKeyboardNavigation( event );
						break;
					case 'Enter':
					case 'Space':
						event.preventDefault();
						this.changeActiveTab( this.getTabIndex( event.currentTarget ), true );
						break;
				}
			},
			click: ( event ) => {
				event.preventDefault();
				this.changeActiveTab( this.getTabIndex( event.currentTarget ), true );
			},
		} );
	}

	onEditSettingsChange( propertyName, value ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.changeActiveTab( value, false );
		}
	}
}
