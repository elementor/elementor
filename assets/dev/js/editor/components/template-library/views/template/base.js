var TemplateLibraryTemplateView;

TemplateLibraryTemplateView = Marionette.ItemView.extend( {
	className: function() {
		var classes = 'elementor-template-library-template elementor-template-library-template-' + this.model.get( 'source' );

		if ( this.model.get( 'isPro' ) ) {
			classes += ' elementor-template-library-pro-template';
		}

		return classes;
	},

	ui: function() {
		return {
			previewButton: '.elementor-template-library-template-preview',
			insertButton: '.elementor-template-library-template-insert'
		};
	},

	events: function() {
		return {
			'click @ui.previewButton': 'onPreviewButtonClick',
			'click @ui.insertButton': 'onInsertButtonClick'
		};
	},

	insert: function() {
		elementor.templates.importTemplate( this.model );
	},

	onInsertButtonClick: function() {
		this.insert( this.ui.insertButton.data( 'action' ) );
	}
} );

module.exports = TemplateLibraryTemplateView;
