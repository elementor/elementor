var TemplatesLayoutView = require( 'elementor-templates/views/layout' ),
	TemplatesCollection = require( 'elementor-templates/collections/templates' ),
	TemplatesManager;

TemplatesManager = function() {
	var self = this,
		modal,
		layout,
		templatesCollection;

	var initLayout = function() {
		layout = new TemplatesLayoutView();
	};

	this.getModal = function() {
		if ( ! modal ) {
			modal = elementor.modals.createModal( {
				id: 'elementor-templates-modal',
				closeButton: false
			} );
		}

		return modal;
	};

	this.getLayout = function() {
		return layout;
	};

	this.requestRemoteTemplates = function( options ) {
		var ajaxOptions = {
			type: 'POST',
			url: elementor.config.ajaxurl,
			dataType: 'json',
			data: {
				action: 'elementor_get_templates'
			}
		};

		if ( options ) {
			Backbone.$.extend( ajaxOptions, options );
		}

		Backbone.$.ajax( ajaxOptions );
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
};

module.exports = new TemplatesManager();
