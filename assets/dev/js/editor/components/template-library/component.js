import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import * as commands from './commands/';
import * as commandsData from './commands-data/';

const TemplateLibraryLayoutView = require( 'elementor-templates/views/library-layout' );

export default class Component extends ComponentModalBase {
	__construct( args ) {
		super.__construct( args );

		// When switching documents update defaultTabs.
		elementor.on( 'document:loaded', this.onDocumentLoaded.bind( this ) );

		// Remove whole component cache data.
		$e.data.deleteCache( this, 'library' );
	}

	getNamespace() {
		return 'library';
	}

	defaultTabs() {
		const tabs = {
			'templates/blocks': {
				title: __( 'Blocks', 'elementor' ),
				getFilter: () => ( {
					source: 'remote',
					type: 'block',
					subtype: elementor.config.document.remoteLibrary.category,
				} ),
			},
			'templates/pages': {
				title: __( 'Pages', 'elementor' ),
				filter: {
					source: 'remote',
					type: 'page',
				},
			},
			'templates/my-templates': {
				title: __( 'My Templates', 'elementor' ),
				filter: {
					source: 'local',
				},
			},
		};

		if ( elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ] ) {
			tabs[ 'templates/cloud-library' ] = {
				title: __( 'Cloud Library', 'elementor' ),
				filter: {
					source: 'cloud',
				},
			};
		}

		return tabs;
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
					title: __( 'Connect to Template Library', 'elementor' ),
					message: __( 'Access this template and our entire library by creating a free personal account', 'elementor' ),
					button: __( 'Get Started', 'elementor' ),
				};

				this.manager.layout.showConnectView( args );
			},
		};
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			... modalCommands,
			... this.importCommands( commands ),
		};
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	defaultShortcuts() {
		return {
			open: {
				keys: 'ctrl+shift+l',
			},
		};
	}

	onDocumentLoaded( document ) {
		this.setDefaultRoute( document.config.remoteLibrary.default_route );

		this.maybeOpenLibrary();
	}

	renderTab( tab ) {
		const currentTab = this.tabs[ tab ],
			filter = currentTab.getFilter ? currentTab.getFilter() : currentTab.filter;

		this.manager.setScreen( filter );
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

	// TODO: Move function to 'insert-template' command.
	insertTemplate( args ) {
		this.downloadTemplate( args, ( data, callbackParams ) => {
			$e.run( 'document/elements/import', {
				model: callbackParams.model,
				data,
				options: callbackParams.importOptions,
			} );
		} );
	}

	downloadTemplate( args, callback ) {
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

				callback( data, { model, importOptions } );
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

			showImportDialog( model ) {
				const dialog = InsertTemplateHandler.getDialog( model );

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

			initDialog( model ) {
				InsertTemplateHandler.dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
					id: 'elementor-insert-template-settings-dialog',
					/* Translators: %s is the type content */
					headerMessage: __( 'Apply the settings of this %s too?', 'elementor' ).replace( '%s', elementor.translate( model.attributes.type ) ),
					/* Translators: %s is the type content */
					message: __( 'This will override the design, layout, and other settings of the %s you’re working on.', 'elementor' ).replace( '%s', elementor.documents.getCurrent().container.label ),
					strings: {
						confirm: __( 'Apply', 'elementor' ),
						cancel: __( 'Don’t apply', 'elementor' ),
					},
				} );
			},

			getDialog( model ) {
				if ( ! InsertTemplateHandler.dialog ) {
					InsertTemplateHandler.initDialog( model );
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

	maybeOpenLibrary() {
		if ( '#library' === location.hash ) {
			$e.run( 'library/open' );

			location.hash = '';
		}
	}
}
