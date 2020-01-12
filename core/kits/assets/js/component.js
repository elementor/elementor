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
			'kit-settings': () => this.renderContent( 'settings' ),
		};
	}

	defaultCommands() {
		return {
			open: () => {
				$e.run( 'editor/documents/open', {
					id: elementor.config.kit_id,
					onAfter: () => {
						$e.route( 'panel/global/style' );
					},
				} );
			},
			close: () => {
				$e.run( 'editor/documents/close', {
					id: elementor.config.kit_id,
					onClose: () => {
						$e.components.get( 'panel/global' ).close();
						$e.route( 'panel/menu' );
					},
				} );
			},
		};
	}

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
