import Base from 'elementor-frontend/handlers/base';

export default class BaseNested extends Base {
	/**
	 * Set default settings.
	 *
	 * @return {{toggleSelf: boolean, keyDirection: {ArrowLeft: (number), ArrowUp: number, ArrowRight: (number), ArrowDown: number}, hideTabFn: string, classes: {active: string}, showTabFn: string, selectors: {tablist: string, tabTitle: string, tabContent: string}, autoExpand: boolean, hidePrevious: boolean}}
	 * @since 2.0.0
	 */
	getDefaultSettings() {
		return {
			selectors: {
				tablist: '[role="tablist"]',
				tabTitle: '.e-n-tab-title',
				tabContent: '.e-con',
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
			},
			click: ( event ) => {
				event.preventDefault();
				this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ), true );
			},
		} );
	}

	onInit( ...args ) {
		super.onInit( ...args );
	}
}
