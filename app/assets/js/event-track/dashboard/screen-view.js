import WpDashboardTracking, { SCREEN_TYPES } from '../wp-dashboard-tracking';
import { DashboardUtils } from './utils';

const SCREEN_SELECTORS = {
	NAV_TAB_WRAPPER: '.nav-tab-wrapper',
	NAV_TAB: '.nav-tab',
	NAV_TAB_ACTIVE: '.nav-tab-active',
	SETTINGS_FORM_PAGE: '.elementor-settings-form-page',
	SETTINGS_FORM_PAGE_ACTIVE: '.elementor-settings-form-page.elementor-active',
};

class ScreenViewTracking {
	static trackedScreens = new Set();

	static init() {
		if ( ! DashboardUtils.isElementorPage() ) {
			return;
		}

		this.trackInitialPageView();
		this.attachTabChangeTracking();
	}

	static trackInitialPageView() {
		const run = () => {
			const screenData = this.getScreenData();
			if ( screenData ) {
				this.trackScreen( screenData.screenId, screenData.screenType );
			}
		};

		if ( 'loading' === document.readyState ) {
			document.addEventListener( 'DOMContentLoaded', run, { once: true } );
		} else {
			run();
		}
	}

	static getScreenData() {
		const urlParams = new URLSearchParams( window.location.search );
		const page = urlParams.get( 'page' );
		const postType = urlParams.get( 'post_type' );
		const hash = window.location.hash;

		let screenId = '';
		let screenType = SCREEN_TYPES.APP_SCREEN;

		if ( page ) {
			screenId = page;
		} else if ( postType ) {
			screenId = postType;
		} else {
			screenId = this.getScreenIdFromBody();
		}

		const hasNavTabs = document.querySelector( SCREEN_SELECTORS.NAV_TAB_WRAPPER );
		const hasSettingsTabs = document.querySelectorAll( SCREEN_SELECTORS.SETTINGS_FORM_PAGE ).length > 1;

		if ( hasNavTabs || hasSettingsTabs || hash ) {
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
	}

	static attachNavTabTracking() {
		const wrapper = document.querySelector( SCREEN_SELECTORS.NAV_TAB_WRAPPER );

		if ( ! wrapper ) {
			return;
		}

		const observer = new MutationObserver( ( mutations ) => {
			for ( const mutation of mutations ) {
				if ( 'childList' === mutation.type ) {
					const screenData = this.getScreenData();
					if ( screenData ) {
						this.trackScreen( screenData.screenId, screenData.screenType );
					}
					break;
				}

				if ( 'attributes' === mutation.type && 'class' === mutation.attributeName ) {
					const target = mutation.target;
					if ( target && target.classList && target.classList.contains( 'nav-tab' ) ) {
						const screenData = this.getScreenData();
						if ( screenData ) {
							this.trackScreen( screenData.screenId, screenData.screenType );
						}
						break;
					}
				}
			}
		} );

		observer.observe( wrapper, {
			attributes: true,
			attributeFilter: [ 'class' ],
			subtree: true,
			childList: true,
		} );
	}

	static attachHashChangeTracking() {
		window.addEventListener( 'hashchange', () => {
			const screenData = this.getScreenData();
			if ( screenData ) {
				this.trackScreen( screenData.screenId, screenData.screenType );
			}
		} );
	}

	static attachSettingsTabTracking() {
		const observer = new MutationObserver( () => {
			const screenData = this.getScreenData();
			if ( screenData ) {
				this.trackScreen( screenData.screenId, screenData.screenType );
			}
		} );

		const settingsPages = document.querySelectorAll( SCREEN_SELECTORS.SETTINGS_FORM_PAGE );
		settingsPages.forEach( ( page ) => {
			observer.observe( page, {
				attributes: true,
				attributeFilter: [ 'class' ],
			} );
		} );
	}

	static trackScreen( screenId, screenType = SCREEN_TYPES.APP_SCREEN ) {
		const trackingKey = `${ screenId }-${ screenType }`;

		if ( this.trackedScreens.has( trackingKey ) ) {
			return;
		}

		this.trackedScreens.add( trackingKey );

		WpDashboardTracking.trackScreenViewed( screenId, screenType );
	}
}

export default ScreenViewTracking;
