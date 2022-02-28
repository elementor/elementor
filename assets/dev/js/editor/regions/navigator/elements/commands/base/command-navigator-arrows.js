import CommandBase from 'elementor-api/modules/command-base';

/**
 * @abstract
 */
export class CommandNavigatorArrows extends CommandBase {
	/**
	 * Gets the next element showed in the navigator for the given element, returns `undefined` if there isn't.
	 *
	 * @param containerId
	 * @param skipChildren
	 * @returns {string|undefined}
	 */
	static getNextOf( containerId, skipChildren = false ) {
		// TODO: When the parent is available in redux, use it instead.
		const parentId = elementor.getContainer( containerId ).parent?.id,
			store = $e.store.getState( 'document/elements' ),
			children = store[ containerId ].elements,
			siblings = store[ parentId ]?.elements;

		if ( this.isOpen( containerId ) && children.length && ! skipChildren ) {
			return children[ 0 ];
		} else if ( ! parentId ) {
			return;
		}

		return siblings[ siblings.indexOf( containerId ) + 1 ] ||
			this.getNextOf( parentId, true );
	}

	/**
	 * Gets the previous element showed in the navigator for the given element, returns `undefined` if there isn't.
	 *
	 * @param containerId
	 * @returns {string|undefined}
	 */
	static getPrevOf( containerId ) {
		// TODO: When the parent is available in redux, use it instead.
		const parentId = elementor.getContainer( containerId ).parent?.id,
			store = $e.store.getState( 'document/elements' ),
			siblings = store[ parentId ].elements,
			prev = siblings[ siblings.indexOf( containerId ) - 1 ];

		if ( ! prev ) {
			return 'document' === parentId ?
				undefined :
				parentId;
		}

		return this.lastOfTree( prev );
	}

	/**
	 * Whether an element folding is open.
	 *
	 * @param containerId
	 * @returns {boolean}
	 */
	static isOpen( containerId ) {
		return $e.store.getState( 'navigator/folding' )[ containerId ];
	}

	/**
	 * Gets the last element of a tree of elements, or the given one if it's not open or has no children.
	 *
	 * @param containerId
	 * @returns {*}
	 */
	static lastOfTree( containerId ) {
		const store = $e.store.getState( 'document/elements' ),
			children = store[ containerId ].elements;

		if ( ! this.isOpen( containerId ) || ! children.length ) {
			return containerId;
		}

		return this.lastOfTree( children[ children.length - 1 ] );
	}

	/**
	 * Move to the next element showed in the navigator.
	 */
	static next() {
		const selectedId = elementor.selection.getElements(
				// When no element is selected, use the first element in the document.
				elementor.getPreviewContainer().children[ 0 ]
			)[ 0 ].id,
			next = this.getNextOf( selectedId );

		if ( next ) {
			$e.run( 'document/elements/select', {
				container: elementor.getContainer( next ),
			} );
		}
	}

	/**
	 * Move to the next element showed in the navigator.
	 */
	static prev() {
		const selectedId = elementor.selection.getElements(
				// When no element is selected, use the first element in the document.
				elementor.getPreviewContainer().children[ 0 ]
			)[ 0 ].id,
			prev = this.getPrevOf( selectedId );

		if ( prev ) {
			$e.run( 'document/elements/select', {
				container: elementor.getContainer( prev ),
			} );
		}
	}
}

export default CommandNavigatorArrows;
