export default class extends elementorModules.common.Component {
	pages = {};
	saveKitDialog;

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

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}

	close( args ) {
		if ( ! args || ! args.force ) {
			this.getSaveKitDialog().show();
			return;
		}

		$e.run( args.action, {
			container: this.manager.container,
			onAfter: () => {
				super.close();
				$e.route( 'panel/menu' );
			},
		} );
	}

	getSaveKitDialog() {
		if ( ! this.saveKitDialog ) {
			this.saveKitDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
					id: 'elementor-save-kit-dialog',
					headerMessage: elementor.translate( 'Save Kit Changes' ),
					message: elementor.translate( 'Notice: The changes you made will effect your entire site.' ),
					position: {
						my: 'center center',
						at: 'center center',
					},
					strings: {
						confirm: elementor.translate( 'Apply' ),
						cancel: elementor.translate( 'Discard' ),
					},
				onConfirm: () => {
					this.close( { action: 'document/save', force: true } );
				},
				onCancel: () => {
					this.close( { action: 'document/discard', force: true } );
				},
				} );
		}

		return this.saveKitDialog;
	}
}
