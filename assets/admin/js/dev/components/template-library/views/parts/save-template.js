var TemplateLibrarySaveTemplateView;

TemplateLibrarySaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-save-template',

	template: '#tmpl-elementor-template-library-save-template',

	ui: {
		form: '#elementor-template-library-save-template-form'
	},

	events: {
		'submit @ui.form': 'onFormSubmit'
	},

	templateHelpers: function() {
		return {
			sectionID: this.getOption( 'sectionID' )
		};
	},

	onFormSubmit: function( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			elementsData = elementor.helpers.cloneObject( elementor.elements.toJSON() ),
			sectionID = this.getOption( 'sectionID' ),
			saveType = sectionID ? 'section' : 'page';

		if ( 'section' === saveType ) {
			elementsData = [ _.findWhere( elementsData, { id: sectionID } ) ];
		}

		_.extend( formData, {
			data: JSON.stringify( elementsData ),
			type: 'local',
			kind: saveType
		} );

		elementor.templates.getLayout().showLoadingView();

		elementor.ajax.send( 'save_template', {
			data: formData,
			success: function( data ) {
				elementor.templates.getTemplatesCollection().add( data );

				elementor.templates.setTemplatesType( 'local' );

				elementor.templates.showTemplates();
			},
			error: function( data ) {
				elementor.templates.showErrorDialog( data.message );
			}
		} );
	}
} );

module.exports = TemplateLibrarySaveTemplateView;
