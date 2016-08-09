var TemplateLibraryTemplateView;

TemplateLibraryTemplateView = Marionette.ItemView.extend( {
	className: function() {
		return 'elementor-template-library-template elementor-template-library-template-' + this.model.get( 'source' );
	},

	ui: function() {
		return {
			insertButton: '.elementor-template-library-template-insert',
			previewButton: '.elementor-template-library-template-preview'
		};
	},

	events: function() {
		return {
			'click @ui.insertButton': 'onInsertButtonClick',
			'click @ui.previewButton': 'onPreviewButtonClick'
		};
	},

	onInsertButtonClick: function() {
		elementor.templates.importTemplate( this.model );
	}
} );

module.exports = TemplateLibraryTemplateView;
