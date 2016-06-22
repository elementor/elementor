var ElementorTemplatesCollection = require( 'elementor-templates/collections/templates' ),
	ElementorTemplatesTemplateView = require( 'elementor-templates/views/template/template' ),
	ElementorTemplatesCollectionView;

ElementorTemplatesCollectionView = Marionette.CollectionView.extend( {
	childView: ElementorTemplatesTemplateView,

	className: 'elementor-templates-templates-container',

	initialize: function() {
		this.collection = new ElementorTemplatesCollection( this.getOption( 'templates' ) );
	}
} );

module.exports = ElementorTemplatesCollectionView;
