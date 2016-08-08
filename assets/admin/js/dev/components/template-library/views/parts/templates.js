var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateRemoteView = require( 'elementor-templates/views/template/remote' ),
	TemplateLibraryCollectionView;

TemplateLibraryCollectionView = Marionette.CollectionView.extend( {
	getChildView: function( childModel ) {
		if ( 'remote' === childModel.get( 'type' ) ) {
			return TemplateLibraryTemplateRemoteView;
		}

		return TemplateLibraryTemplateLocalView;
	},

	id: 'elementor-template-library-templates-container',

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
	},

	onRenderCollection: function() {
		this.$el.attr( 'data-template-type', elementor.channels.templates.request( 'filter:type' ) );
	}
} );

module.exports = TemplateLibraryCollectionView;
