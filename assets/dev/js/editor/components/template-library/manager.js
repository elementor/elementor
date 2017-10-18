var TemplateLibraryLayoutView = require( 'elementor-templates/views/layout' ),
	TemplateLibraryCollection = require( 'elementor-templates/collections/templates' ),
	TemplateLibraryManager;

TemplateLibraryManager = function() {
	var self = this,
		modal,
		deleteDialog,
		errorDialog,
		layout,
		startIntent = {},
		templateTypes = {},
		templatesCollection;

	var initLayout = function() {
		layout = new TemplateLibraryLayoutView();
	};

	var registerDefaultTemplateTypes = function() {
		var data = {
			saveDialog: {
				description: elementor.translate( 'save_your_template_description' )
			},
			ajaxParams: {
				success: function( data ) {
					self.getTemplatesCollection().add( data );

					self.setTemplatesSource( 'local' );

					self.showTemplates();
				},
				error: function( data ) {
					self.showErrorDialog( data );
				}
			}
		};

		_.each( [ 'page', 'section' ], function( type ) {
			var safeData = Backbone.$.extend( true, {}, data, {
				saveDialog: {
					title: elementor.translate( 'save_your_template', [ elementor.translate( type ) ] )
				}
			} );

			self.registerTemplateType( type, safeData );
		} );
	};

	this.init = function() {
		registerDefaultTemplateTypes();
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

	this.deleteTemplate = function( templateModel ) {
		var dialog = self.getDeleteDialog();

		dialog.onConfirm = function() {
			elementor.ajax.send( 'delete_template', {
				data: {
					source: templateModel.get( 'source' ),
					template_id: templateModel.get( 'template_id' )
				},
				success: function() {
					templatesCollection.remove( templateModel, { silent: true } );

					self.showTemplates();
				}
			} );
		};

		dialog.show();
	};

	this.importTemplate = function( templateModel, options ) {
		options = options || {};

		layout.showLoadingView();

		self.requestTemplateContent( templateModel.get( 'source' ), templateModel.get( 'template_id' ), {
			data: {
				page_settings: options.withPageSettings
			},
			success: function( data ) {
				self.closeModal();

				elementor.channels.data.trigger( 'template:before:insert', templateModel );

				elementor.sections.currentView.addChildModel( data.content, startIntent.importOptions || {} );

				elementor.channels.data.trigger( 'template:after:insert', templateModel );

				if ( options.withPageSettings ) {
					elementor.settings.page.model.set( data.page_settings );
				}
			},
			error: function( data ) {
				self.showErrorDialog( data );
			}
		} );
	};

	this.saveTemplate = function( type, data ) {
		var templateType = templateTypes[ type ];

		_.extend( data, {
			source: 'local',
			type: type
		} );

		if ( templateType.prepareSavedData ) {
			data = templateType.prepareSavedData( data );
		}

		data.content = JSON.stringify( data.content );

		var ajaxParams = { data: data };

		if ( templateType.ajaxParams ) {
			_.extend( ajaxParams, templateType.ajaxParams );
		}

		elementor.ajax.send( 'save_template', ajaxParams );
	};

	this.requestTemplateContent = function( source, id, ajaxOptions ) {
		var options = {
			data: {
				source: source,
				edit_mode: true,
				display: true,
				template_id: id
			}
		};

		if ( ajaxOptions ) {
			Backbone.$.extend( true, options, ajaxOptions );
		}

		return elementor.ajax.send( 'get_template_data', options );
	};

	this.getDeleteDialog = function() {
		if ( ! deleteDialog ) {
			deleteDialog = elementor.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-template-library-delete-dialog',
				headerMessage: elementor.translate( 'delete_template' ),
				message: elementor.translate( 'delete_template_confirm' ),
				strings: {
					confirm: elementor.translate( 'delete' )
				}
			} );
		}

		return deleteDialog;
	};

	this.getErrorDialog = function() {
		if ( ! errorDialog ) {
			errorDialog = elementor.dialogsManager.createWidget( 'alert', {
				id: 'elementor-template-library-error-dialog',
				headerMessage: elementor.translate( 'an_error_occurred' )
			} );
		}

		return errorDialog;
	};

	this.getModal = function() {
		if ( ! modal ) {
			modal = elementor.dialogsManager.createWidget( 'lightbox', {
				id: 'elementor-template-library-modal',
				closeButton: false
			} );
		}

		return modal;
	};

	this.getLayout = function() {
		return layout;
	};

	this.getTemplatesCollection = function() {
		return templatesCollection;
	};

	this.requestRemoteTemplates = function( callback, forceUpdate ) {
		if ( templatesCollection && ! forceUpdate ) {
			if ( callback ) {
				callback();
			}

			return;
		}

		elementor.ajax.send( 'get_templates', {
			success: function( data ) {
				templatesCollection = new TemplateLibraryCollection( data );

				if ( callback ) {
					callback();
				}
			}
		} );
	};

	this.startModal = function( customStartIntent ) {
		startIntent = customStartIntent || {};

		self.getModal().show();

		self.setTemplatesSource( 'remote' );

		if ( ! layout ) {
			initLayout();
		}

		layout.showLoadingView();

		self.requestRemoteTemplates( function() {
			if ( startIntent.onReady ) {
				startIntent.onReady();
			}
		} );
	};

	this.closeModal = function() {
		self.getModal().hide();
	};

	this.setTemplatesSource = function( source, trigger ) {
		var channel = elementor.channels.templates;

		channel.reply( 'filter:source', source );

		if ( trigger ) {
			channel.trigger( 'filter:change' );
		}
	};

	this.showTemplates = function() {
		layout.showTemplatesView( templatesCollection );
	};

	this.showTemplatesModal = function() {
		self.startModal( {
			onReady: self.showTemplates
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
