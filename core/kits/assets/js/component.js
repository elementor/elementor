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
				elementor.once( 'document:loaded', () => {
					$e.route( 'panel/global/style' );
				} );

				$e.run( 'editor/documents/open', {
					id: elementor.config.kit_id,
				} );
			},
			close: () => {
				$e.run( 'editor/documents/switch', {
					id: elementor.config.initial_document.id,
					onClose: () => {
						$e.components.get( 'panel/global' ).close();
						$e.route( 'panel/menu' );
					},
				} );
			},
			exit: () => {
				$e.run( 'editor/documents/close', {
					id: elementor.config.kit_id,
				} )
					.then( () => {
						location = elementor.config.document.urls.exit_to_dashboard;
				} );
			},
		};
	}

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
