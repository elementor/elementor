import { v4 as uuidv4 } from 'uuid';

export default class Event {
	constructor( data ) {
		const time = Date.now();

		this.setupMetadata( time );
		this.setupPayload( data, time );
	}

	setupPayload( extraData, time ) {
		this.payload = {
			elementor_api_id: null,
			userId: null,
			subscriptionId: null,
			url: '',
			extra_data: extraData,
			siteInfo: {
				WpVersion: '6.4.0',
				ClientId: 'MB2AwfxjtPtzIRvkRgzPAsBL21ge4TD5',
				AppVersion: '1.0.1',
				UserAgent: 'WordPress/6.4.0; http://www.wp.com',
				SiteLanguage: '',
			},
			created_at: time,
		};
	}

	setupMetadata( time ) {
		this.metadata = {
			type: 'editor_events',
			action: 'new/log/update',
			time,
			schema_id: 12,
			version: 1,
			publisher_version: '20.0',
			guid: uuidv4(),
		};
	}
}
