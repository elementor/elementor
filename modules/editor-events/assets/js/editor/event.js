export default class Event {
	appType = 'Editor';

	constructor( data ) {
		this.user_id = null;
		this.subscription_id = elementor.config.editor_events?.subscription_id;
		this.url = elementor.config.editor_events?.site_url;
		this.WpVersion = elementor.config.editor_events?.wp_version;
		this.ClientId = elementor.config.editor_events?.site_key;
		this.AppVersion = elementor.config.editor_events?.elementor_version;
		this.SiteLanguage = elementor.config.editor_events?.site_language;

		this.attachData( data );
	}

	attachData( data ) {
		for ( const key in data ) {
			this[ key ] = data[ key ];
		}
	}
}
