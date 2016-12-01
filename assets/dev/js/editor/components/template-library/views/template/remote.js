var TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' ),
	TemplateLibraryTemplateRemoteView;

TemplateLibraryTemplateRemoteView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-remote',

	templateHelpers: function() {
		return {
			getActionButton: this.getActionButton
		};
	},

	onPreviewButtonClick: function() {
		elementor.templates.getLayout().showPreviewView( this.model );
	},

	getActionButton: function( isPro ) {
		var templateId = isPro ? '#tmpl-elementor-template-library-get-pro-button' : '#tmpl-elementor-template-library-insert-button';

		templateId = elementor.hooks.applyFilters( 'elementor/editor/templateLibrary/remote/actionButton', templateId );

		var template = Marionette.TemplateCache.get( templateId );

		return Marionette.Renderer.render( template );
	}
} );

module.exports = TemplateLibraryTemplateRemoteView;
