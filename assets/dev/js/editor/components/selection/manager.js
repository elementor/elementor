export default class Manager extends elementorModules.editor.utils.Module {
	/**
	 * Selected elements.
	 *
	 * The list of the selected elements.
	 *
	 * @type {{}}
	 */
	elements = {};

	/**
	 * Selected elements type.
	 *
	 * Represents the common type of multiple selected elements, or false when the selected elements are of different
	 * types.
	 *
	 * @type {string|boolean}
	 */
	type = false;

	/**
	 * Manager constructor.
	 *
	 * @returns {Manager}
	 */
	constructor() {
		super();

		// Subscribe to the selection state kept in redux.
		$e.store.subscribe( () => {
			const selectionSelector = ( state ) => state[ 'document/elements/selection' ];
			this.elements = selectionSelector( $e.store.getState() );
		} );

		// Using a Proxy in order to use update methods only once on external invocations, but internally the `add` or
		// `remove` methods may be executed many times, when update methods will be used only once.
		return new Proxy( this, {
			get: function( target, prop ) {
				if ( [ 'add', 'remove' ].includes( prop ) ) {
					return ( ...args ) => {
						const result = target[ prop ]( ...args );

						target.updateType();
						target.updateSortable();
						target.updatePanelPage();

						return result;
					};
				}

				return Reflect.get( ...arguments );
			},
		} );
	}

	/**
	 * Get selection elements.
	 *
	 * Get the list of selected elements as an array of containers. If a fallback element container specified, it will
	 * be returned when there are no selected elements.
	 *
	 * @param {Container[]|Container} fallback
	 * @returns {Container[]}
	 */
	getElements( fallback = null ) {
		let result = Object.values( this.elements );

		if ( ! result.length && fallback ) {
			result = Array.isArray( fallback ) ? fallback : [ fallback ];
		}

		return result;
	}

	/**
	 * Add elements to selection.
	 *
	 * Add new elements to selection by their container, and clear the currently selected elements unless appending is
	 * active, in which case the new elements are just added to the current selection.
	 *
	 * @param {Container[]|Container} containers
	 * @param {{}} options
	 */
	add( containers, options = { append: false } ) {
		containers = Array.isArray( containers ) ? containers : [ containers ];

		// If command/ctrl+click not clicked, clear selected elements.
		if ( ! options.append ) {
			this.remove( [], { all: true } );
		}

		for ( const container of containers ) {
			$e.store.dispatch(
				$e.store.get( 'document/elements/selection' ).actions.toggle( {
					container: container.id,
					state: true,
				} )
			);

			container.view.select();
		}

		if ( options.scrollIntoView ) {
			elementor.helpers.scrollToView( containers[ 0 ].view.$el, 200 );
		}

		if ( options.section ) {
			elementor.activateElementSection( options.section );
		}
	}

	/**
	 * Remove elements from selection.
	 *
	 * Remove elements from selection by their container, unless the parameter for clearing all selected elements is
	 * active, in which case the the whole selection is cleared.
	 *
	 * @param {Container[]|Container} containers
	 * @param {{}} options
	 */
	remove( containers, options = { all: false } ) {
		containers = Array.isArray( containers ) ? containers : [ containers ];

		if ( options.all ) {
			containers = this.getElements();
		}

		for ( const container of containers ) {
			$e.store.dispatch(
				$e.store.get( 'document/elements/selection' ).actions.toggle( {
					container: container.id,
					state: false,
				} )
			);

			container.view.deselect();
		}
	}

	/**
	 * Does element selected.
	 *
	 * Check whether an element container exists in the selected elements.
	 *
	 * @param {Container} container
	 * @returns {boolean}
	 */
	has( container ) {
		return this.getElements()
			.includes( container );
	}

	/**
	 * Update selected elements type.
	 *
	 * Resolve the common type of all selected elements and assign it as class property. When the selected objects are
	 * of different types, `false` is assigned.
	 */
	updateType() {
		const elements = this.getElements();

		this.type = Boolean( elements.length ) && elements.reduce( ( previous, current ) => {
			if ( previous === current.type ) {
				return current.type;
			}

			return false;
		}, elements[ 0 ].type );
	}

	/**
	 * Update sortable state.
	 *
	 * In case more than one element is selected, currently sorting supposed to be disabled, and vice-versa.
	 */
	updateSortable() {
		elementor.toggleSortableState( ! this.isMultiple() );
	}

	/**
	 * Update the panel page.
	 *
	 * Selected elements affect the panel panel in a way that when element is selected - its settings page is displayed,
	 * and when the element is blurred (unfocused) - the the default page opened. When more than one element selected,
	 * the default page should appear.
	 */
	updatePanelPage() {
		const elements = this.getElements();

		if ( 1 === elements.length ) {
			$e.run( 'panel/editor/open', {
				model: elements[ 0 ].model,
				view: elements[ 0 ].view,
			} );
		} else {
			$e.internal( 'panel/open-default', {
				autoFocusSearch: false,
			} );
		}
	}

	/**
	 * Is multiple selection.
	 *
	 * Check whether multiple elements were selected.
	 *
	 * @returns {boolean}
	 */
	isMultiple() {
		return this.getElements().length > 1;
	}

	/**
	 * Is selection of same type.
	 *
	 * Check whether the selected elements are of same type.
	 *
	 * @returns {boolean}
	 */
	isSameType() {
		return ! this.getElements().length ||
			Boolean( this.type );
	}
}
