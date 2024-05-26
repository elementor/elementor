export default class Event {
	constructor( data ) {
		this.user_id = null;
		this.subscription_id = elementor.config.editor_events?.subscription_id;
		this.url = elementor.config.editor_events?.site_url;
		this.extra_data = JSON.stringify( data );
		this.site_info = JSON.stringify( this.getSiteInfo() );
		this.created_at = Date.now();
	}

	getSiteInfo() {
		return {
			WpVersion: elementor.config.editor_events?.wp_version,
			ClientId: elementor.config.editor_events?.site_key,
			AppVersion: elementor.config.editor_events?.elementor_version,
			UserAgent: elementor.config.editor_events?.user_agent,
			SiteLanguage: elementor.config.editor_events?.site_language,
		};
	}
}
