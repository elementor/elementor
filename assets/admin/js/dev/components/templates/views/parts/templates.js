var TemplatesCollection = require( 'elementor-templates/collections/templates' ),
	TemplatesTemplateView = require( 'elementor-templates/views/template/template' ),
	TemplatesCollectionView;

TemplatesCollectionView = Marionette.CollectionView.extend( {
	childView: TemplatesTemplateView,

	className: 'elementor-templates-templates-container',

	initialize: function() {
		this.collection = new TemplatesCollection( this.getOption( 'templates' ) );
	}
} );

module.exports = TemplatesCollectionView;
