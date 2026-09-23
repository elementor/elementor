var PanelElementsElementsView;

PanelElementsElementsView = Marionette.CollectionView.extend( {
	childView: require( 'elementor-panel/pages/elements/views/element' ),

	id: 'elementor-panel-elements',

	className: 'elementor-responsive-panel',

	initialize() {
		this.listenTo( elementor.channels.panelElements, 'filter:change', this.onFilterChanged );
		// Apply comparator immediately — the view may be created mid-search (filter:change already fired).
		this._syncAtomicComparator();
	},

	_syncAtomicComparator() {
		const filterValue = elementor.channels.panelElements.request( 'filter:value' );
		if ( filterValue && elementorCommon.config.experimentalFeatures?.e_atomic_elements ) {
			this.viewComparator = ( a, b ) => {
				if ( a.get( 'atomic' ) && ! b.get( 'atomic' ) ) {
					return -1;
				}
				if ( ! a.get( 'atomic' ) && b.get( 'atomic' ) ) {
					return 1;
				}
				return 0;
			};
		} else {
			this.viewComparator = null;
		}
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

		this._syncAtomicComparator();

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
