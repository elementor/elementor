var TemplateLibrarySaveTemplateView;

TemplateLibrarySaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-save-template',

	template: '#tmpl-elementor-template-library-save-template',

	ui: {
		form: '#elementor-template-library-save-template-form',
		submitButton: '#elementor-template-library-save-template-submit'
	},

	events: {
		'submit @ui.form': 'onFormSubmit'
	},

	onFormSubmit: function( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			saveType = this.model ? this.model.get( 'elType' ) : 'page',
			elementsData;

		switch ( saveType ) {
			case 'section':
				elementsData = [ this.model.toJSON() ];
				break;
			case 'widget':
				elementsData = this.model.toJSON();
				break;
			default:
				elementsData = elementor.elements.toJSON();
		}

		_.extend( formData, {
			data: JSON.stringify( elementsData ),
			source: 'local',
			type: saveType
		} );

		if ( 'widget' === formData.type ) {
			formData.widget_type = elementsData.widgetType;
		}

		this.ui.submitButton.addClass( 'elementor-button-state' );

		elementor.ajax.send( 'save_template', {
			data: formData,
			success: function( data ) {
				elementor.templates.getTemplatesCollection().add( data );

				elementor.templates.setTemplatesSource( 'local' );

				elementor.templates.showTemplates();
			},
			error: function( data ) {
				elementor.templates.showErrorDialog( data );
			}
		} );
	}
} );

module.exports = TemplateLibrarySaveTemplateView;
