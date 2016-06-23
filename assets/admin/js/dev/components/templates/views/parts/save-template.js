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
			action: 'elementor_save_template',
			data: JSON.stringify( elementor.elements.toJSON() ),
			type: 'local'
		} );

		Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
			data: formData,
			success: function( response ) {
				if ( response.success ) {

				}
			}
		} );
	}
} );

module.exports = TemplatesSaveTemplateView;
