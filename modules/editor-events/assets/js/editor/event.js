import { v4 as uuidv4 } from 'uuid';

export default class Event {
	constructor( data ) {
		const time = Date.now();

		this.setupMetadata( time );
		this.setupPayload( data, time );
	}

	setupPayload( extraData, time ) {
		this.payload = {
			elementor_api_id: '',
			userId: null,
			subscriptionId: elementor.config.editor_events?.subscription_id,
			url: elementor.config.editor_events?.site_url,
			extra_data: extraData,
			siteInfo: {
				WpVersion: elementor.config.editor_events?.wp_version,
				ClientId: elementor.config.editor_events?.site_key,
				AppVersion: elementor.config.editor_events?.elementor_version,
				UserAgent: elementor.config.editor_events?.user_agent,
				SiteLanguage: elementor.config.editor_events?.site_language,
			},
			created_at: time,
		};
	}

	setupMetadata( time ) {
		this.metadata = {
			type: 'editor_events',
			action: 'new/log/update',
			time,
			schema_id: 1,
			version: 1,
			publisher_version: elementor.config.editor_events?.elementor_version,
			guid: uuidv4(),
		};
	}
}
