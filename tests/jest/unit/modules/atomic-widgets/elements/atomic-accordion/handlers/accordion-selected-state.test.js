jest.mock( '@elementor/frontend-handlers', () => ( {
	register: jest.fn(),
} ), { virtual: true } );

import {
	ACCORDION_ELEMENT_TYPE,
	HEADER_ELEMENT_TYPE,
	ITEM_ELEMENT_TYPE,
	SELECTED_CLASS,
} from 'elementor/modules/atomic-widgets/elements/atomic-accordion/handlers/accordion-header-selected';

const HANDLER_ID = 'e-accordion-selected-state-handler';

async function loadHandlerRegistration() {
	jest.resetModules();
	jest.clearAllMocks();

	await import( 'elementor/modules/atomic-widgets/elements/atomic-accordion/handlers/accordion-selected-state' );

	const { register } = jest.requireMock( '@elementor/frontend-handlers' );
	const [ registration ] = register.mock.calls.map( ( [ call ] ) => call );

	expect( registration ).toEqual( {
		elementType: ACCORDION_ELEMENT_TYPE,
		id: HANDLER_ID,
		callback: expect.any( Function ),
	} );

	return registration;
}

function buildAccordion() {
	const accordion = document.createElement( 'div' );
	accordion.dataset.element_type = ACCORDION_ELEMENT_TYPE;

	const item = document.createElement( 'details' );
	item.dataset.element_type = ITEM_ELEMENT_TYPE;
	const header = document.createElement( 'summary' );
	header.dataset.element_type = HEADER_ELEMENT_TYPE;
	item.append( header );
	accordion.append( item );
	document.body.append( accordion );

	return { accordion, item, header };
}

describe( 'accordion-selected-state handler', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'syncs e--selected on mount and on details toggle', async () => {
		const registration = await loadHandlerRegistration();
		const { accordion, item, header } = buildAccordion();
		const abortController = new AbortController();

		registration.callback( { element: accordion, signal: abortController.signal } );

		expect( header.classList.contains( SELECTED_CLASS ) ).toBe( false );

		item.setAttribute( 'open', '' );
		item.dispatchEvent( new Event( 'toggle', { bubbles: true } ) );

		expect( header.classList.contains( SELECTED_CLASS ) ).toBe( true );

		item.removeAttribute( 'open' );
		item.dispatchEvent( new Event( 'toggle', { bubbles: true } ) );

		expect( header.classList.contains( SELECTED_CLASS ) ).toBe( false );
	} );
} );
