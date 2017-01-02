var TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' ),
	TemplateLibraryTemplateRemoteView;

TemplateLibraryTemplateRemoteView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-remote',

	onPreviewButtonClick: function() {
		elementor.templates.getLayout().showPreviewView( this.model );
	}
} );

module.exports = TemplateLibraryTemplateRemoteView;
