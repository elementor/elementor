var TemplateLibraryTemplatesEmptyView;

TemplateLibraryTemplatesEmptyView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-templates-empty',

	template: '#tmpl-elementor-template-library-templates-empty',

	ui: {
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message',
		image: '.elementor-template-library-no-results',
		button: '.elementor-template-library-cloud-empty__button',
	},

	modesStrings: {
		empty: {
			title: __( 'Haven’t Saved Templates Yet?', 'elementor' ),
			message: __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
			image: `${ elementorCommon.config.urls.assets }images/no-search-results.svg`,
			button: '',
		},
		noResults: {
			title: __( 'No Results Found', 'elementor' ),
			message: __( 'Please make sure your search is spelled correctly or try a different words.', 'elementor' ),
			image: `${ elementorCommon.config.urls.assets }images/no-search-results.svg`,
			button: '',
		},
		noFavorites: {
			title: __( 'No Favorite Templates', 'elementor' ),
			message: __( 'You can mark any pre-designed template as a favorite.', 'elementor' ),
			image: `${ elementorCommon.config.urls.assets }images/no-search-results.svg`,
			button: '',
		},
		cloudEmpty: {
			title: __( 'Haven’t saved templates to cloud library yet?', 'elementor' ),
			message: __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
			image: `${ elementorCommon.config.urls.assets }images/no-search-results-cloud.svg`,
			button: '<a class="elementor-button e-primary" href="" target="_blank">call to action</a>',
		},
	},

	getCurrentMode() {
		if ( elementor.templates.getFilter( 'text' ) ) {
			return 'noResults';
		}

		if ( elementor.templates.getFilter( 'favorite' ) ) {
			return 'noFavorites';
		}

		if ( 'cloud' === elementor.templates.getFilter( 'source' ) ) {
			return 'cloudEmpty';
		}

		return 'empty';
	},

	onRender() {
		var modeStrings = this.modesStrings[ this.getCurrentMode() ];

		this.ui.title.html( modeStrings.title );

		this.ui.message.html( modeStrings.message );

		this.ui.button.html( modeStrings.button );

		this.ui.image.attr( 'src', modeStrings.image );
	},
} );

module.exports = TemplateLibraryTemplatesEmptyView;
