var TemplateLibraryTemplatesEmptyView;

TemplateLibraryTemplatesEmptyView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-templates-empty',

	template: '#tmpl-elementor-template-library-templates-empty',

	ui: {
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message',
	},

	modesStrings: {
		empty: {
			title: __( 'Haven’t Saved Templates Yet?', 'elementor' ),
			message: __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
		},
		noResults: {
			title: __( 'No Results Found', 'elementor' ),
			message: __( 'Please make sure your search is spelled correctly or try a different words.', 'elementor' ),
		},
		noFavorites: {
			title: __( 'No Favorite Templates', 'elementor' ),
			message: __( 'You can mark any pre-designed template as a favorite.', 'elementor' ),
		},
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
	},
} );

module.exports = TemplateLibraryTemplatesEmptyView;
