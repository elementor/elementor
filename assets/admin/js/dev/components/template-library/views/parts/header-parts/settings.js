var TemplateLibraryHeaderSettingsView;

TemplateLibraryHeaderSettingsView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-settings',

	id: 'elementor-template-library-header-settings',

	className: 'elementor-template-library-header-item',

	ui: {
		saveButton: '#elementor-template-library-header-settings-save'
	},

	events: {
		'click @ui.saveButton': 'onSaveButtonClick'
	},

	onSaveButtonClick: function() {
		elementor.templates.getLayout().showSaveTemplateView();
	}
} );

module.exports = TemplateLibraryHeaderSettingsView;
