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

		return new Proxy( this, {
			get: function( target, prop ) {
				// Add a hook after executing the `add`/`remove` methods.
				if ( [ 'add', 'remove' ].includes( prop ) ) {
					return ( ...args ) => {
						const result = target[ prop ]( ...args );

						target.updateType();
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
	 * @param fallback
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
	 * @param containers
	 * @param append
	 */
	add( containers, append = false ) {
		containers = Array.isArray( containers ) ? containers : [ containers ];

		for ( const container of containers ) {
			// If command/ctrl+click not clicked, clear selected elements.
			if ( ! append ) {
				this.remove( null, true );
			}

			this.elements[ container.id ] = container;

			container.view.select();
		}
	}

	/**
	 * Remove elements from selection.
	 *
	 * Remove elements from selection by their container, unless the parameter for clearing all selected elements is
	 * active, in which case the the whole selection is cleared.
	 *
	 * @param containers
	 * @param all
	 */
	remove( containers, all = false ) {
		containers = Array.isArray( containers ) ? containers : [ containers ];

		if ( all ) {
			containers = this.getElements();
		}

		for ( const container of containers ) {
			delete this.elements[ container.id ];

			container.view.deselect();
		}
	}

	/**
	 * Does element selected.
	 *
	 * Check whether an element container exists in the selected elements.
	 *
	 * @param container
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
		this.type = this.elements.length && this.elements.reduce( ( previous, current ) => {
			if ( previous === current.type ) {
				return current.type;
			}

			return false;
		}, this.elements[ 0 ] );
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
	 * Does selection has element.
	 *
	 * Check whether an element is selected by it's container.
	 *
	 * @param container
	 * @returns {boolean}
	 */
	hasElement( container ) {
		return this.getElements()
			.includes( container );
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
	 * @returns {boolean|*}
	 */
	isSameType() {
		return ! this.getElements().length ||
			this.type;
	}
}
