var TemplateLibraryImportView;

TemplateLibraryImportView = Marionette.ItemView.extend( {
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

		elementor.templates.getLayout().showLoadingView();

		elementor.ajax.send( 'import_template', {
			data: new FormData( this.ui.uploadForm[ 0 ] ),
			processData: false,
			contentType: false,
			success: function( data ) {
				elementor.templates.getTemplatesCollection().add( data.item );

				elementor.templates.showTemplates();
			},
			error: function( data ) {
				elementor.templates.showErrorDialog( data.message );
			}
		} );
	}
} );

module.exports = TemplateLibraryImportView;
