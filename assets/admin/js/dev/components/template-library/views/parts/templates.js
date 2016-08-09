var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateRemoteView = require( 'elementor-templates/views/template/remote' ),
	TemplateLibraryTemplatesEmptyView = require( 'elementor-templates/views/parts/templates-empty' ),
	TemplateLibraryCollectionView;

TemplateLibraryCollectionView = Marionette.CollectionView.extend( {
	id: 'elementor-template-library-templates-container',

	emptyView: TemplateLibraryTemplatesEmptyView,

	getChildView: function( childModel ) {
		if ( 'remote' === childModel.get( 'type' ) ) {
			return TemplateLibraryTemplateRemoteView;
		}

		return TemplateLibraryTemplateLocalView;
	},

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
		var isEmpty = this.children.isEmpty();

		this.$el.attr( 'data-template-type', isEmpty ? 'empty' : elementor.channels.templates.request( 'filter:type' ) );
	}
} );

module.exports = TemplateLibraryCollectionView;
