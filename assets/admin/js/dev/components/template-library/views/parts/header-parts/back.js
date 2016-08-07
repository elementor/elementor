var TemplateLibraryHeaderBackView;

TemplateLibraryHeaderBackView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-back',

	id: 'elementor-template-library-header-preview-back-wrapper',

	ui: {
		backButton: '#elementor-template-library-header-preview-back'
	},

	events: {
		'click @ui.backButton': 'onBackButtonClick'
	},

	onBackButtonClick: function() {
		elementor.templates.showTemplates();
	}
} );

module.exports = TemplateLibraryHeaderBackView;
