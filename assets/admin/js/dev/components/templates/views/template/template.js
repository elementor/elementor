var TemplatesTemplateView;

TemplatesTemplateView = Marionette.ItemView.extend( {
	className: 'elementor-templates-template',

	template: '#tmpl-elementor-templates-template',

	ui: {
		insertButton: '.elementor-templates-template-insert',
		previewButton: '.elementor-templates-template-preview'
	},

	events: {
		'click @ui.insertButton': 'onLoadButtonClick',
		'click @ui.previewButton': 'onPreviewButtonClick'
	},

	onLoadButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	},

	onPreviewButtonClick: function() {
		elementor.templates.showTemplatePreview( this.model );
	}
} );

module.exports = TemplatesTemplateView;
