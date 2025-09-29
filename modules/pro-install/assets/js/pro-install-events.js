function getDispatchEvent() {
	const isEnabled = window.elementorCommon?.config?.experimentalFeatures?.editor_events;
	if ( ! isEnabled ) {
		return null;
	}

	const eventsManager = window.elementorCommon?.eventsManager;
	return eventsManager?.dispatchEvent?.bind( eventsManager ) || null;
}

function trackEditorEvent( eventName, eventData ) {
	const dispatchEvent = getDispatchEvent();
	if ( ! dispatchEvent ) {
		return;
	}

	dispatchEvent( eventName, eventData );
}

window.trackUpgradeNowClickEvent = function() {
	trackEditorEvent( 'upgrade_subscription', {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'click',
	} );
};

window.trackConnectAccountEvent = function( event ) {
	event.preventDefault();

	trackEditorEvent( 'connect_account', {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'click',
	} );

	setTimeout( () => {
		window.location.href = event.target.href;
	}, 200 );
};

window.trackOpenConnectPageEvent = function() {
	trackEditorEvent( 'open_connect_page', {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'page_load',
	} );
};

window.trackProInstallEvent = function() {
	trackEditorEvent( 'pro_install', {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: 'click',
	} );
};

// Attach events on DOM ready
document.addEventListener( 'DOMContentLoaded', () => {
	window.trackOpenConnectPageEvent();

	const upgradeButton = document.querySelector( '.elementor-pro-connect-promotion .elementor-box-action .button-upgrade' );

	if ( upgradeButton ) {
		upgradeButton.addEventListener( 'click', window.trackUpgradeNowClickEvent );
	}

	const connectButton = document.querySelector( '.elementor-license-box .button-primary[href*="elementor-connect"]' );
	if ( connectButton ) {
		connectButton.addEventListener( 'click', window.trackConnectAccountEvent );
	}

	const proInstallButton = document.querySelector( '.elementor-license-box .button-primary[href*="elementor_do_pro_install"]' );
	if ( proInstallButton ) {
		proInstallButton.addEventListener( 'click', window.trackProInstallEvent );
	}
} );
