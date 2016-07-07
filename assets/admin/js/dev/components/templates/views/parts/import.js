var TemplatesImportView;

TemplatesImportView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-templates-import',

	id: 'elementor-templates-import',

	ui: {
		uploadForm: '#elementor-templates-import-form'
	},

	events: {
		'submit @ui.uploadForm': 'onFormSubmit'
	},

	onFormSubmit: function( event ) {
		event.preventDefault();

		var formData = new FormData( this.ui.uploadForm[ 0 ] );
		formData.append( 'action', 'elementor_import_template' );

		Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
			data: formData,
			processData: false,
			contentType: false,
			success: function( response ) {
				console.log( response );
			}
		} );
	}
} );

module.exports = TemplatesImportView;
