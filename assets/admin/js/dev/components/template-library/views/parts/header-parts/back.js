var TemplateLibraryHeaderBackView;

TemplateLibraryHeaderBackView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-templates-header-back',

	id: 'elementor-templates-header-preview-back-wrapper',

	ui: {
		backButton: '#elementor-templates-header-preview-back'
	},

	events: {
		'click @ui.backButton': 'onBackButtonClick'
	},

	onBackButtonClick: function() {
		elementor.templates.showTemplates();
	}
} );

module.exports = TemplateLibraryHeaderBackView;
