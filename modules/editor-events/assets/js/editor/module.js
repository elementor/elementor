import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( elementor.config.editor_events?.can_send_events ) {
			mixpanel.init( elementor.config.editor_events?.token, { persistence: 'localStorage' } );

			const userId = elementor.config.library_connect?.user_id;

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
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		const eventData = {
			user_id: elementorCommon.config.library_connect?.user_id || null,
			subscription_id: elementor.config.editor_events?.subscription_id || null,
			user_tier: elementor.config.library_connect?.current_access_tier || null,
			url: elementor.config.editor_events?.site_url,
			wp_version: elementor.config.editor_events?.wp_version,
			client_id: elementor.config.editor_events?.site_key,
			app_version: elementor.config.editor_events?.elementor_version,
			site_language: elementor.config.editor_events?.site_language,
			...data,
		};

		mixpanel.track(
			name, {
				...eventData,
			},
		);
	}
}
