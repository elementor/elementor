var TemplatesTemplateView = require( 'elementor-templates/views/template/template' ),
	TemplatesCollectionView;

TemplatesCollectionView = Marionette.CollectionView.extend( {
	childView: TemplatesTemplateView,

	id: 'elementor-templates-templates-container',

	initialize: function() {
		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
	},

	filter: function( childModel ) {
		var filterValue = elementor.channels.templates.request( 'filter:text' );

		if ( ! filterValue ) {
			return true;
		}

		filterValue = filterValue.toLowerCase();

		if ( childModel.get( 'title' ).toLowerCase().indexOf( filterValue ) >= 0 ) {
			return true;
		}

		return _.any( childModel.get( 'keywords' ), function( keyword ) {
			return keyword.toLowerCase().indexOf( filterValue ) >= 0;
		} );
	}
} );

module.exports = TemplatesCollectionView;
