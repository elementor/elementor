var TemplateLibraryInsertTemplateBehavior = require( 'elementor-templates/behaviors/insert-template' );

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-preview',

	id: 'elementor-template-library-header-preview',

	behaviors() {
		const behaviors = {
			insertTemplate: {
				behaviorClass: TemplateLibraryInsertTemplateBehavior,
			},
		};

		return elementor.hooks.applyFilters( 'elementor/editor/template-library/preview/behaviors', behaviors, this );
	},
} );
