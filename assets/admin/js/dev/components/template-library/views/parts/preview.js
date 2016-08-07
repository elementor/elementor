var TemplateLibraryPreviewView;

TemplateLibraryPreviewView = Marionette.ItemView.extend( {
	tagName: 'iframe',

	id: 'elementor-templates-preview',

	template: false,

	onRender: function() {
		this.$el.attr( 'src', this.getOption( 'url' ) );
	}
} );

module.exports = TemplateLibraryPreviewView;
