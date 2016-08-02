var TemplatesTemplateView;

TemplatesTemplateView = Marionette.ItemView.extend( {
	className: 'elementor-templates-template',

	template: '#tmpl-elementor-templates-template',

	ui: {
		insertButton: '.elementor-templates-template-insert',
		previewButton: '.elementor-templates-template-preview'
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick',
		'click @ui.previewButton': 'onPreviewButtonClick'
	},

	onInsertButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	},

	onPreviewButtonClick: function() {
		elementor.templates.getLayout().showPreviewView( this.model );
	}
} );

module.exports = TemplatesTemplateView;
