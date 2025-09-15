import { getMixpanel } from '@elementor/mixpanel';

export const trackOpenConnectPageEvent = () => {
	const { dispatchEvent, config } = getMixpanel();

	if ( ! elementorCommon?.config?.experimentalFeatures?.editor_events ) {
		return;
	}

	const eventName = 'open_connect_page';

	dispatchEvent?.( eventName, {
		app_type: 'editor',
		location: config?.locations?.wpAdmin || 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: config?.triggers?.pageload || 'page_load',
	} );
};

export const trackUpgradeNowClickEvent = () => {
	const { dispatchEvent, config } = getMixpanel();

	if ( ! elementorCommon?.config?.experimentalFeatures?.editor_events ) {
		return;
	}

	const eventName = 'upgrade_now_click';
	const payload = {
		app_type: 'editor',
		location: 'Elementor WP-admin pages',
		secondaryLocation: 'Connect account page',
		trigger: config?.triggers?.click || 'click',
	};

	console.log( '[Mixpanel debugaaaaaaaaaaaaa]', eventName, payload );
	dispatchEvent?.( eventName, payload );
};
