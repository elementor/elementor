const TemplateLibraryTemplatesEmptyView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-templates-empty',

	template: '#tmpl-elementor-template-library-templates-empty',

	ui: {
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message',
		icon: '.elementor-template-library-blank-icon',
		button: '.elementor-template-library-cloud-empty__button',
		backToEditor: '.e-back-to-editor',
	},

	events: {
		'click @ui.backToEditor': 'closeLibrary',
	},

	closeLibrary( event ) {
		event.preventDefault();
		$e.run( 'library/close' );
	},

	modesStrings() {
		const defaultIcon = this.getDefaultIcon();

		return {
			empty: {
				title: __( 'Haven’t Saved Templates Yet?', 'elementor' ),
				message: __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
				icon: defaultIcon,
				button: '',
			},
			noResults: {
				title: __( 'No Results Found', 'elementor' ),
				message: __( 'Please make sure your search is spelled correctly or try a different words.', 'elementor' ),
				icon: defaultIcon,
				button: '',
			},
			noFavorites: {
				title: __( 'No Favorite Templates', 'elementor' ),
				message: __( 'You can mark any pre-designed template as a favorite.', 'elementor' ),
				icon: defaultIcon,
				button: '',
			},
			cloudEmpty: {
				title: __( 'No templates saved just yet', 'elementor' ),
				message: __( 'Once you save a template, it’ll show up here, ready for reuse across all of your Elementor sites—no extra work needed.', 'elementor' ),
				icon: this.getCloudIcon(),
				button: `<a class="e-back-to-editor">${ __( 'Back to editor', 'elementor' ) }</a>`,
			},
			cloudFolderEmpty: {
				title: __( 'No templates to show here, yet', 'elementor' ),
				message: __( 'Once you save some templates to this folder, you can use them on any website you’re working on.', 'elementor' ),
				icon: this.getEmptyFolderIcon(),
				button: `<a class="e-back-to-editor">${ __( 'Back to editor', 'elementor' ) }</a>`,
			},
		};
	},

	getDefaultIcon() {
		return `<img src="${ elementorCommon.config.urls.assets }images/no-search-results.svg" class="elementor-template-library-no-results" loading="lazy" />`;
	},

	getCloudIcon() {
		return `<i class="eicon-library-cloud-empty" aria-hidden="true" title="Empty Cloud Library"></i>`;
	},

	getEmptyFolderIcon() {
		return `<i class="eicon-library-folder-empty" aria-hidden="true" title="Empty folder"></i>`;
	},

	getCurrentMode() {
		if ( elementor.templates.getFilter( 'text' ) ) {
			return 'noResults';
		}

		if ( elementor.templates.getFilter( 'favorite' ) ) {
			return 'noFavorites';
		}

		if ( 'cloud' === elementor.templates.getFilter( 'source' ) ) {
			return null !== elementor.templates.getFilter( 'parent' )
				? 'cloudFolderEmpty'
				: 'cloudEmpty';
		}

		return 'empty';
	},

	onRender() {
		const modeStrings = this.modesStrings()[ this.getCurrentMode() ];

		this.ui.title.html( modeStrings.title );

		this.ui.message.html( modeStrings.message );

		this.ui.button.html( modeStrings.button );

		this.ui.icon.html( modeStrings.icon );
	},
} );

module.exports = TemplateLibraryTemplatesEmptyView;
