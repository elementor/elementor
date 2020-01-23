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
					return jQuery.Deferred().resolve();
				}

				$e.routes.clearHistory( this.getRootContainer() );
				this.toggleHistoryClass();

				return $e.run( 'editor/documents/switch', {
					id: elementor.config.kit_id,
				} );
			},
			close: () => {
				// The kit is opened directly.
				if ( elementor.config.initial_document.id === parseInt( elementor.config.kit_id ) ) {
					return $e.run( 'panel/global/exit' );
				}

				return $e.run( 'editor/documents/switch', {
					id: elementor.config.initial_document.id,
					onClose: () => {
						$e.components.get( 'panel/global' ).close();
						$e.routes.clearHistory( this.getRootContainer() );
					},
				} );
			},
			exit: () => {
				return $e.run( 'editor/documents/close', {
					id: elementor.config.kit_id,
					onClose: ( document ) => {
						location = document.config.urls.exit_to_dashboard;
					},
				} );
			},
			back: ( event ) => {
				const panelHistory = $e.routes.getHistory( 'panel' );

				// Don't go back if no where.
				if ( 1 === panelHistory.length ) {
					this.getCloseConfirmDialog( event ).show();
					return;
				}

				return $e.routes.back( 'panel' );
			},
		};
	}

	defaultShortcuts() {
		return {
			back: {
				keys: 'esc',
				scopes: [ 'panel' ],
				dependency: () => {
					return elementor.documents.isCurrent( elementor.config.kit_id ) && ! jQuery( '.dialog-widget:visible' ).length;
				},
			},
		};
	}

	getCloseConfirmDialog( event ) {
		if ( ! this.confirmDialog ) {
			const modalOptions = {
				id: 'elementor-kit-warn-on-close',
				headerMessage: elementor.translate( 'Exit' ),
				message: elementor.translate( 'Would you like to exit?' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: elementor.translate( 'Exit' ),
					cancel: elementor.translate( 'Cancel' ),
				},
				onConfirm: () => {
					$e.run( 'panel/global/close' );
				},
			};

			this.confirmDialog = elementorCommon.dialogsManager.createWidget( 'confirm', modalOptions );
		}

		this.confirmDialog.setSettings( 'hide', {
			onEscKeyPress: ! event,
		} );

		return this.confirmDialog;
	}

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
