import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';
const { isTierAtLeast } = require( 'elementor-utils/tiers' );

var TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' ),
	TemplateLibraryTemplateRemoteView;

TemplateLibraryTemplateRemoteView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-remote',

	ui() {
		return jQuery.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			favoriteCheckbox: '.elementor-template-library-template-favorite-input',
		} );
	},

	events() {
		return jQuery.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			'change @ui.favoriteCheckbox': 'onFavoriteCheckboxChange',
		} );
	},

	onPreviewButtonClick( event ) {
		event.stopPropagation();

		$e.route( 'library/preview', { model: this.model } );
	},

	onFavoriteCheckboxChange() {
		var isFavorite = this.ui.favoriteCheckbox[ 0 ].checked;

		this.model.set( 'favorite', isFavorite );

		elementor.templates.markAsFavorite( this.model, isFavorite );

		const userTier = elementor.config.library_connect?.current_access_tier;
		const templateTier = this.model.get( 'accessTier' );

		EditorOneEventManager.sendELibraryFavorite( {
			assetId: this.model.get( 'template_id' ),
			assetName: this.model.get( 'title' ),
			libraryType: this.model.get( 'type' ) || this.model.get( 'source' ),
			isFavorite,
			proRequired: ! isTierAtLeast( userTier, templateTier ),
		} );

		if ( ! isFavorite && elementor.templates.getFilter( 'favorite' ) ) {
			elementor.channels.templates.trigger( 'filter:change' );
		}
	},
} );

module.exports = TemplateLibraryTemplateRemoteView;
