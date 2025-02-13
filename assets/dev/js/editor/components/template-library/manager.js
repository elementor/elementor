import Component from './component';

const TemplateLibraryCollection = require( 'elementor-templates/collections/templates' );

const TemplateLibraryManager = function() {
	this.modalConfig = {};

	const self = this,
		templateTypes = {};

	let deleteDialog,
		errorDialog,
		templatesCollection,
		config = {},
		filterTerms = {},
		isLoading = false,
		total = 0;

	const registerDefaultTemplateTypes = function() {
		var data = {
			saveDialog: {
				description: __( 'Your designs will be available for export and reuse on any page or website', 'elementor' ),
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
				},
				error( errorData ) {
					self.showErrorDialog( errorData );
				},
			},
		};

		const translationMap = {
			page: __( 'Page', 'elementor' ),
			section: __( 'Section', 'elementor' ),
			container: __( 'Container', 'elementor' ),
			[ elementor.config.document.type ]: elementor.config.document.panel.title,
		};

		jQuery.each( translationMap, function( type, title ) {
			var safeData = jQuery.extend( true, {}, data, {
				saveDialog: {
					/* Translators: %s: Template type. */
					title: sprintf( __( 'Save Your %s to Library', 'elementor' ), title ),
				},
			} );

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
	};

	this.getTemplateTypes = function( type ) {
		if ( type ) {
			return templateTypes[ type ];
		}

		return templateTypes;
	};

	this.registerTemplateType = function( type, data ) {
		templateTypes[ type ] = data;
	};

	this.deleteTemplate = function( templateModel, options ) {
		var dialog = self.getDeleteDialog();

		dialog.onConfirm = function() {
			if ( options.onConfirm ) {
				options.onConfirm();
			}

			elementorCommon.ajax.addRequest( 'delete_template', {
				data: {
					source: templateModel.get( 'source' ),
					template_id: templateModel.get( 'template_id' ),
				},
				success( response ) {
					templatesCollection.remove( templateModel, { silent: true } );

					if ( options.onSuccess ) {
						options.onSuccess( response );
					}
				},
			} );
		};

		dialog.show();
	};

	this.renameTemplate = ( templateModel, options ) => {
		const originalTitle = templateModel.get( 'title' );
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
			__( 'Rename "%1$s".', 'elementor' ),
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

	this.getFolderTemplates = ( templateId ) => {
		return new Promise( ( resolve ) => {
			isLoading = true;
			const ajaxOptions = {
				data: {
					source: 'cloud',
					template_id: templateId,
				},
				success: ( data ) => {
					this.setFilter( 'parent', templateId );
					templatesCollection = new TemplateLibraryCollection( data.templates );

					elementor.templates.layout.hideLoadingView();

					self.layout.updateViewCollection( templatesCollection.models );
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

	this.deleteFolder = function( templateModel, options ) {
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
		return elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-template-library-delete-dialog',
			headerMessage: __( 'Delete Folder', 'elementor' ),
			message: sprintf(
				// Translators: %1$s: Folder name, %2$s: Number of templates.
				__( 'Are you sure you want to delete "%1$s" folder with all %2$d templates?', 'elementor' ),
				templateModel.get( 'title' ),
				data.total,
			),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
			},
		} );
	};

	this.sendDeleteRequest = function( templateModel, options ) {
		elementorCommon.ajax.addRequest( 'delete_template', {
			data: {
				source: templateModel.get( 'source' ),
				template_id: templateModel.get( 'template_id' ),
			},
			success: ( response ) => {
				templatesCollection.remove( templateModel, { silent: true } );
				options.onSuccess?.( response );
			},
		} );
	};

	/**
	 * @param {*}      model - Template model.
	 * @param {Object} args  - Template arguments.
	 * @deprecated since 2.8.0, use `$e.run( 'library/insert-template' )` instead.
	 */
	this.importTemplate = function( model, args = {} ) {
		elementorDevTools.deprecation.deprecated( 'importTemplate', '2.8.0',
			"$e.run( 'library/insert-template' )" );

		args.model = model;

		$e.run( 'library/insert-template', args );
	};

	this.saveTemplate = function( type, data ) {
		var templateType = templateTypes[ type ];

		_.extend( data, {
			source: 'local',
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

		elementorCommon.ajax.addRequest( 'save_template', ajaxParams );
	};

	this.requestTemplateContent = function( source, id, ajaxOptions ) {
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
		var options = {
			data: {
				source: templateModel.get( 'source' ),
				template_id: templateModel.get( 'template_id' ),
				favorite,
			},
		};

		return elementorCommon.ajax.addRequest( 'mark_template_as_favorite', options );
	};

	this.getDeleteDialog = function() {
		if ( ! deleteDialog ) {
			deleteDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-template-library-delete-dialog',
				headerMessage: __( 'Delete Template', 'elementor' ),
				message: __( 'Are you sure you want to delete this template?', 'elementor' ),
				strings: {
					confirm: __( 'Delete', 'elementor' ),
				},
			} );
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
		elementor.channels.templates.stopReplying();

		self.setFilter( 'source', args.source, true );
		self.setFilter( 'type', args.type, true );
		self.setFilter( 'subtype', args.subtype, true );

		self.showTemplates();
	};

	this.loadTemplates = function( onUpdate ) {
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
	} = {} ) => {
		isLoading = true;

		const source = this.getFilter( 'source' );

		const parentId = this.getFilter( 'parent' );

		const ajaxOptions = {
			data: {
				source,
				offset: templatesCollection.length,
				search,
				parentId,
			},
			success: ( result ) => {
				const collection = new TemplateLibraryCollection( result.templates );

				templatesCollection.add( collection.models, { merge: true } );

				self.layout.addTemplates( collection.models );

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
};

module.exports = new TemplateLibraryManager();
