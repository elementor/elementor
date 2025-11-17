import NavigationTracking from './dashboard/navigation';
import TopBarTracking from './dashboard/top-bar';
import ScreenViewTracking from './dashboard/screen-view';
import ActionControlTracking from './dashboard/action-control';
import PromotionTracking from './dashboard/promotion';
import MenuPromotionTracking from './dashboard/menu-promotion';

const SESSION_TIMEOUT_MINUTES = 30;
const MINUTE_MS = 60 * 1000;
const SESSION_TIMEOUT = SESSION_TIMEOUT_MINUTES * MINUTE_MS;
const ACTIVITY_CHECK_INTERVAL = 1 * MINUTE_MS;
const SESSION_STORAGE_KEY = 'elementor_wpdash_session';

export const CONTROL_TYPES = {
	BUTTON: 'button',
	CHECKBOX: 'checkbox',
	RADIO: 'radio',
	LINK: 'link',
	SELECT: 'select',
	TOGGLE: 'toggle',
};

export const NAV_AREAS = {
	LEFT_MENU: 'left_menu',
	SUBMENU: 'submenu',
	HOVER_MENU: 'hover_menu',
	TOP_BAR: 'top_bar',
};

export const SCREEN_TYPES = {
	TAB: 'tab',
	POPUP: 'popup',
	APP_SCREEN: 'app_screen',
};

export default class WpDashboardTracking {
	static sessionStartTime = Date.now();
	static lastActivityTime = Date.now();
	static sessionEnded = false;
	static navItemsVisited = new Set();
	static activityCheckInterval = null;
	static config = null;
	static canSendEvents = false;
	static initialized = false;
	static navigationListeners = [];
	static isNavigatingToElementor = false;

	static init() {
		if ( this.initialized ) {
			return;
		}

		this.restoreOrCreateSession();

		this.config = elementorCommon?.config || {};
		const editorEvents = this.config.editor_events || {};
		this.canSendEvents = editorEvents.can_send_events || false;

		if ( this.isEventsManagerAvailable() ) {
			this.startSessionMonitoring();
			this.attachActivityListeners();
			this.attachNavigationListener();
			this.initialized = true;
		}
	}

	static restoreOrCreateSession() {
		const storedSession = this.getStoredSession();

		if ( storedSession ) {
			this.sessionStartTime = storedSession.sessionStartTime;
			this.navItemsVisited = new Set( storedSession.navItemsVisited );
			this.lastActivityTime = Date.now();
			this.sessionEnded = false;
		} else {
			this.sessionStartTime = Date.now();
			this.lastActivityTime = Date.now();
			this.sessionEnded = false;
			this.navItemsVisited = new Set();
		}

		this.saveSessionToStorage();
	}

	static getStoredSession() {
		try {
			const stored = sessionStorage.getItem( SESSION_STORAGE_KEY );
			return stored ? JSON.parse( stored ) : null;
		} catch ( error ) {
			return null;
		}
	}

	static saveSessionToStorage() {
		try {
			const sessionData = {
				sessionStartTime: this.sessionStartTime,
				navItemsVisited: Array.from( this.navItemsVisited ),
			};
			sessionStorage.setItem( SESSION_STORAGE_KEY, JSON.stringify( sessionData ) );
		} catch ( error ) {
		}
	}

	static clearStoredSession() {
		try {
			sessionStorage.removeItem( SESSION_STORAGE_KEY );
		} catch ( error ) {
		}
	}

	static isEventsManagerAvailable() {
		return elementorCommon?.eventsManager &&
			'function' === typeof elementorCommon.eventsManager.dispatchEvent;
	}

	static dispatchEvent( eventName, properties = {} ) {
		if ( ! this.canSendEvents || ! this.isEventsManagerAvailable() ) {
			return;
		}

		try {
			elementorCommon.eventsManager.dispatchEvent( eventName, properties );
		} catch ( error ) {
			this.canSendEvents = false;
		}
	}

	static updateActivity() {
		this.lastActivityTime = Date.now();
		this.sessionEnded = false;
	}

	static startSessionMonitoring() {
		this.activityCheckInterval = setInterval( () => {
			this.checkSessionTimeout();
		}, ACTIVITY_CHECK_INTERVAL );

		window.addEventListener( 'beforeunload', () => {
			if ( ! this.isNavigatingToElementor ) {
				this.trackSessionEnd( 'tab_closed' );
			}
		} );

		document.addEventListener( 'visibilitychange', () => {
			if ( document.hidden ) {
				const timeSinceLastActivity = Date.now() - this.lastActivityTime;
				if ( timeSinceLastActivity > SESSION_TIMEOUT ) {
					this.trackSessionEnd( 'tab_inactive' );
				}
			}
		} );
	}

	static isElementorPage( url ) {
		try {
			const urlObj = new URL( url, window.location.origin );
			const params = urlObj.searchParams;

			return ( params.has( 'page' ) && params.get( 'page' ).includes( 'elementor' ) ) ||
				( params.has( 'post_type' ) && 'elementor_library' === params.get( 'post_type' ) ) ||
				( params.has( 'action' ) && params.get( 'action' ).includes( 'elementor' ) );
		} catch ( error ) {
			return false;
		}
	}

	static isNavigatingAwayFromElementor( targetUrl ) {
		if ( ! targetUrl ) {
			return false;
		}

		if ( targetUrl.startsWith( '#' ) ) {
			return false;
		}

		if ( targetUrl.startsWith( 'javascript:' ) ) {
			return false;
		}

		return ! this.isElementorPage( targetUrl );
	}

	static attachNavigationListener() {
		const handleLinkClick = ( event ) => {
			const link = event.target.closest( 'a' );
			if ( link && link.href ) {
				if ( this.isNavigatingAwayFromElementor( link.href ) ) {
					this.trackSessionEnd( 'navigate_away' );
				} else if ( this.isElementorPage( link.href ) ) {
					this.isNavigatingToElementor = true;
				}
			}
		};

		const handleFormSubmit = ( event ) => {
			const form = event.target;
			if ( form.action ) {
				if ( this.isNavigatingAwayFromElementor( form.action ) ) {
					this.trackSessionEnd( 'navigate_away' );
				} else if ( this.isElementorPage( form.action ) ) {
					this.isNavigatingToElementor = true;
				}
			}
		};

		document.addEventListener( 'click', handleLinkClick, true );
		document.addEventListener( 'submit', handleFormSubmit, true );

		this.navigationListeners.push(
			{ type: 'click', handler: handleLinkClick },
			{ type: 'submit', handler: handleFormSubmit },
		);
	}

	static checkSessionTimeout() {
		const timeSinceLastActivity = Date.now() - this.lastActivityTime;

		if ( timeSinceLastActivity > SESSION_TIMEOUT && ! this.sessionEnded ) {
			this.trackSessionEnd( 'timeout' );
		}
	}

	static attachActivityListeners() {
		const events = [ 'mousedown', 'keydown', 'scroll', 'touchstart', 'click' ];

		events.forEach( ( event ) => {
			document.addEventListener( event, () => {
				this.updateActivity();
			}, { capture: true, passive: true } );
		} );
	}

	static formatDuration( milliseconds ) {
		const totalSeconds = Math.floor( milliseconds / 1000 );
		return Number( ( totalSeconds ).toFixed( 2 ) );
	}

	static trackNavClicked( itemId, rootItem = null, area = NAV_AREAS.LEFT_MENU ) {
		this.updateActivity();

		this.navItemsVisited.add( itemId );
		this.saveSessionToStorage();

		const properties = {
			wpdash_nav_item_id: itemId,
			wpdash_nav_area: area,
		};

		if ( rootItem ) {
			properties.wpdash_nav_item_root = rootItem;
		}

		this.dispatchEvent( 'wpdash_nav_clicked', properties );
	}

	static trackScreenViewed( screenId, screenType = SCREEN_TYPES.TAB ) {
		this.updateActivity();

		const properties = {
			wpdash_screen_id: screenId,
			wpdash_screen_type: screenType,
		};

		this.dispatchEvent( 'wpdash_screen_viewed', properties );
	}

	static trackActionControl( controlIdentifier, controlType ) {
		this.updateActivity();

		const properties = {
			wpdash_action_control_interacted: controlIdentifier,
			wpdash_control_type: controlType,
		};

		this.dispatchEvent( 'wpdash_action_control', properties );
	}

	static trackPromoClicked( promoName, destination, clickPath ) {
		this.updateActivity();

		const properties = {
			wpdash_promo_name: promoName,
			wpdash_promo_destination: destination,
			wpdash_promo_clicked_path: clickPath,
		};

		this.dispatchEvent( 'wpdash_promo_clicked', properties );
	}

	static trackSessionEnd( reason = 'timeout' ) {
		if ( this.sessionEnded ) {
			return;
		}

		this.sessionEnded = true;

		const duration = Date.now() - this.sessionStartTime;

		const properties = {
			wpdash_endstate_nav_summary: Array.from( this.navItemsVisited ),
			wpdash_endstate_nav_count: this.navItemsVisited.size,
			wpdash_endstate_duration: this.formatDuration( duration ),
			reason,
		};

		this.dispatchEvent( 'wpdash_session_end_state', properties );
		this.clearStoredSession();
	}

	static destroy() {
		if ( this.activityCheckInterval ) {
			clearInterval( this.activityCheckInterval );
		}

		this.navigationListeners.forEach( ( { type, handler } ) => {
			document.removeEventListener( type, handler, true );
		} );
		this.navigationListeners = [];

		NavigationTracking.destroy();
		TopBarTracking.destroy();
		ScreenViewTracking.destroy();
		ActionControlTracking.destroy();
		PromotionTracking.destroy();
		MenuPromotionTracking.destroy();

		this.initialized = false;
	}
}

window.addEventListener( 'elementor/admin/init', () => {
	WpDashboardTracking.init();
	NavigationTracking.init();
	TopBarTracking.init();
	ScreenViewTracking.init();
	ActionControlTracking.init();
	PromotionTracking.init();
	MenuPromotionTracking.init();
} );

window.addEventListener( 'beforeunload', () => {
	WpDashboardTracking.destroy();
} );
