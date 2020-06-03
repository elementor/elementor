var TemplateLibraryInsertTemplateBehavior = require( 'elementor-templates/behaviors/insert-template' );

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-preview',

	id: 'elementor-template-library-header-preview',

	behaviors: {
		insertTemplate: {
			behaviorClass: TemplateLibraryInsertTemplateBehavior,
		},
	},
} );
