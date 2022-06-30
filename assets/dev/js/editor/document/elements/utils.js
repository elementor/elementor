import { elementsSelection } from 'elementor-document/elements/selectors';

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

export function updateEnvironment() {
	updateNavigator();
	updatePanelPage();
	updateSortable();
}

/**
 * Update navigator selections.
 *
 * Any change in the document selected elements should be reflected in the navigator, this method is responsible for
 * updating the navigator.
 */
function updateNavigator() {
	elementor.navigator
		.getLayout()
		.elements
		.currentView
		.recursiveChildInvoke( 'updateSelection' );
}

/**
 * Update the panel page.
 *
 * Selected elements affect the panel panel in a way that when element is selected - its settings page is displayed,
 * and when the element is blurred (unfocused) - the the default page opened. When more than one element selected,
 * the default page should appear.
 */
function updatePanelPage() {
	const containers = elementsSelection.getContainers();

	if ( 1 === containers.length ) {
		$e.run( 'panel/editor/open', {
			model: containers[ 0 ].model,
			view: containers[ 0 ].view,
		} );
	} else {
		$e.internal( 'panel/open-default', {
			autoFocusSearch: false,
		} );
	}
}

/**
 * Update sortable state.
 *
 * In case more than one element is selected, currently sorting supposed to be disabled, and vice-versa.
 */
function updateSortable() {
	elementor.toggleSortableState( ! elementsSelection.isMultiple() );
}
