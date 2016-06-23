var TemplatesCollection = require( 'elementor-templates/collections/templates' ),
	TemplatesTemplateView = require( 'elementor-templates/views/template/template' ),
	TemplatesCollectionView;

TemplatesCollectionView = Marionette.CollectionView.extend( {
	childView: TemplatesTemplateView,

	id: 'elementor-templates-templates-container',

	initialize: function() {
		this.collection = new TemplatesCollection( this.getOption( 'templates' ) );

		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
	},

	filter: function( childModel ) {
		var filterValue = elementor.channels.templates.request( 'filter:text' );

		if ( ! filterValue ) {
			return true;
		}

		filterValue = filterValue.toLowerCase();

		if ( 0 >= childModel.get( 'title' ).toLowerCase().indexOf( filterValue ) ) {
			return true;
		}

		return _.any( childModel.get( 'keywords' ), function( keyword ) {
			return 0 >= keyword.toLowerCase().indexOf( filterValue );
		} );
	}
} );

module.exports = TemplatesCollectionView;
