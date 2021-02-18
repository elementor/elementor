var TemplateLibraryInsertTemplateBehavior = require( 'elementor-templates/behaviors/insert-template' ),
	TemplateLibraryTemplateView;

TemplateLibraryTemplateView = Marionette.ItemView.extend( {
	className: function() {
		var classes = 'elementor-template-library-template',
			source = this.model.get( 'source' );

		classes += ' elementor-template-library-template-' + source;

		if ( 'remote' === source ) {
			classes += ' elementor-template-library-template-' + this.model.get( 'type' );
		}

		if ( this.model.get( 'accessLevel' ) !== 0 ) {
			classes += ` elementor-template-library-pro-template elementor-template-library-pro-template--access-level-${ this.model.get( 'accessLevel' ) }`;
		}

		return classes;
	},

	ui: function() {
		return {
			previewButton: '.elementor-template-library-template-preview',
		};
	},

	events: function() {
		return {
			'click @ui.previewButton': 'onPreviewButtonClick',
		};
	},

	behaviors: {
		insertTemplate: {
			behaviorClass: TemplateLibraryInsertTemplateBehavior,
		},
	},
} );

module.exports = TemplateLibraryTemplateView;
