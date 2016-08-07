var TemplateLibraryHeaderPreviewView;

TemplateLibraryHeaderPreviewView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-templates-header-preview',

	id: 'elementor-templates-header-preview',

	ui: {
		insertButton: '#elementor-templates-header-preview-insert'
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick'
	},

	onInsertButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	}
} );

module.exports = TemplateLibraryHeaderPreviewView;
