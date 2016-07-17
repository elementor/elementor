var TemplatesSaveTemplateView;

TemplatesSaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-templates-save-template',

	template: '#tmpl-elementor-templates-save-template',

	ui: {
		form: '#elementor-templates-save-template-form'
	},

	events: {
		'submit @ui.form': 'onFormSubmit'
	},

	onFormSubmit: function( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject();

		_.extend( formData, {
			data: JSON.stringify( elementor.elements.toJSON() ),
			type: 'local'
		} );

		elementor.templates.getLayout().showLoadingView();

		elementor.ajax.send( 'save_template', {
			data: formData,
			success: function( data ) {
				elementor.templates.getTemplatesCollection().add( data );

				elementor.templates.showTemplates();
			},
			error: function( data ) {
				elementor.templates.showErrorDialog( data.message );
			}
		} );
	}
} );

module.exports = TemplatesSaveTemplateView;
