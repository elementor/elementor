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

		this.ui.uploadForm.upload( {
			
		} );
	}
} );

module.exports = TemplatesImportView;
