var TemplatesHeaderView;

TemplatesHeaderView = Marionette.ItemView.extend( {
	id: 'elementor-templates-header',

	template: '#tmpl-elementor-templates-header',

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

module.exports = TemplatesHeaderView;
