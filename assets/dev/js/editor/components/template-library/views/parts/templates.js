var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateRemoteView = require( 'elementor-templates/views/template/remote' ),
	TemplateLibraryCollectionView;

TemplateLibraryCollectionView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-template-library-templates',

	id: 'elementor-template-library-templates',

	childViewContainer: '#elementor-template-library-templates-container',

	reorderOnSort: true,

	emptyView: function() {
		var EmptyView = require( 'elementor-templates/views/parts/templates-empty' );

		return new EmptyView();
	},

	ui: {
		filterText: '#elementor-template-library-filter-text',
		myFavoritesFilter: '#elementor-template-library-filter-my-favorites',
		orderInputs: '.elementor-template-library-order-input',
		orderLabels: '.elementor-template-library-order-label'
	},

	events: {
		'input @ui.filterText': 'onFilterTextInput',
		'change @ui.myFavoritesFilter': 'onMyFavoritesFilterChange',
		'mousedown @ui.orderLabels': 'onOrderLabelsClick'
	},

	comparators: {
		title: function( model ) {
			return model.get( 'title' ).toLowerCase();
		},
		popularityIndex: function( model ) {
			return -model.get( 'popularityIndex' );
		},
		trendIndex: function( model ) {
			return -model.get( 'trendIndex' );
		}
	},

	getChildView: function( childModel ) {
		if ( 'remote' === childModel.get( 'source' ) ) {
			return TemplateLibraryTemplateRemoteView;
		}

		return TemplateLibraryTemplateLocalView;
	},

	initialize: function() {
		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
	},

	filterByText: function( model, text ) {
		text = text.toLowerCase();

		if ( model.get( 'title' ).toLowerCase().indexOf( text ) >= 0 ) {
			return true;
		}

		return _.any( model.get( 'tags' ), function( tag ) {
			return tag.toLowerCase().indexOf( text ) >= 0;
		} );
	},

	filterByFavorite: function( model ) {
		return model.get( 'favorite' );
	},

	filter: function( childModel ) {
		var textFilter = elementor.templates.getFilter( 'text' ),
			sourceFilter = elementor.templates.getFilter( 'source' ),
			favoriteFilter = elementor.templates.getFilter( 'favorite' );

		return ( ! textFilter || this.filterByText( childModel, textFilter ) ) &&
			   ( ! favoriteFilter || 'remote' !== sourceFilter || this.filterByFavorite( childModel ) );
	},

	order: function( by, reverseOrder ) {
		var comparator = this.comparators[ by ] || by;

		if ( reverseOrder ) {
			comparator = this.reverseOrder( comparator );
		}

		this.collection.comparator = comparator;

		this.collection.sort();
	},

	activateOrdering: function( by, reverseOrder ) {
		var $orderInput = this.ui.orderInputs.filter( '[value="' + by + '"]' );

		reverseOrder = !! reverseOrder;

		$orderInput
			.attr( 'checked', true )
			.toggleClass( 'elementor-template-library-order-reverse', reverseOrder );

		this.order( by, reverseOrder );
	},

	reverseOrder: function( comparator ) {
		if ( 'function' !== typeof comparator ) {
			var comparatorValue = comparator;

			comparator = function( model ) {
				return model.get( comparatorValue );
			};
		}

		return function( left, right ) {
			var l = comparator( left ),
				r = comparator( right );

			if ( undefined === l ) {
				return -1;
			}

			if ( undefined === r ) {
				return 1;
			}

			return l < r ? 1 : l > r ? -1 : 0;
		};
	},

	setFilter: function( name, value, silent ) {
		elementor.channels.templates.reply( 'filter:' + name, value );

		if ( ! silent ) {
			elementor.channels.templates.trigger( 'filter:change' );
		}
	},

	addSourceData: function() {
		var isEmpty = this.children.isEmpty();

		this.$el.attr( 'data-template-source', isEmpty ? 'empty' : elementor.templates.getFilter( 'source' ) );
	},

	onRenderCollection: function() {
		this.addSourceData();
	},

	onBeforeRenderEmpty: function() {
		this.addSourceData();
	},

	onFilterTextInput: function() {
		this.setFilter( 'text', this.ui.filterText.val() );
	},

	onMyFavoritesFilterChange: function(  ) {
		this.setFilter( 'favorite', this.ui.myFavoritesFilter[0].checked );
	},

	onOrderLabelsClick: function( event ) {
		var $clickedInput = jQuery( event.currentTarget.control ),
			toggle;

		if ( ! $clickedInput[0].checked ) {
			toggle = 'asc' !== $clickedInput.data( 'default-ordering-direction' );
		}

		$clickedInput.toggleClass( 'elementor-template-library-order-reverse', toggle );

		this.order( $clickedInput.val(), $clickedInput.hasClass( 'elementor-template-library-order-reverse' ) );
	}
} );

module.exports = TemplateLibraryCollectionView;
