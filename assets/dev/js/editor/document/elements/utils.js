/**
 * Add element to Redux state BY REFERENCE using Immer.
 *
 * @param {Object} element       - Element model data as JSON.
 * @param {Object} documentState - Document state from Redux reducer.
 * @param {string} parentId      - Parent element ID.
 * @param {number} index         - New index to insert at.
 */
export function addElementToDocumentState( element, documentState, parentId = 'document', index ) {
	const parent = documentState[ parentId ];

	if ( ! parent ) {
		return;
	}

	if ( Array.isArray( element ) ) {
		element.forEach( ( el ) => addElementToDocumentState(
			el,
			documentState,
			parentId,
			index,
		) );

		return;
	}

	documentState[ element.id ] = {
		...element,
		elements: [],
	};

	documentState[ parentId ].elements.splice( index ?? parent.elements.length, 0, element.id );

	if ( element.elements ) {
		element.elements.forEach( ( child ) => addElementToDocumentState(
			child,
			documentState,
			element.id,
		) );
	}
}

/**
 * Remove element from Redux state BY REFERENCE using Immer.
 *
 * @param {Object} elementId     - Element ID to remove.
 * @param {string} parentId      - Parent element ID.
 * @param {Object} documentState - Document state from Redux reducer.
 */
export function removeElementFromDocumentState( elementId, parentId, documentState ) {
	const element = documentState[ elementId ],
		parent = documentState[ parentId ];

	if ( ! element || ! parent ) {
		return;
	}

	element.elements.forEach( ( childId ) => removeElementFromDocumentState(
		childId,
		elementId,
		documentState,
	) );

	delete documentState[ elementId ];

	parent.elements = parent.elements.filter( ( childId ) => childId !== elementId );
}
