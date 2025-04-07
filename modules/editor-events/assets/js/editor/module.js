import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( elementor.config.editor_events?.can_send_events ) {
			mixpanel.init( elementor.config.editor_events?.token, { persistence: 'localStorage' } );

			const userId = elementorCommon.config.library_connect?.user_id;

			if ( userId ) {
				// const currentId = mixpanel.get_distinct_id();
				//
				// if (currentId !== userId) {
				// 	console.log("Aliasing:", currentId, "→", userId);
				// 	mixpanel.alias(userId, currentId);
				// }
				//
				// console.log('passed check');
				// const currentId = mixpanel.get_distinct_id();
				//
				// 	// If the current ID is different from user ID, use alias first then identify
					// 		// This connects the current anonymous ID with your user ID
					// mixpanel.alias( userId, currentId );

					// 		// Then identify as the user
				// mixpanel.reset();

				// console.log('Identifying as:', currentId,userId );

				mixpanel.identify( userId );

				//register_once?
				mixpanel.register( {
						'appType': 'Editor',
					} );

				const newId = mixpanel.get_distinct_id();
				console.log('New distinct ID after identify:', newId);
				console.log('Setting People properties');

				mixpanel.people.set_once( userId, {
						$name: 'Unknown',
						$last_login: new Date().toISOString()
					} );
				}
			}
	}


	dispatchEvent( name, data ) {
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		// move to register
		const eventData = {
			user_id: elementorCommon.config.library_connect?.user_id || null,
			subscription_id: elementor.config.editor_events?.subscription_id || null,
			url: elementor.config.editor_events?.site_url,
			wp_version: elementor.config.editor_events?.wp_version,
			client_id: elementor.config.editor_events?.site_key,
			app_version: elementor.config.editor_events?.elementor_version,
			site_language: elementor.config.editor_events?.site_language
		}


		mixpanel.track(
			name,{
				...eventData,
				data
			}
		);
	}
}
