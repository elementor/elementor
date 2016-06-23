var TemplatesLayoutView = require( 'elementor-templates/views/layout' ),
	TemplatesManager;

TemplatesManager = function() {
	var self = this,
		modal,
		layout;

	this.init = function() {
	};

	this.getModal = function() {
		if ( ! modal ) {
			modal = elementor.modals.createModal( {
				id: 'elementor-templates-modal',
				contentWidth: 950,
				contentHeight: 500,
				closeButton: false
			} );
		}

		return modal;
	};

	this.getLayout = function() {
		if ( ! layout ) {
			layout = new TemplatesLayoutView();
		}

		return layout;
	};

	this.requestRemoteTemplates = function( options ) {
		var ajaxOptions = {
			type: 'POST',
			url: elementor.config.ajaxurl,
			dataType: 'json',
			data: {
				action: 'elementor_template_get'
			}
		};

		if ( options ) {
			Backbone.$.extend( ajaxOptions, options );
		}

		Backbone.$.ajax( ajaxOptions );
	};

	this.startModal = function() {
		self.getModal().show();

		self.requestRemoteTemplates( {
			success: function( data ) {
				self.getLayout().showTemplates( data );
			}
		} );
	};
};

module.exports = new TemplatesManager();
