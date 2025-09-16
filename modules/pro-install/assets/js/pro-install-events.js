// --- Upgrade Now ---
window.trackUpgradeNowClickEvent = function() {
	if ( ! window.elementorCommon?.config?.experimentalFeatures?.editor_events ) {
		return;
	}

	const eventsManager = window.elementorCommon?.eventsManager || {};
	const dispatchEvent = eventsManager.dispatchEvent?.bind( eventsManager );

	const eventName = 'upgrade_now_click';
	const eventData = {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'click',
	};

	dispatchEvent?.( eventName, eventData );
};

// --- Connect Account ---
window.trackConnectAccountEvent = function() {
	if ( ! window.elementorCommon?.config?.experimentalFeatures?.editor_events ) {
		return;
	}

	const eventsManager = window.elementorCommon?.eventsManager || {};
	const dispatchEvent = eventsManager.dispatchEvent?.bind( eventsManager );

	const eventName = 'connect_account';
	const eventData = {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'click',
	};

	dispatchEvent?.( eventName, eventData );
};

// --- Open Connect Page ---
window.trackOpenConnectPageEvent = function() {
	if ( ! window.elementorCommon?.config?.experimentalFeatures?.editor_events ) {
		return;
	}

	const eventsManager = window.elementorCommon?.eventsManager || {};
	const dispatchEvent = eventsManager.dispatchEvent?.bind( eventsManager );

	const eventName = 'open_connect_page';
	const eventData = {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'page_load',
	};

	dispatchEvent?.( eventName, eventData );
};

// --- Pro Install ---
window.trackProInstallEvent = function() {
	if ( ! window.elementorCommon?.config?.experimentalFeatures?.editor_events ) {
		return;
	}

	const eventsManager = window.elementorCommon?.eventsManager || {};
	const dispatchEvent = eventsManager.dispatchEvent?.bind( eventsManager );

	const eventName = 'pro_install';
	const eventData = {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'click',
	};

	dispatchEvent?.( eventName, eventData );
};

// --- Attach handlers ---
document.addEventListener( 'DOMContentLoaded', () => {
	// Page load event
	window.trackOpenConnectPageEvent();

	// Upgrade button click
	const upgradeButton = document.querySelector( '.button-upgrade' );
	if ( upgradeButton ) {
		upgradeButton.addEventListener( 'click', () => {
			window.trackUpgradeNowClickEvent();
		} );
	}

	// Connect button click
	const connectButton = document.querySelector( '.elementor-license-box .button-primary[href*="elementor-connect-account"]' );
	if ( connectButton ) {
		connectButton.addEventListener( 'click', () => {
			window.trackConnectAccountEvent();
		} );
	}

	// Pro install / activate button click
	const proInstallButton = document.querySelector( '.elementor-license-box .button-primary[href*="elementor_do_pro_install"]' );
	if ( proInstallButton ) {
		proInstallButton.addEventListener( 'click', () => {
			window.trackProInstallEvent();
		} );
	}
} );
