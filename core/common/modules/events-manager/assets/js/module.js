import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( elementorCommon.config.editor_events?.can_send_events ) {
			mixpanel.init( elementorCommon.config.editor_events?.token, { persistence: 'localStorage' } );

			const userId = elementorCommon.config.library_connect?.user_id;

			if ( userId ) {
				mixpanel.identify( userId );

				mixpanel.register( {
					appType: 'Editor',
				} );

				mixpanel.people.set_once( {
					$user_id: userId,
					$last_login: new Date().toISOString(),
				} );
			}
		}
	}

	dispatchEvent( name, data ) {
		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			return;
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

		mixpanel.track(
			name, {
				...eventData,
			},
		);
	}
}
