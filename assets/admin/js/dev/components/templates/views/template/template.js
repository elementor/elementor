var TemplatesTemplateView;

TemplatesTemplateView = Marionette.ItemView.extend( {
	className: 'elementor-templates-template',

	template: '#tmpl-elementor-templates-template',

	ui: {
		loadButton: '.elementor-templates-template-load',
		deleteButton: '.elementor-templates-template-delete'
	},

	events: {
		'click @ui.loadButton': 'onLoadButtonClick',
		'click @ui.deleteButton': 'onDeleteButtonClick'
	},

	onLoadButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	},

	onDeleteButtonClick: function() {
		elementor.templates.deleteTemplate( this.model );
	}
} );

module.exports = TemplatesTemplateView;
