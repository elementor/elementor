var TemplatesLayoutView = require( 'elementor-templates/views/layout' ),
	TemplatesManager;

TemplatesManager = function() {
	var self = this,
		modal,
		layout;

	var initLayout = function() {
		layout = new TemplatesLayoutView();
	};

	this.init = function() {
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

		layout.showLoading();

		self.requestRemoteTemplates( {
			success: function( data ) {
				layout.showTemplates( data );
			}
		} );
	};
};

module.exports = new TemplatesManager();
