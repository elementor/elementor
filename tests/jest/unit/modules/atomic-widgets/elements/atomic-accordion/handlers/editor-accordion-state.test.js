jest.mock( '@elementor/frontend-handlers', () => ( {
	register: jest.fn(),
} ), { virtual: true } );

import {
	ACCORDION_ELEMENT_TYPE,
	HEADER_ELEMENT_TYPE,
	ITEM_ELEMENT_TYPE,
	SELECTED_CLASS,
} from 'elementor/modules/atomic-widgets/elements/atomic-accordion/handlers/accordion-header-selected';

const HANDLER_ID = 'e-accordion-preview-handler';

function createListenToChildrenMock() {
	const renderCallbacks = {};

	return {
		listenToChildren: jest.fn( ( elementTypes ) => ( {
			render: ( callback ) => {
				elementTypes.forEach( ( type ) => {
					renderCallbacks[ type ] = callback;
				} );
			},
		} ) ),
		fireRender: ( elementType, element ) => {
			renderCallbacks[ elementType ]?.( { detail: { element } } );
		},
	};
}

async function loadPreviewHandler() {
	jest.resetModules();
	jest.clearAllMocks();

	await import( 'elementor/modules/atomic-widgets/elements/atomic-accordion/handlers/editor-accordion-state' );

	const { register } = jest.requireMock( '@elementor/frontend-handlers' );
	const registration = register.mock.calls
		.map( ( [ call ] ) => call )
		.find( ( call ) => call.id === HANDLER_ID );

	expect( registration ).toBeDefined();

	return registration;
}

describe( 'editor-accordion-state handler', () => {
	afterEach( () => {
		document.body.innerHTML = '';
		delete window.parent;
	} );

	it( 're-applies e--selected when the header re-renders while its item stays open', async () => {
		const { listenToChildren, fireRender } = createListenToChildrenMock();
		const registration = await loadPreviewHandler();

		const accordion = document.createElement( 'div' );
		accordion.dataset.element_type = ACCORDION_ELEMENT_TYPE;
		accordion.dataset.id = 'accordion-1';

		const item = document.createElement( 'details' );
		item.dataset.element_type = ITEM_ELEMENT_TYPE;
		item.setAttribute( 'open', '' );

		const header = document.createElement( 'summary' );
		header.dataset.element_type = HEADER_ELEMENT_TYPE;
		item.append( header );
		accordion.append( item );
		document.body.append( accordion );

		window.parent = {
			elementor: {
				getContainer: () => ( {
					settings: {
						get: () => undefined,
					},
				} ),
				selection: {
					getElements: () => [],
				},
			},
		};

		const abortController = new AbortController();
		registration.callback( {
			element: accordion,
			signal: abortController.signal,
			listenToChildren,
		} );

		const rerenderedHeader = document.createElement( 'summary' );
		rerenderedHeader.dataset.element_type = HEADER_ELEMENT_TYPE;
		item.replaceChildren( rerenderedHeader );

		expect( rerenderedHeader.classList.contains( SELECTED_CLASS ) ).toBe( false );

		fireRender( HEADER_ELEMENT_TYPE, rerenderedHeader );

		expect( rerenderedHeader.classList.contains( SELECTED_CLASS ) ).toBe( true );
	} );
} );
