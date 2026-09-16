var PanelElementsElementsView;

PanelElementsElementsView = Marionette.CollectionView.extend( {
	childView: require( 'elementor-panel/pages/elements/views/element' ),

	id: 'elementor-panel-elements',

	className: 'elementor-responsive-panel',

	initialize() {
		this.listenTo( elementor.channels.panelElements, 'filter:change', this.onFilterChanged );
	},

	filter( childModel ) {
		const filterValue = elementor.channels.panelElements.request( 'filter:value' );

		if ( ! filterValue ) {
			return true;
		}

		// Prevent from wordpress widgets to show in search result.
		if ( childModel.get( 'hideOnSearch' ) ) {
			return false;
		}

		if ( -1 !== childModel.get( 'title' ).toLowerCase().indexOf( filterValue.toLowerCase() ) ) {
			return true;
		}

		// Get the filter input localized value.
		const localized = elementor.channels.panelElements.request( 'filter:localized' ) || '';

		return _.any( childModel.get( 'keywords' ), function( keyword ) {
			keyword = keyword.toLowerCase();

			const regularFilter = ( -1 !== keyword.indexOf( filterValue.toLowerCase() ) ),
				localizedFilter = ( localized && -1 !== keyword.indexOf( localized.toLowerCase() ) );

			return regularFilter || localizedFilter;
		} );
	},

	onFilterChanged() {
		const filterValue = elementor.channels.panelElements.request( 'filter:value' );

		if ( filterValue && elementorCommon.config.experimentalFeatures?.e_atomic_elements ) {
			// When V4 atomic elements are active, show them first in search results.
			this.collection.comparator = ( a, b ) => {
				const aIsAtomic = ( a.get( 'widgetType' ) || '' ).startsWith( 'e-' );
				const bIsAtomic = ( b.get( 'widgetType' ) || '' ).startsWith( 'e-' );
				if ( aIsAtomic && ! bIsAtomic ) {
					return -1;
				}
				if ( ! aIsAtomic && bIsAtomic ) {
					return 1;
				}
				return 0;
			};
			this.collection.sort();
		} else {
			this.collection.comparator = null;
		}

		if ( ! filterValue ) {
			this.onFilterEmpty();
		}

		this._renderChildren();

		this.triggerMethod( 'children:render' );
	},

	onFilterEmpty() {
		$e.routes.refreshContainer( 'panel' );
	},
} );

module.exports = PanelElementsElementsView;
