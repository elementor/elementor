var TemplateLibraryHeaderSettingsView;

TemplateLibraryHeaderSettingsView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-templates-header-settings',

	id: 'elementor-templates-header-settings',

	className: 'elementor-templates-header-item',

	ui: {
		saveButton: '#elementor-templates-header-settings-save'
	},

	events: {
		'click @ui.saveButton': 'onSaveButtonClick'
	},

	onSaveButtonClick: function() {
		elementor.templates.getLayout().showSaveTemplateView();
	}
} );

module.exports = TemplateLibraryHeaderSettingsView;
