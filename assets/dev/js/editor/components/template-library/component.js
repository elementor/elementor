import ComponentModal from 'elementor-api/modules/component-modal';

const TemplateLibraryLayoutView = require( 'elementor-templates/views/library-layout' );

export default class Component extends ComponentModal {
	__construct( args ) {
		// Before construct because it's used in defaultTabs().
		this.docLibraryConfig = elementor.config.document.remoteLibrary;

		super.__construct( args );

		if ( 'block' === this.docLibraryConfig.type ) {
			this.setDefaultRoute( 'templates/blocks' );
		} else {
			this.setDefaultRoute( 'templates/pages' );
		}
	}

	getNamespace() {
		return 'library';
	}

	defaultTabs() {
		return {
			'templates/blocks': {
				title: elementor.translate( 'blocks' ),
				filter: {
					source: 'remote',
					type: 'block',
					subtype: this.docLibraryConfig.category,
				},
			},
			'templates/pages': {
				title: elementor.translate( 'pages' ),
				filter: {
					source: 'remote',
					type: 'page',
				},
			},
			'templates/my-templates': {
				title: elementor.translate( 'my_templates' ),
				filter: {
					source: 'local',
				},
			},
		};
	}

	defaultRoutes() {
		return {
			import: () => {
				this.manager.layout.showImportView();
			},

			'save-template': ( args ) => {
				this.manager.layout.showSaveTemplateView( args.model );
			},
			preview: ( args ) => {
				this.manager.layout.showPreviewView( args.model );
			},
			connect: ( args ) => {
				args.texts = {
					title: elementor.translate( 'library/connect:title' ),
					message: elementor.translate( 'library/connect:message' ),
					button: elementor.translate( 'library/connect:button' ),
				};

				this.manager.layout.showConnectView( args );
			},
		};
	}

	defaultCommands() {
		return Object.assign( super.defaultCommands(), {
			open: this.show,
			'insert-template': this.insertTemplate,
		} );
	}

	defaultShortcuts() {
		return {
			open: {
				keys: 'ctrl+shift+l',
			},
		};
	}

	renderTab( tab ) {
		this.manager.setScreen( this.tabs[ tab ].filter );
	}

	activateTab( tab ) {
		$e.routes.saveState( 'library' );

		super.activateTab( tab );
	}

	open() {
		super.open();

		if ( ! this.manager.layout ) {
			this.manager.layout = this.layout;
		}

		this.manager.layout.setHeaderDefaultParts();

		return true;
	}

	close() {
		if ( ! super.close() ) {
			return false;
		}

		this.manager.modalConfig = {};

		return true;
	}

	show( args ) {
		this.manager.modalConfig = args;

		if ( args.toDefault || ! $e.routes.restoreState( 'library' ) ) {
			$e.route( this.getDefaultRoute() );
		}
	}

	insertTemplate( args ) {
		const autoImportSettings = elementor.config.document.remoteLibrary.autoImportSettings,
			model = args.model;

		let { withPageSettings = null } = args;

		if ( autoImportSettings ) {
			withPageSettings = true;
		}

		if ( null === withPageSettings && model.get( 'hasPageSettings' ) ) {
			const insertTemplateHandler = this.getImportSettingsDialog();

			insertTemplateHandler.showImportDialog( model );

			return;
		}

		this.manager.layout.showLoadingView();

		this.manager.requestTemplateContent( model.get( 'source' ), model.get( 'template_id' ), {
			data: {
				with_page_settings: withPageSettings,
			},
			success: ( data ) => {
				// Clone the `modalConfig.importOptions` because it deleted during the closing.
				const importOptions = jQuery.extend( {}, this.manager.modalConfig.importOptions );

				importOptions.withPageSettings = withPageSettings;

				// Hide for next open.
				this.manager.layout.hideLoadingView();

				this.manager.layout.hideModal();

				$e.run( 'document/elements/import', {
					model,
					data,
					options: importOptions,
				} );
			},
			error: ( data ) => {
				this.manager.showErrorDialog( data );
			},
			complete: () => {
				this.manager.layout.hideLoadingView();
			},
		} );
	}

	getImportSettingsDialog() {
		// Moved from ./behaviors/insert-template.js
		const InsertTemplateHandler = {
			dialog: null,

			showImportDialog: function( model ) {
				var dialog = InsertTemplateHandler.getDialog();

				dialog.onConfirm = function() {
					$e.run( 'library/insert-template', {
						model,
						withPageSettings: true,
					} );
				};

				dialog.onCancel = function() {
					$e.run( 'library/insert-template', {
						model,
						withPageSettings: false,
					} );
				};

				dialog.show();
			},

			initDialog: function() {
				InsertTemplateHandler.dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
					id: 'elementor-insert-template-settings-dialog',
					headerMessage: elementor.translate( 'import_template_dialog_header' ),
					message: elementor.translate( 'import_template_dialog_message' ) + '<br>' + elementor.translate( 'import_template_dialog_message_attention' ),
					strings: {
						confirm: elementor.translate( 'yes' ),
						cancel: elementor.translate( 'no' ),
					},
				} );
			},

			getDialog: function() {
				if ( ! InsertTemplateHandler.dialog ) {
					InsertTemplateHandler.initDialog();
				}

				return InsertTemplateHandler.dialog;
			},
		};

		return InsertTemplateHandler;
	}

	getTabsWrapperSelector() {
		return '#elementor-template-library-header-menu';
	}

	getModalLayout() {
		return TemplateLibraryLayoutView;
	}
}
