var TemplateLibraryTemplatesEmptyView;

TemplateLibraryTemplatesEmptyView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-templates-empty',

	template: '#tmpl-elementor-template-library-templates-empty',

	ui: {
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message'
	},

	modesStrings: {
		empty: {
			title: elementor.translate( 'templates_empty_title' ),
			message: elementor.translate( 'templates_empty_message' )
		},
		noResults: {
			title: elementor.translate( 'templates_no_results_title' ),
			message: elementor.translate( 'templates_no_results_message' )
		},
		noFavorites: {
			title: elementor.translate( 'templates_no_favorites_title' ),
			message: elementor.translate( 'templates_no_favorites_message' )
		}
	},

	getCurrentMode: function() {
		if ( elementor.templates.getFilter( 'text' ) ) {
			return 'noResults';
		}

		if ( elementor.templates.getFilter( 'favorite' ) ) {
			return 'noFavorites';
		}

		return 'empty';
	},

	onRender: function() {
		var modeStrings = this.modesStrings[ this.getCurrentMode() ];

		this.ui.title.html( modeStrings.title );

		this.ui.message.html( modeStrings.message );
	}
} );

module.exports = TemplateLibraryTemplatesEmptyView;
