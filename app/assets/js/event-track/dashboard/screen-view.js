import WpDashboardTracking, { SCREEN_TYPES } from '../wp-dashboard-tracking';
import { DashboardUtils } from './utils';
import BaseTracking from './base-tracking';

const SCREEN_SELECTORS = {
	NAV_TAB_WRAPPER: '.nav-tab-wrapper',
	NAV_TAB: '.nav-tab',
	NAV_TAB_ACTIVE: '.nav-tab-active',
	SETTINGS_FORM_PAGE: '.elementor-settings-form-page',
	SETTINGS_FORM_PAGE_ACTIVE: '.elementor-settings-form-page.elementor-active',
	FLOATING_ELEMENTS_MODAL: '#elementor-new-floating-elements-modal',
	TEMPLATE_DIALOG_MODAL: '#elementor-new-template-dialog-content',
};

const TRACKED_MODALS = [
	SCREEN_SELECTORS.FLOATING_ELEMENTS_MODAL,
	SCREEN_SELECTORS.TEMPLATE_DIALOG_MODAL,
];

class ScreenViewTracking extends BaseTracking {
	static trackedScreens = new Set();

	static init() {
		if ( ! DashboardUtils.isElementorPage() ) {
			return;
		}

		this.attachTabChangeTracking();
	}

	static destroy() {
		super.destroy();
		this.trackedScreens.clear();
	}

	static getScreenData() {
		const urlParams = new URLSearchParams( window.location.search );
		const page = urlParams.get( 'page' );
		const postType = urlParams.get( 'post_type' );
		const hash = window.location.hash;

		let screenId = '';
		let screenType = '';

		if ( page ) {
			screenId = page;
		} else if ( postType ) {
			screenId = postType;
		} else {
			screenId = this.getScreenIdFromBody();
		}

		if ( this.isElementorAppPage() ) {
			const appScreenData = this.getAppScreenData( hash );
			if ( appScreenData ) {
				return appScreenData;
			}
		}

		const hasNavTabs = document.querySelector( SCREEN_SELECTORS.NAV_TAB_WRAPPER );
		const hasSettingsTabs = document.querySelectorAll( SCREEN_SELECTORS.SETTINGS_FORM_PAGE ).length > 1;

		if ( hasNavTabs || hasSettingsTabs || ( hash && ! this.isElementorAppPage() ) ) {
			screenType = SCREEN_TYPES.TAB;

			if ( hash ) {
				const tabId = hash.replace( /^#(tab-)?/, '' );
				screenId = `${ screenId }-${ tabId }`;
			} else if ( hasNavTabs ) {
				const activeTab = document.querySelector( SCREEN_SELECTORS.NAV_TAB_ACTIVE );
				if ( activeTab ) {
					const tabText = activeTab.textContent.trim();
					const tabHref = activeTab.getAttribute( 'href' );

					if ( tabText ) {
						screenId = `${ screenId }-${ this.sanitizeScreenId( tabText ) }`;
					} else if ( tabHref && tabHref.includes( '#' ) ) {
						const tabId = tabHref.split( '#' )[ 1 ];
						screenId = `${ screenId }-${ tabId }`;
					}
				}
			} else if ( hasSettingsTabs ) {
				const activeSettingsTab = document.querySelector( SCREEN_SELECTORS.SETTINGS_FORM_PAGE_ACTIVE );
				if ( activeSettingsTab ) {
					const tabId = activeSettingsTab.id;
					if ( tabId ) {
						screenId = `${ screenId }-${ tabId }`;
					}
				}
			}
		}

		return { screenId, screenType };
	}

	static isElementorAppPage() {
		const urlParams = new URLSearchParams( window.location.search );
		return 'elementor-app' === urlParams.get( 'page' );
	}

	static getAppScreenData( hash ) {
		if ( ! hash ) {
			return null;
		}

		const cleanHash = hash.replace( /^#/, '' );

		if ( ! cleanHash.startsWith( '/' ) ) {
			return null;
		}

		const pathParts = cleanHash.split( '/' ).filter( Boolean );

		if ( 0 === pathParts.length ) {
			return null;
		}

		const screenId = pathParts.join( '/' );
		const screenType = SCREEN_TYPES.APP_SCREEN;

		return { screenId, screenType };
	}

	static getScreenIdFromBody() {
		const body = document.body;
		const bodyClasses = body.className.split( ' ' );

		for ( const cls of bodyClasses ) {
			if ( cls.startsWith( 'elementor' ) && ( cls.includes( 'page' ) || cls.includes( 'post-type' ) ) ) {
				return cls;
			}
		}

		return 'elementor-unknown';
	}

	static sanitizeScreenId( text ) {
		return text.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^-|-$/g, '' );
	}

	static attachTabChangeTracking() {
		this.attachNavTabTracking();
		this.attachHashChangeTracking();
		this.attachSettingsTabTracking();
		this.attachModalTracking();
	}

	static attachNavTabTracking() {
		const wrapper = document.querySelector( SCREEN_SELECTORS.NAV_TAB_WRAPPER );

		if ( ! wrapper ) {
			return;
		}

		this.addEventListenerTracked(
			wrapper,
			'click',
			( event ) => {
				const navTab = event.target.closest( SCREEN_SELECTORS.NAV_TAB );
				if ( navTab && ! navTab.classList.contains( 'nav-tab-active' ) ) {
					const screenData = this.getScreenData();
					if ( screenData ) {
						this.trackScreen( screenData.screenId, screenData.screenType );
					}
				}
			},
		);
	}

	static attachHashChangeTracking() {
		this.addEventListenerTracked(
			window,
			'hashchange',
			() => {
				const screenData = this.getScreenData();
				if ( screenData ) {
					this.trackScreen( screenData.screenId, screenData.screenType );
				}
			},
		);
	}

	static attachSettingsTabTracking() {
		const settingsPages = document.querySelectorAll( SCREEN_SELECTORS.SETTINGS_FORM_PAGE );

		if ( 0 === settingsPages.length ) {
			return;
		}

		settingsPages.forEach( ( page ) => {
			this.addObserver(
				page,
				{
					attributes: true,
					attributeFilter: [ 'class' ],
				},
				() => {
					const screenData = this.getScreenData();
					if ( screenData ) {
						this.trackScreen( screenData.screenId, screenData.screenType );
					}
				},
			);
		} );
	}

	static attachModalTracking() {
		this.addObserver(
			document.body,
			{
				childList: true,
				subtree: true,
			},
			( mutations ) => {
				for ( const mutation of mutations ) {
					if ( 'childList' === mutation.type ) {
						TRACKED_MODALS.forEach( ( modalSelector ) => {
							const modal = document.querySelector( modalSelector );
							if ( modal && this.isModalVisible( modal ) ) {
								const modalId = modalSelector.replace( '#', '' );
								this.trackScreen( modalId, SCREEN_TYPES.POPUP );
							}
						} );
					}
				}
			},
		);
	}

	static isModalVisible( element ) {
		if ( ! element ) {
			return false;
		}

		const style = window.getComputedStyle( element );
		return 'none' !== style.display && 0 !== parseFloat( style.opacity );
	}

	static trackScreen( screenId, screenType = SCREEN_TYPES.TOP_LEVEL_PAGE ) {
		const trackingKey = `${ screenId }-${ screenType }`;

		if ( this.trackedScreens.has( trackingKey ) ) {
			return;
		}

		this.trackedScreens.add( trackingKey );

		WpDashboardTracking.trackScreenViewed( screenId, screenType );
	}
}

export default ScreenViewTracking;
