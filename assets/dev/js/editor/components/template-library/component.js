import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import * as commands from './commands/';
import * as commandsData from './commands-data/';
import { SAVE_CONTEXTS } from './constants';
import { showGlobalStylesDialog } from './views/parts/global-styles-dialog';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

const TemplateLibraryLayoutView = require( 'elementor-templates/views/library-layout' );

export default class Component extends ComponentModalBase {
	__construct( args ) {
		super.__construct( args );

		// When switching documents update defaultTabs.
		elementor.on( 'document:loaded', this.onDocumentLoaded.bind( this ) );

		// Remove whole component cache data.
		$e.data.deleteCache( this, 'library' );

		elementor.channels.templates.on( 'quota:update', ( { force } = {} ) => {
			$e.components.get( 'cloud-library' ).utils.setQuotaConfig( force );
		} );
	}

	getNamespace() {
		return 'library';
	}

	defaultTabs() {
		return {
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
				title: __( 'Templates', 'elementor' ),
				getFilter: () => ( {
					source: elementor.templates.getSourceSelection() ?? 'local',
					view: elementor.templates.getViewSelection() ?? 'list',
				} ),
			},
		};
	}

	defaultRoutes() {
		const defaultRoutes = {
			import: () => {
				this.manager.layout.showImportView();
			},
			'save-template': ( args ) => {
				this.manager.layout.showSaveTemplateView( args.model, args.context ?? SAVE_CONTEXTS.SAVE );
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
			'view-folder': ( args ) => {
				this.manager.layout.showFolderView( args );
			},
		};

		return defaultRoutes;
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
		const currentTab = this.tabs[ tab ];
		const filter = currentTab.getFilter ? currentTab.getFilter() : currentTab.filter;

		this.trackLibraryNavigation( tab, currentTab.title );

		this.currentTab = tab;

		this.manager.setScreen( filter );
	}

	trackLibraryNavigation( tab, tabTitle ) {
		EditorOneEventManager.sendELibraryNav( tabTitle || tab );
	}

	activateTab( tab ) {
		$e.routes.saveState( 'library' );

		super.activateTab( tab );

		// Update ARIA attributes for accessibility
		const $tabsWrapper = jQuery( this.getTabsWrapperSelector() );
		const $tabs = $tabsWrapper.find( '[role="tab"]' );
		const $activeTab = $tabs.filter( `[data-tab="${ tab }"]` );

		const $templatesContainer = this.manager?.layout?.modalContent?.currentView?.$childViewContainer;

		$tabs.attr( {
			'aria-selected': 'false',
			tabindex: '-1',
		} );

		$activeTab.attr( {
			'aria-selected': 'true',
			tabindex: '0',
		} );

		if ( $templatesContainer?.length ) {
			$templatesContainer.attr( {
				role: 'tabpanel',
				'aria-labelledby': `tab-${ tab }`,
			} );
		}
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
			const model = callbackParams.model;
			const source = model.get( 'source' ) ?? 'local';
			const templateType = model.get( 'type' );
			const templateTitle = model.get( 'title' );
			const templateId = model.get( 'template_id' );
			const baseTier = elementor.config.library_connect?.base_access_tier;
			const templateTier = model.get( 'accessTier' );

			$e.run( 'document/elements/import', {
				model,
				data,
				options: callbackParams.importOptions,
				onAfter: () => {
					this.manager.eventManager.sendTemplateInsertedEvent( {
						library_type: source,
					} );

					EditorOneEventManager.sendELibraryInsert( {
						assetId: templateId,
						assetName: templateTitle,
						libraryType: templateType || source,
						proRequired: baseTier !== templateTier,
					} );
				},
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

		this.manager.layout.showLoadingView();

		const shouldFetchPageSettings = null === withPageSettings ? model.get( 'hasPageSettings' ) : withPageSettings;

		this.manager.requestTemplateContent( model.get( 'source' ), model.get( 'template_id' ), {
			data: {
				with_page_settings: shouldFetchPageSettings,
			},
			success: async ( data ) => {
				this.manager.layout.hideLoadingView();

				let processedData = data;

				if ( this.manager.hasGlobalStyles( data ) ) {
					try {
						const { mode } = await showGlobalStylesDialog();
						withPageSettings = 'match_site' === mode;

						this.manager.layout.showLoadingView();

						try {
							const result = await new Promise( ( resolve, reject ) => {
								elementorCommon.ajax.addRequest( 'process_global_styles', {
									data: {
										content: JSON.stringify( data.content ),
										import_mode: mode,
										global_classes: data.global_classes ? JSON.stringify( data.global_classes ) : null,
										global_variables: data.global_variables ? JSON.stringify( data.global_variables ) : null,
									},
									success: resolve,
									error: reject,
								} );
							} );

							processedData = {
								...data,
								content: result.content,
							};

							if ( result.updated_global_classes || result.updated_global_variables ) {
								window.dispatchEvent( new CustomEvent( 'elementor/global-styles/imported', {
									detail: {
										global_classes: result.updated_global_classes,
										global_variables: result.updated_global_variables,
									},
								} ) );
							}

							processedData.flattened_classes_count = result.flattened_classes_count || 0;
							processedData.flattened_variables_count = result.flattened_variables_count || 0;
						} catch ( ajaxError ) {
							this.manager.showErrorDialog( ajaxError );
							this.manager.layout.hideLoadingView();
							return;
						}

						this.manager.layout.hideLoadingView();
					} catch ( e ) {
						return;
					}
				}

				const importOptions = jQuery.extend( {}, this.manager.modalConfig.importOptions );

				importOptions.withPageSettings = withPageSettings;

				if ( null === withPageSettings && model.get( 'hasPageSettings' ) ) {
					const insertTemplateHandler = this.getImportSettingsDialog();
					insertTemplateHandler.showImportDialogWithData( model, processedData, importOptions, callback );
					return;
				}

				this.manager.layout.hideModal();

				this.showFlatteningWarningIfNeeded( processedData );

				callback( processedData, { model, importOptions } );
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
		const self = this;
		const InsertTemplateHandler = {
			dialog: null,

			showImportDialog( model ) {
				const dialog = InsertTemplateHandler.getDialog( model );

				dialog.onConfirm = function() {
					$e.run( 'library/insert-template', {
						model,
						withPageSettings: true,
						onAfter: () => {
							elementor.templates.eventManager.sendInsertApplySettingsEvent( {
								apply_modal_result: 'apply',
								library_type: model.get( 'source' ),
							} );
						},
					} );
				};

				dialog.onCancel = function() {
					$e.run( 'library/insert-template', {
						model,
						withPageSettings: false,
						onAfter: () => {
							elementor.templates.eventManager.sendInsertApplySettingsEvent( {
								apply_modal_result: `don't apply`,
								library_type: model.get( 'source' ),
							} );
						},
					} );
				};

				dialog.show();
			},

			showImportDialogWithData( model, data, importOptions, callback ) {
				const dialog = InsertTemplateHandler.getDialog( model );

				dialog.onConfirm = function() {
					importOptions.withPageSettings = true;
					elementor.templates.eventManager.sendInsertApplySettingsEvent( {
						apply_modal_result: 'apply',
						library_type: model.get( 'source' ),
					} );
					self.manager.layout.hideModal();
					callback( data, { model, importOptions } );
				};

				dialog.onCancel = function() {
					importOptions.withPageSettings = false;
					elementor.templates.eventManager.sendInsertApplySettingsEvent( {
						apply_modal_result: `don't apply`,
						library_type: model.get( 'source' ),
					} );
					self.manager.layout.hideModal();
					callback( data, { model, importOptions } );
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

	showFlatteningWarningIfNeeded( result ) {
		const flattenedClassesCount = result.flattened_classes_count || 0;
		const flattenedVariablesCount = result.flattened_variables_count || 0;

		if ( 0 === flattenedClassesCount && 0 === flattenedVariablesCount ) {
			return;
		}

		let message;

		if ( flattenedClassesCount > 0 && flattenedVariablesCount > 0 ) {
			message = __( 'Some styles were added as static values because the style limits were reached.', 'elementor' );
		} else if ( flattenedClassesCount > 0 ) {
			message = __( 'Some styles were added as static values because the class limit was reached.', 'elementor' );
		} else {
			message = __( 'Some styles were added as static values because the variable limit was reached.', 'elementor' );
		}

		elementor.notifications.showToast( {
			message,
		} );
	}
}
