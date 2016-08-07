var TemplateLibraryTemplateView = require( 'elementor-templates/views/template/template' ),
	TemplateLibraryCollectionView;

TemplateLibraryCollectionView = Marionette.CollectionView.extend( {
	childView: TemplateLibraryTemplateView,

	id: 'elementor-templates-templates-container',

	initialize: function() {
		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
	},

	filterByName: function( model ) {
		var filterValue = elementor.channels.templates.request( 'filter:text' );

		if ( ! filterValue ) {
			return true;
		}

		filterValue = filterValue.toLowerCase();

		if ( model.get( 'title' ).toLowerCase().indexOf( filterValue ) >= 0 ) {
			return true;
		}

		return _.any( model.get( 'keywords' ), function( keyword ) {
			return keyword.toLowerCase().indexOf( filterValue ) >= 0;
		} );
	},

	filterByType: function( model ) {
		var filterValue = elementor.channels.templates.request( 'filter:type' );

		if ( ! filterValue ) {
			return true;
		}

		return filterValue === model.get( 'type' );
	},

	filter: function( childModel ) {
		return this.filterByName( childModel ) && this.filterByType( childModel );
	}
} );

module.exports = TemplateLibraryCollectionView;
