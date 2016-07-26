var TemplatesLayoutView = require( 'elementor-templates/views/layout' ),
	TemplatesCollection = require( 'elementor-templates/collections/templates' ),
	TemplatesManager;

TemplatesManager = function() {
	var self = this,
		modal,
		errorDialog,
		layout,
		templatesCollection;

	var initLayout = function() {
		layout = new TemplatesLayoutView();
	};

	this.deleteTemplate = function( templateModel ) {
		elementor.ajax.send( 'delete_template', {
			data: {
				type: templateModel.get( 'type' ),
				item_id: templateModel.get( 'id' )
			}
		} );

		templatesCollection.remove( templateModel );
	};

	this.importTemplate = function( templateModel ) {
		self.getRemoteTemplateProperty( templateModel, 'content', function( data ) {
			self.getModal().hide();

			elementor.getRegion( 'sections' ).currentView.addChildModel( data );
		}, {
			type: templateModel.get( 'type' ),
			post_id: elementor.config.post_id,
			item_id: templateModel.get( 'id' )
		} );
	};

	this.getErrorDialog = function() {
		if ( ! errorDialog ) {
			errorDialog = elementor.dialogsManager.createWidget( 'alert', {
				id: 'elementor-templates-error-dialog',
				headerMessage: elementor.translate( 'an_error_occurred' )
			} );
		}

		return errorDialog;
	};

	this.getModal = function() {
		if ( ! modal ) {
			modal = elementor.dialogsManager.createWidget( 'elementor-modal', {
				id: 'elementor-templates-modal',
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

	this.getRemoteTemplateProperty = function( templateModel, property, callback, requestOptions ) {
		var value = templateModel.get( property );

		if ( undefined !== value ) {
			callback( value );

			return;
		}

		layout.showLoadingView();

		elementor.ajax.send( 'get_template_' + property, {
			data: requestOptions,
			success: function( data ) {
				templateModel.set( property, data );

				callback( data );
			},
			error: function( data ) {
				self.showErrorDialog( data.message );
			}
		} );
	};

	this.requestRemoteTemplates = function( options ) {
		elementor.ajax.send( 'get_templates', options );
	};

	this.startModal = function() {
		self.getModal().show();

		if ( ! layout ) {
			initLayout();
		}
	};

	this.showTemplates = function() {
		if ( templatesCollection ) {
			layout.showTemplatesView( templatesCollection );

			return;
		}

		layout.showLoadingView();

		self.requestRemoteTemplates( {
			success: function( data ) {
				templatesCollection = new TemplatesCollection( data );

				layout.showTemplatesView( templatesCollection );
			}
		} );
	};

	this.showTemplatePreview = function( templateModel ) {
		layout.getHeaderView().menuArea.reset();

		self.getRemoteTemplateProperty( templateModel, 'url', function() {
			layout.showPreviewView( templateModel );
		}, { id: templateModel.get( 'id' ) } );
	};

	this.showErrorDialog = function( errorMessage ) {
		self.getErrorDialog()
		    .setMessage( elementor.translate( 'templates_request_error' ) + '<div id="elementor-templates-error-info">' + errorMessage + '</div>' )
		    .show();
	};
};

module.exports = new TemplatesManager();
