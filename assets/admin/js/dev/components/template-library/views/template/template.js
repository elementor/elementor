var TemplateLibraryTemplateView;

TemplateLibraryTemplateView = Marionette.ItemView.extend( {
	className: 'elementor-template-library-template',

	template: '#tmpl-elementor-template-library-template',

	ui: {
		insertButton: '.elementor-template-library-template-insert',
		previewButton: '.elementor-template-library-template-preview'
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

module.exports = TemplateLibraryTemplateView;
