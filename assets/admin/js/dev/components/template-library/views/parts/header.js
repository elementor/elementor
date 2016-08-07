var TemplateLibraryHeaderView;

TemplateLibraryHeaderView = Marionette.LayoutView.extend( {

	id: 'elementor-templates-header',

	template: '#tmpl-elementor-templates-header',

	regions: {
		logoArea: '#elementor-templates-header-logo-area',
		tools: '#elementor-templates-header-tools',
		menuArea: '#elementor-templates-header-menu-area'
	},

	ui: {
		closeModal: '#elementor-templates-header-close-modal'
	},

	events: {
		'click @ui.closeModal': 'onCloseModalClick'
	},

	onCloseModalClick: function() {
		elementor.templates.getModal().hide();
	}
} );

module.exports = TemplateLibraryHeaderView;
