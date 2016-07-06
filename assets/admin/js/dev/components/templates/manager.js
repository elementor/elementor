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

	this.requestRemoteTemplates = function( options ) {
		elementor.ajax.send( 'get_templates', options );
	};

	this.startModal = function() {
		self.getModal().show();

		initLayout();

		layout.showLoadingView();

		self.requestRemoteTemplates( {
			success: function( data ) {
				templatesCollection = new TemplatesCollection( data );

				self.showTemplates();
			}
		} );
	};

	this.showTemplates = function() {
		layout.showTemplatesView( templatesCollection );
	};

	this.showErrorDialog = function( errorMessage ) {
		this.getErrorDialog()
		    .setMessage( elementor.translate( 'templates_request_error' ) + '<div id="elementor-templates-error-info">' + errorMessage + '</div>' )
		    .show();
	};
};

module.exports = new TemplatesManager();
