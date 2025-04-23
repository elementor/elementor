import Component from './component';
import LocalStorage from 'elementor-api/core/data/storages/local-storage';
import { SAVE_CONTEXTS } from './constants';

const TemplateLibraryCollection = require( 'elementor-templates/collections/templates' );

const TemplateLibraryManager = function() {
	this.modalConfig = {};

	const self = this,
		templateTypes = {},
		storage = new LocalStorage(),
		storageKeyPrefix = 'my_templates_',
		sourceKey = 'source',
		viewKey = 'view',
		bulkSelectedItems = new Set(),
		lastDeletedItems = new Set();

	let deleteDialog,
		errorDialog,
		templatesCollection,
		config = {},
		filterTerms = {},
		isLoading = false,
		total = 0,
		toastConfig = { show: false, options: {} };

	const registerDefaultTemplateTypes = function() {
		var data = self.getDefaultTemplateTypeData();

		const translationMap = {
			page: __( 'Page', 'elementor' ),
			section: __( 'Section', 'elementor' ),
			container: __( 'Container', 'elementor' ),
			'e-div-block': __( 'Div Block', 'elementor' ),
			'e-flexbox': __( 'Flexbox', 'elementor' ),

			[ elementor.config.document.type ]: elementor.config.document.panel.title,
		};

		jQuery.each( translationMap, function( type, title ) {
			var safeData = jQuery.extend( true, {}, data, self.getDefaultTemplateTypeSafeData( title ) );

			self.registerTemplateType( type, safeData );
		} );
	};

	const registerDefaultFilterTerms = function() {
		filterTerms = {
			text: {
				callback( value ) {
					value = value.toLowerCase();

					if ( this.get( 'title' ).toLowerCase().indexOf( value ) >= 0 ) {
						return true;
					}

					return _.any( this.get( 'tags' ), function( tag ) {
						return tag.toLowerCase().indexOf( value ) >= 0;
					} );
				},
			},
			type: {},
			subtype: {},
			favorite: {},
		};
	};

	this.isLoading = () => isLoading;

	this.canLoadMore = () => {
		if ( ! templatesCollection ) {
			return false;
		}

		return templatesCollection.length < total;
	};

	this.init = function() {
		registerDefaultTemplateTypes();

		registerDefaultFilterTerms();

		this.component = $e.components.register( new Component( { manager: this } ) );

		elementor.addBackgroundClickListener( 'libraryToggleMore', {
			element: '.elementor-template-library-template-more',
		} );

		window.addEventListener( 'message', ( message ) => {
			const { data } = message;

			if ( ! data.name || data.name !== 'library/capture-screenshot-done' ) {
				return;
			}

			const template = templatesCollection.models.find( ( templateModel ) => {
				return templateModel.get( 'template_id' ) === parseInt( data.id );
			} );

			if ( ! template ) {
				return null;
			}

			template.set( 'preview_url', data.imageUrl );
		} );

		this.handleKeydown = ( event ) => {
			if ( this.isSelectAllShortcut( event ) && this.isCloudGridView() ) {
				event.preventDefault();
				this.selectAllTemplates();
			}

			if ( this.isUndoShortCut( event ) && lastDeletedItems.size ) {
				this.restoreRemovedItems();
			}
		};

		document.addEventListener( 'keydown', this.handleKeydown );
	};

	this.getDefaultTemplateTypeData = function() {
		return {
			saveDialog: {
				description: __( 'Your designs will be available for export and reuse on any page or website', 'elementor' ),
				icon: '<i class="eicon-library-upload" aria-hidden="true"></i>',
				canSaveToCloud: elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ],
			},
			moveDialog: {
				icon: '<i class="eicon-library-move" aria-hidden="true"></i>',
				canSaveToCloud: elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ],
			},
			copyDialog: {
				icon: '<i class="eicon-library-copy" aria-hidden="true"></i>',
				canSaveToCloud: elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ],
			},
			bulkMoveDialog: {
				title: __( 'Move templates to a different location', 'elementor' ),
				icon: '<i class="eicon-library-move" aria-hidden="true"></i>',
				canSaveToCloud: elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ],
			},
			bulkCopyDialog: {
				title: __( 'Copy templates to a different location', 'elementor' ),
				icon: '<i class="eicon-library-copy" aria-hidden="true"></i>',
				canSaveToCloud: elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ],
			},
			ajaxParams: {
				success( successData ) {
					$e.route( 'library/templates/my-templates', {
						onBefore: () => {
							if ( templatesCollection ) {
								const itemExist = templatesCollection.findWhere( {
									template_id: successData.template_id,
								} );

								if ( ! itemExist ) {
									templatesCollection.add( successData );
								}
							}
						},
					} );

					self.triggerQuotaUpdate();
				},
				error( errorData ) {
					self.showErrorDialog( errorData );
					self.clearToastConfig();
				},
			},
		};
	};

	this.getDefaultTemplateTypeSafeData = function( title ) {
		return {
			saveDialog: {
				/* Translators: %s: Template type. */
				title: sprintf( __( 'Save Your %s to Library', 'elementor' ), title ),
			},
			moveDialog: {
				/* Translators: %1$s and %2$s wrap "copy the template" with underline <u> tags */
				description: sprintf(
					__( 'Alternatively, you can %1$scopy the template%2$s.', 'elementor' ),
					'<u>', '</u>'
				),
				/* Translators: %s: Template type. */
				title: sprintf( __( 'Move your %s to a different location', 'elementor' ), title ),
			},
			copyDialog: {
				/* Translators: %1$s and %2$s wrap "move the template" with underline <u> tags */
				description: sprintf(
					__( 'Alternatively, you can %1$smove the template%2$s.', 'elementor' ),
					'<u>', '</u>'
				),
				/* Translators: %s: Template type. */
				title: sprintf( __( 'Copy your %s to a different location', 'elementor' ), title ),
			},
			bulkMoveDialog: {
				/* Translators: %1$s and %2$s wrap "copy the template" with underline <u> tags */
				description: sprintf(
					__( 'Alternatively, you can %1$scopy the templates%2$s.', 'elementor' ),
					'<u>', '</u>'
				),
			},
			bulkCopyDialog: {
				/* Translators: %1$s and %2$s wrap "move the template" with underline <u> tags */
				description: sprintf(
					__( 'Alternatively, you can %1$smove the templates%2$s.', 'elementor' ),
					'<u>', '</u>'
				),
			},
		};
	};

	this.isSelectAllShortcut = function( event ) {
		return ( event.metaKey || event.ctrlKey ) && 'a' === event.key;
	};

	this.isUndoShortCut = function( event ) {
		return ( event.metaKey || event.ctrlKey ) && 'z' === event.key;
	};

	this.isCloudGridView = function() {
		return 'cloud' === this.getFilter( 'source' ) && 'grid' === this.getViewSelection();
	};

	this.clearLastRemovedItems = function() {
		lastDeletedItems.clear();
	};

	this.addLastRemovedItems = function( ids ) {
		if ( ! Array.isArray( ids ) && ! ids.length ) {
			return;
		}

		ids.forEach( ( id ) => lastDeletedItems.add( id ) );
	};

	this.selectAllTemplates = function() {
		document.querySelectorAll( '.elementor-template-library-template[data-template_id]' ).forEach( ( element ) => {
			const templateId = element.getAttribute( 'data-template_id' );

			element.classList.add( 'bulk-selected-item' );
			this.addBulkSelectionItem( templateId );
		} );

		this.layout.handleBulkActionBar();
	};

	this.restoreRemovedItems = function() {
		this.onUndoDelete();
	};

	this.getSourceSelection = function() {
		return storage.getItem( storageKeyPrefix + sourceKey );
	};

	this.setSourceSelection = function( value ) {
		return storage.setItem( storageKeyPrefix + sourceKey, value );
	};

	this.getViewSelection = function() {
		return storage.getItem( storageKeyPrefix + viewKey );
	};

	this.setViewSelection = function( value ) {
		return storage.setItem( storageKeyPrefix + viewKey, value );
	};

	this.getTemplateTypes = function( type ) {
		if ( type ) {
			return templateTypes[ type ];
		}

		return templateTypes;
	};

	this.registerTemplateType = function( type, data ) {
		if ( templateTypes.hasOwnProperty( type ) ) {
			return;
		}

		templateTypes[ type ] = data;
	};

	this.deleteTemplate = function( templateModel, options ) {
		this.clearLastRemovedItems();

		var dialog = self.getDeleteDialog( templateModel );

		dialog.onConfirm = function() {
			if ( options.onConfirm ) {
				options.onConfirm();
			}

			const templateId = templateModel.get( 'template_id' );
			const source = templateModel.get( 'source' );

			elementorCommon.ajax.addRequest( 'delete_template', {
				data: {
					source,
					template_id: templateId,
				},
				success( response ) {
					templatesCollection.remove( templateModel );

					if ( 'cloud' === source ) {
						self.addLastRemovedItems( [ templateId ] );
					}

					if ( options.onSuccess ) {
						options.onSuccess( response );
					}

					self.layout.updateViewCollection( self.filterTemplates() );

					self.triggerQuotaUpdate();
					self.resetBulkActionBar();
				},
			} );
		};

		dialog.show();
	};

	this.renameTemplate = ( templateModel, options ) => {
		const originalTitle = templateModel.get( 'title' );

		this.clearLastRemovedItems();

		const dialog = this.getRenameDialog( templateModel );

		return new Promise( ( resolve ) => {
			dialog.onConfirm = () => {
				if ( options.onConfirm ) {
					options.onConfirm();
				}

				elementorCommon.ajax.addRequest( 'rename_template', {
					data: {
						source: templateModel.get( 'source' ),
						id: templateModel.get( 'template_id' ),
						title: templateModel.get( 'title' ),
					},
					success: ( response ) => {
						resolve( response );
					},
					error: ( error ) => {
						this.showErrorDialog( error );
						templateModel.set( 'title', originalTitle );
						resolve();
					},
				} );
			};
			dialog.show();
		} );
	};

	this.getRenameDialog = function( templateModel ) {
		const headerMessage = sprintf(
			// Translators: %1$s: Folder name, %2$s: Number of templates.
			__( 'Rename "%1$s"', 'elementor' ),
			templateModel.get( 'title' ),
		);

		const originalTitle = templateModel.get( 'title' );

		const $inputArea = jQuery( '<input>', {
			id: 'elementor-rename-template-dialog__input',
			type: 'text',
			value: templateModel.get( 'title' ),
		} )
			.attr( 'autocomplete', 'off' )
			.on( 'change', ( event ) => {
				event.preventDefault();
				templateModel.set( 'title', event.target.value );
			} );

		return elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-template-library-rename-dialog',
			headerMessage,
			message: $inputArea,
			strings: {
				confirm: __( 'Rename', 'elementor' ),
			},
			hide: {
				ignore: '#elementor-template-library-modal',
			},
			onCancel: () => {
				templateModel.set( 'title', originalTitle );
			},
			onShow: () => {
				$inputArea.trigger( 'focus' );
			},
		} );
	};

	this.getFolderTemplates = ( parentElement ) => {
		this.clearLastRemovedItems();

		const parentId = parentElement.model.get( 'template_id' );
		const parentTitle = parentElement.model.get( 'title' );

		return new Promise( ( resolve ) => {
			isLoading = true;
			const ajaxOptions = {
				data: {
					source: 'cloud',
					template_id: parentId,
				},
				success: ( data ) => {
					this.setFilter( 'orderby', '', true );
					this.setFilter( 'order', '', true );

					this.setFilter( 'parent', {
						id: parentId,
						title: parentTitle,
					} );

					templatesCollection = new TemplateLibraryCollection( data.templates );

					elementor.templates.layout.hideLoadingView();

					self.layout.updateViewCollection( templatesCollection.models );
					self.layout.modalContent.currentView.ui.addNewFolder.remove();
					self.layout.resetSortingUI();

					isLoading = false;
					resolve();
				},
				error: ( error ) => {
					isLoading = false;
					this.showErrorDialog( error );
				},
			};

			elementorCommon.ajax.addRequest( 'get_item_children', ajaxOptions );
		} );
	};

	this.createFolder = function( folderData, options ) {
		this.clearLastRemovedItems();

		if ( null !== this.getFilter( 'parent' ) ) {
			this.showErrorDialog( __( 'You can not create a folder inside another folder.', 'elementor' ) );

			return;
		}

		const dialog = this.getCreateFolderDialog( folderData );

		return new Promise( ( resolve ) => {
			dialog.onConfirm = async () => {
				await elementorCommon.ajax.addRequest( 'create_folder', {
					data: {
						source: folderData.source,
						title: folderData.title,
					},
					success: ( response ) => {
						resolve( response );

						options?.onSuccess();
					},
					error: ( error ) => {
						this.showErrorDialog( error );

						resolve();
					},
				} );
			};

			dialog.show();
		} );
	};

	this.getCreateFolderDialog = function( folderData ) {
		const paragraph = document.createElement( 'p' );
		paragraph.className = 'elementor-create-folder-template-dialog__p';
		paragraph.textContent = __( 'Save assets to reuse on any site in your account.', 'elementor' );

		const inputArea = document.createElement( 'input' );
		inputArea.className = 'elementor-create-folder-template-dialog__input';
		inputArea.type = 'text';
		inputArea.value = '';
		inputArea.placeholder = __( 'Folder name', 'elementor' );
		inputArea.autocomplete = 'off';

		inputArea.addEventListener( 'change', ( event ) => {
			event.preventDefault();

			folderData.title = event.target.value;
		} );

		const fragment = document.createDocumentFragment();
		fragment.appendChild( paragraph );
		fragment.appendChild( inputArea );

		return elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-template-library-create-new-folder-dialog',
			headerMessage: __( 'Create a new folder', 'elementor' ),
			message: fragment,
			strings: {
				confirm: __( 'Create', 'elementor' ),
			},
			hide: {
				ignore: '#elementor-template-library-modal',
			},
			onShow: () => {
				inputArea.focus();
			},
		} );
	};

	this.deleteFolder = function( templateModel, options ) {
		this.clearLastRemovedItems();

		const ajaxOptions = {
			data: {
				source: 'cloud',
				template_id: templateModel.get( 'template_id' ),
			},
			success: ( data ) => this.handleGetFolderDataSuccess( templateModel, options, data ),
		};

		elementorCommon.ajax.addRequest( 'get_item_children', ajaxOptions );
	};

	this.handleGetFolderDataSuccess = function( templateModel, options, data ) {
		const dialog = this.getDeleteFolderDialog( templateModel, data );

		dialog.onConfirm = () => {
			options.onConfirm?.();

			this.sendDeleteRequest( templateModel, options );
		};

		dialog.show();
	};

	this.getDeleteFolderDialog = function( templateModel, data ) {
		let deleteFolderDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-template-library-delete-dialog',
			headerMessage: __( 'Delete this folder?', 'elementor' ),
			message: sprintf(
				// Translators: %1$s: Folder name, %2$s: Number of templates.
				__( 'This will permanently delete %1$s that contains %2$d templates?', 'elementor' ),
				templateModel.get( 'title' ),
				data.total,
			),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
			},
		} );

		deleteFolderDialog.getElements( 'ok' ).addClass( 'e-danger color-white' );

		return deleteFolderDialog;
	};

	this.getBulkDeleteDialog = function() {
		let bulkDeleteDialog =  elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-template-library-bulk-delete-dialog',
			headerMessage: __( 'Delete items?', 'elementor' ),
			message: sprintf(
				// Translators: %1$s: Number of selected items.
				__( 'This will permanently remove %1$s selected items.', 'elementor' ),
				bulkSelectedItems.size,
			),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
			},
		} );

		bulkDeleteDialog.getElements( 'ok' ).addClass( 'e-danger color-white' );

		return bulkDeleteDialog;
	};

	this.sendDeleteRequest = function( templateModel, options ) {
		const templateId = templateModel.get( 'template_id' );

		elementorCommon.ajax.addRequest( 'delete_template', {
			data: {
				source: templateModel.get( 'source' ),
				template_id: templateId,
			},
			success: ( response ) => {
				self.addLastRemovedItems( [ templateId ] );
				templatesCollection.remove( templateModel, { silent: true } );
				options.onSuccess?.( response );

				this.triggerQuotaUpdate();
			},
		} );
	};

	/**
	 * @param {*}      model - Template model.
	 * @param {Object} args  - Template arguments.
	 * @deprecated since 2.8.0, use `$e.run( 'library/insert-template' )` instead.
	 */
	this.importTemplate = function( model, args = {} ) {
		this.clearLastRemovedItems();

		elementorDevTools.deprecation.deprecated( 'importTemplate', '2.8.0',
			"$e.run( 'library/insert-template' )" );

		args.model = model;

		$e.run( 'library/insert-template', args );
	};

	this.saveTemplate = function( type, data ) {
		this.clearLastRemovedItems();

		var templateType = templateTypes[ type ];

		_.extend( data, {
			source: data.source ?? 'local',
			type,
		} );

		if ( templateType.prepareSavedData ) {
			data = templateType.prepareSavedData( data );
		}

		data.content = JSON.stringify( data.content );

		var ajaxParams = { data };

		if ( templateType.ajaxParams ) {
			_.extend( ajaxParams, templateType.ajaxParams );
		}

		elementorCommon.ajax.addRequest( this.getSaveAjaxAction( data.save_context ), ajaxParams );
	};

	this.getSaveAjaxAction = function( saveContext ) {
		this.clearLastRemovedItems();

		const saveActions = {
			[ SAVE_CONTEXTS.SAVE ]: 'save_template',
			[ SAVE_CONTEXTS.MOVE ]: 'move_template',
			[ SAVE_CONTEXTS.COPY ]: 'copy_template',
			[ SAVE_CONTEXTS.BULK_MOVE ]: 'bulk_move_templates',
			[ SAVE_CONTEXTS.BULK_COPY ]: 'bulk_copy_templates',
		};

		return saveActions[ saveContext ] ?? 'save_template';
	};

	this.requestTemplateContent = function( source, id, ajaxOptions ) {
		this.clearLastRemovedItems();

		var options = {
			unique_id: id,
			data: {
				source,
				edit_mode: true,
				display: true,
				template_id: id,
			},
		};

		if ( ajaxOptions ) {
			jQuery.extend( true, options, ajaxOptions );
		}

		return elementorCommon.ajax.addRequest( 'get_template_data', options );
	};

	this.markAsFavorite = function( templateModel, favorite ) {
		this.clearLastRemovedItems();

		var options = {
			data: {
				source: templateModel.get( 'source' ),
				template_id: templateModel.get( 'template_id' ),
				favorite,
			},
		};

		return elementorCommon.ajax.addRequest( 'mark_template_as_favorite', options );
	};

	this.getDeleteDialog = function( templateModel ) {
		if ( ! deleteDialog ) {
			deleteDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-template-library-delete-dialog',
				headerMessage: __( 'Delete this template?', 'elementor' ),
				message: sprintf(
					// Translators: %1$s: Template name.
					__( 'This will permanently remove %1$s.', 'elementor' ),
					templateModel.get( 'title' ),
				),
				strings: {
					confirm: __( 'Delete', 'elementor' ),
				},
			} );

			deleteDialog.getElements( 'ok' ).addClass( 'e-danger color-white' );
		}

		return deleteDialog;
	};

	this.getErrorDialog = function() {
		if ( ! errorDialog ) {
			errorDialog = elementorCommon.dialogsManager.createWidget( 'alert', {
				id: 'elementor-template-library-error-dialog',
				headerMessage: __( 'An error occurred.', 'elementor' ),
			} );
		}

		return errorDialog;
	};

	this.getTemplatesCollection = function() {
		return templatesCollection;
	};

	this.getConfig = function( item ) {
		if ( item ) {
			return config[ item ] ? config[ item ] : {};
		}

		return config;
	};

	this.requestLibraryData = function( options ) {
		if ( templatesCollection && ! options.forceUpdate ) {
			if ( options.onUpdate ) {
				options.onUpdate();
			}

			return;
		}

		if ( options.onBeforeUpdate ) {
			options.onBeforeUpdate();
		}

		var ajaxOptions = {
			data: {},
			success( data ) {
				templatesCollection = new TemplateLibraryCollection( data.templates );

				if ( data.config ) {
					config = data.config;
				}

				if ( options.onUpdate ) {
					options.onUpdate();
				}
			},
		};

		if ( options.forceSync ) {
			ajaxOptions.data.sync = true;
		}

		elementorCommon.ajax.addRequest( 'get_library_data', ajaxOptions );
	};

	this.getFilter = function( name ) {
		return elementor.channels.templates.request( 'filter:' + name );
	};

	this.setFilter = function( name, value, silent ) {
		this.clearLastRemovedItems();
		elementor.channels.templates.reply( 'filter:' + name, value );

		if ( ! silent ) {
			elementor.channels.templates.trigger( 'filter:change' );
		}
	};

	this.getFilterTerms = function( termName ) {
		if ( termName ) {
			return filterTerms[ termName ];
		}

		return filterTerms;
	};

	this.setScreen = function( args ) {
		this.clearLastRemovedItems();
		elementor.channels.templates.stopReplying();

		self.setFilter( 'source', args.source, true );
		self.setFilter( 'type', args.type, true );
		self.setFilter( 'subtype', args.subtype, true );

		if ( this.shouldShowCloudStateView( args.source ) ) {
			self.layout.showCloudStateView();

			return;
		}

		self.showTemplates();
	};

	this.loadTemplates = function( onUpdate ) {
		this.clearLastRemovedItems();

		isLoading = true;
		total = 0;

		self.layout.showLoadingView();

		const query = { source: this.getFilter( 'source' ) },
			options = {};

		// TODO: Remove - it when all the data commands is ready, manage the cache!.
		if ( 'local' === query.source || 'cloud' === query.source ) {
			options.refresh = true;
		}

		this.setFilter( 'parent', null, query );

		$e.data.get( 'library/templates', query, options ).then( ( result ) => {
			const templates = 'cloud' === query.source ? result.data.templates.templates : result.data.templates;

			templatesCollection = new TemplateLibraryCollection(
				templates,
			);

			if ( result.data?.templates?.total ) {
				total = result.data?.templates?.total;
			}

			if ( result.data.config ) {
				config = result.data.config;
			}

			self.layout.hideLoadingView();

			if ( onUpdate ) {
				onUpdate();
			}
		} ).finally( ( ) => {
			isLoading = false;
		} );
	};

	this.searchTemplates = ( data ) => {
		this.clearLastRemovedItems();

		return new Promise( ( resolve ) => {
			this.setFilter( 'parent', null );

			isLoading = true;

			const ajaxOptions = {
				data,
				success: ( result ) => {
					isLoading = false;

					templatesCollection = new TemplateLibraryCollection( result.templates );

					total = result.total;

					self.layout.updateViewCollection( templatesCollection.models );

					this.setFilter( 'text', data.search );

					resolve( result );
				},
				error: ( error ) => {
					isLoading = false;

					this.showErrorDialog( error );

					resolve();
				},
			};

			elementorCommon.ajax.addRequest( 'search_templates', ajaxOptions );
		} );
	};

	this.loadMore = ( {
		onUpdate,
		search = '',
		refresh = false,
	} = {} ) => {
		isLoading = true;

		this.clearLastRemovedItems();

		const source = this.getFilter( 'source' );

		const parentId = this.getFilter( 'parent' )?.id;

		const ajaxOptions = {
			data: {
				source,
				offset: refresh ? 0 : templatesCollection.length,
				search,
				parentId,
				orderby: elementor.templates.getFilter( 'orderby' ) || null,
				order: elementor.templates.getFilter( 'order' ) || null,
			},
			success: ( result ) => {
				const collection = new TemplateLibraryCollection( result.templates );

				if ( refresh ) {
					templatesCollection.reset( collection.models );
					self.layout.updateViewCollection( templatesCollection.models );
				} else {
					templatesCollection.add( collection.models, { merge: true } );
					self.layout.addTemplates( collection.models );
				}

				if ( onUpdate ) {
					onUpdate();
				}

				isLoading = false;
			},
			error: () => {
				isLoading = false;
			},
		};

		elementorCommon.ajax.addRequest( 'load_more_templates', ajaxOptions );
	};

	this.showTemplates = function() {
		// The tabs should exist in DOM on loading.
		self.layout.setHeaderDefaultParts();

		self.loadTemplates( function() {
			var templatesToShow = self.filterTemplates();

			self.layout.showTemplatesView( new TemplateLibraryCollection( templatesToShow ) );

			self.handleToast();
		} );
	};

	this.handleToast = function() {
		if ( ! toastConfig?.show ) {
			return;
		}

		elementor.notifications.showToast( toastConfig?.options );

		this.clearToastConfig();
	};

	this.setToastConfig = function( newConfig ) {
		toastConfig = newConfig;
	};

	this.clearToastConfig = function() {
		this.setToastConfig( {
			show: false,
			options: {},
		} );
	};

	this.filterTemplates = function() {
		const activeSource = self.getFilter( 'source' );

		return templatesCollection.filter( function( model ) {
			if ( activeSource !== model.get( 'source' ) ) {
				return false;
			}

			var typeInfo = templateTypes[ model.get( 'type' ) ];

			return ! typeInfo || false !== typeInfo.showInLibrary;
		} );
	};

	this.showErrorDialog = function( errorMessage ) {
		if ( 'object' === typeof errorMessage ) {
			var message = '';

			_.each( errorMessage, function( error ) {
				if ( ! error?.message ) {
					return;
				}

				message += '<div>' + error.message + '.</div>';
			} );

			errorMessage = message;
		} else if ( errorMessage ) {
			errorMessage += '.';
		}

		if ( errorMessage ) {
			errorMessage = __( 'The following error(s) occurred while processing the request:', 'elementor' ) +
				'<div id="elementor-template-library-error-info">' + errorMessage + '</div>';
		} else {
			errorMessage = __( 'Please try again.', 'elementor' );
		}

		self.getErrorDialog()
			.setMessage( errorMessage )
			.show();
	};

	this.onSelectSourceFilterChange = function( event ) {
		const templatesSource = event?.currentTarget?.dataset?.source ?? 'local',
			alreadyActive = templatesSource === self.getFilter( 'source' );

		if ( alreadyActive ) {
			return;
		}

		self.setSourceSelection( templatesSource );
		self.setFilter( 'source', templatesSource, true );
		self.clearBulkSelectionItems();

		if ( this.shouldShowCloudStateView( templatesSource ) ) {
			self.layout.showCloudStateView();

			return;
		}

		self.loadTemplates( function() {
			const templatesToShow = self.filterTemplates();

			self.layout.showTemplatesView( new TemplateLibraryCollection( templatesToShow ) );
		} );
	};

	this.onSelectViewChange = function( selectedView ) {
		self.setViewSelection( selectedView );
		self.setFilter( viewKey, selectedView, true );

		self.layout.updateViewCollection( self.filterTemplates() );

		self.resetBulkActionBar();
	};

	this.resetBulkActionBar = () => {
		this.clearBulkSelectionItems();
		this.layout.handleBulkActionBarUi();
	};

	this.shouldShowCloudStateView = function( source ) {
		if ( 'cloud' !== source ) {
			return false;
		}

		if ( ! elementor.config.library_connect.is_connected ) {
			return true;
		}

		return ! this.hasCloudLibraryQuota();
	};

	this.hasCloudLibraryQuota = function() {
		return 'undefined' !== typeof elementorAppConfig[ 'cloud-library' ]?.quota &&
			0 < elementorAppConfig[ 'cloud-library' ].quota?.threshold &&
			elementor.helpers.hasPro();
	};

	this.addBulkSelectionItem = function( templateId ) {
		bulkSelectedItems.add( parseInt( templateId ) );
	};

	this.removeBulkSelectionItem = function( templateId ) {
		bulkSelectedItems.delete( parseInt( templateId ) );
	};

	this.clearBulkSelectionItems = function() {
		bulkSelectedItems.clear();
	};

	this.getBulkSelectionItems = function() {
		return bulkSelectedItems;
	};

	this.onBulkDeleteClick = function() {
		this.clearLastRemovedItems();

		return new Promise( ( resolve ) => {
			const selectedItems = this.getBulkSelectionItems();

			if ( ! selectedItems.size ) {
				return;
			}

			const dialog = this.getBulkDeleteDialog();

			const source = this.getFilter( 'source' );

			const templateIds = Array.from( selectedItems );

			dialog.onConfirm = () => {
				isLoading = true;

				const ajaxOptions = {
					data: {
						source,
						template_ids: templateIds,
					},
					success: () => {
						isLoading = false;

						const modelsToRemove = templatesCollection.models.filter( ( templateModel ) => {
							return selectedItems.has( templateModel.get( 'template_id' ) );
						} );

						if ( 'cloud' === source ) {
							self.addLastRemovedItems( templateIds );
						}

						templatesCollection.remove( modelsToRemove );

						self.layout.updateViewCollection( self.filterTemplates() );

						self.clearBulkSelectionItems();

						const buttons = 'cloud' === source ? [
							{
								name: 'undo_bulk_delete',
								text: __( 'Undo', 'elementor' ),
								callback: () => {
									this.onUndoDelete();
								},
							},
						] : null;

						elementor.notifications.showToast( {
							message: `${ templateIds.length } items deleted successfully`,
							buttons,
						} );

						this.triggerQuotaUpdate();

						resolve();
					},
					error: ( error ) => {
						isLoading = false;

						this.showErrorDialog( error );

						resolve();
					},
				};

				elementorCommon.ajax.addRequest( 'bulk_delete_templates', ajaxOptions );
			};

			dialog.onCancel = () => {
				resolve();
			};

			dialog.show();
		} );
	};

	this.onUndoDelete = function() {
		return new Promise( ( resolve ) => {
			isLoading = true;

			if ( ! lastDeletedItems.size ) {
				return resolve();
			}

			const source = this.getFilter( 'source' );

			const templateIds = Array.from( lastDeletedItems );

			const ajaxOptions = {
				data: {
					source,
					template_ids: templateIds,
				},
				success: () => {
					isLoading = false;

					$e.routes.refreshContainer( 'library' );

					this.clearLastRemovedItems();

					this.triggerQuotaUpdate();

					resolve();
				},
				error: ( error ) => {
					isLoading = false;

					this.clearLastRemovedItems();

					this.showErrorDialog( error );

					resolve();
				},
			};

			elementorCommon.ajax.addRequest( 'bulk_undo_delete_items', ajaxOptions );
		} );
	};

	this.triggerQuotaUpdate = function( force = true ) {
		elementor.channels.templates.trigger( 'quota:update', { force } );
	};
};

module.exports = new TemplateLibraryManager();
