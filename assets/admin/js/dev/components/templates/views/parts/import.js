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

		elementor.ajax.send( 'import_template', {
			data: new FormData( this.ui.uploadForm[ 0 ] ),
			processData: false,
			contentType: false,
			success: function( response ) {
				console.log( response );
			}
		} );
	}
} );

module.exports = TemplatesImportView;
