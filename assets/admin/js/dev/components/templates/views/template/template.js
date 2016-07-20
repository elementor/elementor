var TemplatesTemplateView;

TemplatesTemplateView = Marionette.ItemView.extend( {
	className: 'elementor-templates-template',

	template: '#tmpl-elementor-templates-template',

	ui: {
		insertButton: '.elementor-templates-template-insert'
	},

	events: {
		'click @ui.insertButton': 'onLoadButtonClick'
	},

	onLoadButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	}
} );

module.exports = TemplatesTemplateView;
