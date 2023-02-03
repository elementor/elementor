var TemplateLibraryPreviewView;

TemplateLibraryPreviewView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-preview',

	id: 'elementor-template-library-preview',

	ui: {
		iframe: '> iframe',
	},

	onRender() {
		this.ui.iframe.attr( 'src', this.getOption( 'url' ) );
	},
} );

module.exports = TemplateLibraryPreviewView;
