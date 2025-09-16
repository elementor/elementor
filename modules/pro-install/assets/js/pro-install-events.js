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

document.addEventListener( 'DOMContentLoaded', () => {
	window.trackOpenConnectPageEvent();

	const upgradeButton = document.querySelector( '.button-upgrade' );
	if ( upgradeButton ) {
		upgradeButton.addEventListener( 'click', window.trackUpgradeNowClickEvent );
	}

	const connectButton = document.querySelector( '.elementor-license-box .button-primary[href*="elementor-connect-account"]' );
	if ( connectButton ) {
		connectButton.addEventListener( 'click', window.trackConnectAccountEvent );
	}

	const proInstallButton = document.querySelector( '.elementor-license-box .button-primary[href*="elementor_do_pro_install"]' );
	if ( proInstallButton ) {
		proInstallButton.addEventListener( 'click', window.trackProInstallEvent );
	}
} );
