var TemplateLibraryHeaderView;

TemplateLibraryHeaderView = Marionette.LayoutView.extend( {

	id: 'elementor-template-library-header',

	template: '#tmpl-elementor-template-library-header',

	regions: {
		logoArea: '#elementor-template-library-header-logo-area',
		tools: '#elementor-template-library-header-tools',
		menuArea: '#elementor-template-library-header-menu-area'
	},

	ui: {
		closeModal: '#elementor-template-library-header-close-modal'
	},

	events: {
		'click @ui.closeModal': 'onCloseModalClick'
	},

	onCloseModalClick: function() {
		elementor.templates.getModal().hide();
	}
} );

module.exports = TemplateLibraryHeaderView;
