export default class extends elementorModules.common.Component {
	pages = {};

	getNamespace() {
		return 'panel/global';
	}

	defaultRoutes() {
		return {
			style: () => this.renderContent( 'style' ),
			'theme-templates': () => this.renderContent( 'theme_templates' ),
			'site-settings': () => this.renderContent( 'site_settings' ),
		};
	}

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
