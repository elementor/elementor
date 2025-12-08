import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';
import { TIERS } from 'elementor-utils/tiers';

export default class extends elementorModules.Module {
	trackingEnabled = false;
	onInit() {
		this.config = eventsConfig;

		mixpanel.init( elementorCommon.config.editor_events?.token, { persistence: 'localStorage', autocapture: false } );

		if ( elementorCommon.config.editor_events?.can_send_events ) {
			this.enableTracking();
		}
	}

	enableTracking() {
		const userId = elementorCommon.config.library_connect?.user_id;

		if ( userId ) {
			mixpanel.identify( userId );

			mixpanel.register( {
				appType: 'Editor',
			} );

			mixpanel.people.set_once( {
				$user_id: userId,
				$last_login: new Date().toISOString(),
				$plan_type: elementorCommon.config.library_connect?.plan_type || TIERS.free,
			} );
		}

		this.trackingEnabled = true;
	}

	dispatchEvent( name, data, options = {} ) {
		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			return;
		}

		if ( ! this.trackingEnabled ) {
			this.enableTracking();
		}

		const eventData = {
			user_id: elementorCommon.config.library_connect?.user_id || null,
			subscription_id: elementorCommon.config.editor_events?.subscription_id || null,
			user_tier: elementorCommon.config.library_connect?.current_access_tier || null,
			url: elementorCommon.config.editor_events?.site_url,
			wp_version: elementorCommon.config.editor_events?.wp_version,
			client_id: elementorCommon.config.editor_events?.site_key,
			app_version: elementorCommon.config.editor_events?.elementor_version,
			site_language: elementorCommon.config.editor_events?.site_language,
			...data,
		};

		mixpanel.track( name, eventData, options );
	}
}
