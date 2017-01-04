var TemplateLibraryHeaderPreviewView;

TemplateLibraryHeaderPreviewView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-preview',

	templateHelpers: function() {
		return {
			getActionButton: this.getActionButton
		};
	},

	id: 'elementor-template-library-header-preview',

	ui: {
		insertButton: '#elementor-template-library-header-preview-insert'
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick'
	},

	onInsertButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	},

	getActionButton: function( isPro ) {
		var templateId = isPro ? '#tmpl-elementor-template-library-header-preview-get-pro-button' : '#tmpl-elementor-template-library-header-preview-insert-button';

		templateId = elementor.hooks.applyFilters( 'elementor/editor/templateLibrary/preview/actionButton', templateId );

		var template = Marionette.TemplateCache.get( templateId );

		return Marionette.Renderer.render( template );
	}
} );

module.exports = TemplateLibraryHeaderPreviewView;
