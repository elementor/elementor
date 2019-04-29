import Component from './component';

var TemplateLibraryLayoutView = require( 'elementor-templates/views/library-layout' ),
	TemplateLibraryCollection = require( 'elementor-templates/collections/templates' ),
	TemplateLibraryManager;

TemplateLibraryManager = function() {
	const self = this,
		templateTypes = {};

	let deleteDialog,
		errorDialog,
		layout,
		templatesCollection,
		config = {},
		filterTerms = {};

	const initLayout = function() {
		layout = new TemplateLibraryLayoutView();

		layout.getModal().on( 'hide', () => elementorCommon.route.close( 'library' ) );
	};

	const registerDefaultTemplateTypes = function() {
		var data = {
			saveDialog: {
				description: elementor.translate( 'save_your_template_description' ),
			},
			ajaxParams: {
				success: function( successData ) {
					elementorCommon.route.to( 'library/templates/my-templates', {
						onBefore: () => {
							if ( templatesCollection ) {
								templatesCollection.add( successData );
							}
						},
					} );
				},
				error: function( errorData ) {
					self.showErrorDialog( errorData );
				},
			},
		};

		_.each( [ 'page', 'section', elementor.config.document.type ], function( type ) {
			var safeData = jQuery.extend( true, {}, data, {
				saveDialog: {
					title: elementor.translate( 'save_your_template', [ elementor.translate( type ) ] ),
				},
			} );

			self.registerTemplateType( type, safeData );
		} );
	};

	const registerDefaultFilterTerms = function() {
		filterTerms = {
			text: {
				callback: function( value ) {
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

	this.modalConfig = {};

	this.init = function() {
		registerDefaultTemplateTypes();

		registerDefaultFilterTerms();

		this.component = elementorCommon.components.register( 'library', new Component() );

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
				success: function( response ) {
					templatesCollection.remove( templateModel, { silent: true } );

					if ( options.onSuccess ) {
						options.onSuccess( response );
					}
				},
			} );
		};

		dialog.show();
	};

	this.importTemplate = function( templateModel, options ) {
		options = options || {};

		layout.showLoadingView();

		self.requestTemplateContent( templateModel.get( 'source' ), templateModel.get( 'template_id' ), {
			data: {
				page_settings: options.withPageSettings,
			},
			success: function( data ) {
				// Clone `this.modalConfig` because it deleted during the closing.
				const importOptions = jQuery.extend( {}, this.modalConfig.importOptions );

				// Hide for next open.
				layout.hideLoadingView();

				self.closeModal();

				elementor.channels.data.trigger( 'template:before:insert', templateModel );

				elementor.getPreviewView().addChildModel( data.content, importOptions );

				elementor.channels.data.trigger( 'template:after:insert', templateModel );

				if ( options.withPageSettings ) {
					elementor.settings.page.model.setExternalChange( data.page_settings );
				}
			},
			error: function( data ) {
				self.showErrorDialog( data );
			},
			complete: function() {
				layout.hideLoadingView();
			},
		} );
	};

	this.saveTemplate = function( type, data ) {
		var templateType = templateTypes[ type ];

		_.extend( data, {
			source: 'local',
			type: type,
		} );

		if ( templateType.prepareSavedData ) {
			data = templateType.prepareSavedData( data );
		}

		data.content = JSON.stringify( data.content );

		var ajaxParams = { data: data };

		if ( templateType.ajaxParams ) {
			_.extend( ajaxParams, templateType.ajaxParams );
		}

		elementorCommon.ajax.addRequest( 'save_template', ajaxParams );
	};

	this.requestTemplateContent = function( source, id, ajaxOptions ) {
		var options = {
			unique_id: id,
			data: {
				source: source,
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
				favorite: favorite,
			},
		};

		return elementorCommon.ajax.addRequest( 'mark_template_as_favorite', options );
	};

	this.getDeleteDialog = function() {
		if ( ! deleteDialog ) {
			deleteDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-template-library-delete-dialog',
				headerMessage: elementor.translate( 'delete_template' ),
				message: elementor.translate( 'delete_template_confirm' ),
				strings: {
					confirm: elementor.translate( 'delete' ),
				},
			} );
		}

		return deleteDialog;
	};

	this.getErrorDialog = function() {
		if ( ! errorDialog ) {
			errorDialog = elementorCommon.dialogsManager.createWidget( 'alert', {
				id: 'elementor-template-library-error-dialog',
				headerMessage: elementor.translate( 'an_error_occurred' ),
			} );
		}

		return errorDialog;
	};

	this.getLayout = function() {
		return layout;
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
			success: function( data ) {
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

	this.startModal = function() {
		if ( ! layout ) {
			initLayout();
		}

		layout.showModal();
	};

	this.closeModal = function() {
		layout.hideModal();
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

	this.setScreen = function( source, type, silent ) {
		elementor.channels.templates.stopReplying();

		self.setFilter( 'source', source, true );

		if ( type ) {
			self.setFilter( 'type', type, true );
		}

		if ( ! silent ) {
			self.showTemplates();
		}
	};

	this.routeToDefault = function() {
		const remoteLibraryConfig = elementor.config.document.remoteLibrary;

		if ( 'block' === remoteLibraryConfig.type ) {
			this.component.route.setDefault( 'templates/blocks' );
		}

		this.component.route.to( '_default', {
			onAfter: () => {
				if ( remoteLibraryConfig.category ) {
					this.setFilter( 'subtype', remoteLibraryConfig.category );
				}
			},
		} );
	};

	this.loadTemplates = function( onUpdate ) {
		self.requestLibraryData( {
			onBeforeUpdate: layout.showLoadingView.bind( layout ),
			onUpdate: function() {
				layout.hideLoadingView();

				if ( onUpdate ) {
					onUpdate();
				}
			},
		} );
	};

	this.showTemplates = function() {
		self.loadTemplates( function() {
			var templatesToShow = self.filterTemplates();

			layout.showTemplatesView( new TemplateLibraryCollection( templatesToShow ) );
		} );
	};

	this.filterTemplates = function() {
		var activeSource = self.getFilter( 'source' );
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
				message += '<div>' + error.message + '.</div>';
			} );

			errorMessage = message;
		} else if ( errorMessage ) {
			errorMessage += '.';
		} else {
			errorMessage = '<i>&#60;The error message is empty&#62;</i>';
		}

		self.getErrorDialog()
			.setMessage( elementor.translate( 'templates_request_error' ) + '<div id="elementor-template-library-error-info">' + errorMessage + '</div>' )
			.show();
	};
};

module.exports = new TemplateLibraryManager();
