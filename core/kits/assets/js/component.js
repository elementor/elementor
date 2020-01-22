import EnqueueFonts from './hooks/ui/enqueue-fonts';

export default class extends elementorModules.common.Component {
	pages = {};

	getNamespace() {
		return 'panel/global';
	}

	registerAPI() {
		super.registerAPI();

		new EnqueueFonts();
	}

	defaultRoutes() {
		return {
			style: () => this.renderContent( 'style' ),
		};
	}

	defaultCommands() {
		return {
			open: () => {
				const kit = elementor.documents.get( elementor.config.kit_id );

				if ( kit && 'open' === kit.editor.status ) {
					$e.route( 'panel/global/style' );
					return;
				}

				$e.routes.clearHistory( this.getRootContainer() );
				this.toggleHistoryClass();

				$e.run( 'editor/documents/switch', {
					id: elementor.config.kit_id,
				} );
			},
			close: () => {
				$e.run( 'editor/documents/switch', {
					id: elementor.config.initial_document.id,
					onClose: () => {
						$e.components.get( 'panel/global' ).close();
						$e.routes.clearHistory( this.getRootContainer() );
					},
				} );
			},
			exit: () => {
				$e.run( 'editor/documents/close', {
					id: elementor.config.kit_id,
					onClose: ( document ) => {
						location = document.config.urls.exit_to_dashboard;
					},
				} );
			},
			back: () => {
				$e.routes.back( 'panel' );
			},
		};
	}

	defaultShortcuts() {
		return {
			back: {
				keys: 'esc',
				scopes: [ 'panel/global' ],
			},
		};
	}

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
