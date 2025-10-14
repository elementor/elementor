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
	TOP_LEVEL_PAGE: 'top_level_page',
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

	static init() {
		if ( this.initialized ) {
			return;
		}

		this.sessionStartTime = Date.now();
		this.lastActivityTime = Date.now();
		this.sessionEnded = false;
		this.navItemsVisited = new Set();
		this.config = elementorCommon?.config || {};
		const editorEvents = this.config.editor_events || {};
		this.canSendEvents = editorEvents.can_send_events || false;

		if ( this.isEventsManagerAvailable() ) {
			this.startSessionMonitoring();
			this.attachActivityListeners();
			this.initialized = true;
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
			this.trackSessionEnd( 'page_unload' );
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
		return Number( ( totalSeconds / 60 ).toFixed( 2 ) );
	}

	static trackNavClicked( itemId, rootItem = null, area = NAV_AREAS.LEFT_MENU ) {
		this.updateActivity();

		this.navItemsVisited.add( itemId );

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

	static trackActionControl( controlData, controlType ) {
		this.updateActivity();

		const properties = {
			wpdash_action_control_interacted: controlData,
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
	}

	static destroy() {
		if ( this.activityCheckInterval ) {
			clearInterval( this.activityCheckInterval );
		}

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
