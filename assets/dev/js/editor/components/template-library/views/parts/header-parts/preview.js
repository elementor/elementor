var TemplateLibraryHeaderPreviewView;

TemplateLibraryHeaderPreviewView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-preview',

	id: 'elementor-template-library-header-preview',

	ui: {
		insertButton: '.elementor-template-library-template-insert'
	},

	events:  {
		'click @ui.insertButton': 'onInsertButtonClick'
	},

	templateView: null,

	initialize: function( options ) {
		this.templateView = options.templateView;

		this.model = this.templateView.model;
	},

	onInsertButtonClick: function() {
		this.templateView.insert( this.ui.insertButton.data( 'action' ) );
	}
} );

module.exports = TemplateLibraryHeaderPreviewView;
