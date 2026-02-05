jest.mock( '@elementor/frontend-handlers', () => ( {
	registerBySelector: jest.fn(),
} ), { virtual: true } );

jest.mock( '@elementor/alpinejs', () => ( {
	Alpine: {
		data: jest.fn(),
		destroyTree: jest.fn(),
	},
} ), { virtual: true } );

const HANDLER_ID = 'atomic-link-action-handler';
const SELECTOR = '[data-action-link], :has(> [data-action-link])';
const ATOMIC_FORM_HANDLER_ID = 'atomic-form-submit-handler';
const REGISTRATIONS = [ 'action-link', 'form-prevention' ];

const ALLOWED_ACTION = 'off_canvas';
const BLOCKED_ACTION = 'popup';

const ALLOWED_ACTION_URL = `https://example.com/?action=${ ALLOWED_ACTION }`;
const BLOCKED_ACTION_URL = `https://example.com/?action=${ BLOCKED_ACTION }`;
const ANY_CONTEXT_URL = 'https://example.com/?action=anything';

describe( 'Atomic Widgets frontend handlers', () => {
	let runAction;

	const importHandlers = async () => {
		await import( 'elementor/modules/atomic-widgets/assets/js/frontend/handlers' );

		const { registerBySelector: mockedRegisterBySelector } = jest.requireMock( '@elementor/frontend-handlers' );
		const registrations = mockedRegisterBySelector.mock.calls
			.map( ( [ registration ] ) => registration )
			.filter( Boolean );
		const getRegistration = ( id ) => registrations.find( ( registration ) => registration.id === id );
		const registration = getRegistration( HANDLER_ID );

		expect( registration ).toBeDefined();

		return {
			registration,
			registrations,
			getRegistration,
			registerBySelector: mockedRegisterBySelector,
		};
	};

	beforeEach( () => {
		jest.resetModules();
		jest.clearAllMocks();
		document.body.innerHTML = '';
		delete global.elementor;
		delete global.elementorFrontend;

		runAction = jest.fn();
		global.elementorFrontend = { utils: { urlActions: { runAction } } };
	} );

	it( 'registers link action handler by selector', async () => {
		// Arrange
		const { registration, registerBySelector, getRegistration } = await importHandlers();

		// Act
		const { id, selector, callback } = registration;

		// Assert
		expect( registerBySelector ).toHaveBeenCalledTimes( REGISTRATIONS.length );
		expect( { id, selector } ).toEqual( { id: HANDLER_ID, selector: SELECTOR } );
		expect( typeof callback ).toBe( 'function' );
		expect( getRegistration( ATOMIC_FORM_HANDLER_ID ) ).toBeDefined();
	} );

	it( 'does not attach listeners when action link is missing', async () => {
		// Arrange
		const { registration } = await importHandlers();
		const element = document.createElement( 'button' );

		// Act
		const cleanup = registration.callback( { element } );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

        element.dispatchEvent( event );

		// Assert
		expect( cleanup ).toBeUndefined();
		expect( event.defaultPrevented ).toBe( false );
	} );

	it( 'runs whitelisted editor link actions and cleans up listeners', async () => {
		// Arrange
		global.elementor = {};
		const { registration } = await importHandlers();
		const element = document.createElement( 'button' );

        element.dataset.actionLink = ALLOWED_ACTION_URL;

        const cleanup = registration.callback( { element } );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

		// Act
		element.dispatchEvent( event );
		cleanup?.();

        const secondEvent = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

        element.dispatchEvent( secondEvent );

		// Assert
		expect( event.defaultPrevented ).toBe( true );
		expect( runAction ).toHaveBeenCalledTimes( 1 );
		expect( runAction ).toHaveBeenCalledWith( ALLOWED_ACTION_URL, event );
		expect( secondEvent.defaultPrevented ).toBe( false );
	} );

	it( 'skips non-whitelisted editor link actions', async () => {
		// Arrange
		global.elementor = {};
		const { registration } = await importHandlers();
		const element = document.createElement( 'button' );
		element.dataset.actionLink = BLOCKED_ACTION_URL;
		registration.callback( { element } );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

		// Act
		element.dispatchEvent( event );

		// Assert
		expect( runAction ).not.toHaveBeenCalled();
		expect( event.defaultPrevented ).toBe( false );
	} );

	it( 'runs link actions outside editor context regardless of whitelist', async () => {
		// Arrange
		const { registration } = await importHandlers();
		const element = document.createElement( 'button' );

        element.dataset.actionLink = ANY_CONTEXT_URL;
		registration.callback( { element } );

        const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

		// Act
		element.dispatchEvent( event );

		// Assert
		expect( runAction ).toHaveBeenCalledTimes( 1 );
		expect( runAction ).toHaveBeenCalledWith( ANY_CONTEXT_URL, event );
		expect( event.defaultPrevented ).toBe( true );
	} );

	it( 'runs nested link actions only when clicking inside the nested element', async () => {
		// Arrange
		const { registration } = await importHandlers();
		const element = document.createElement( 'h2' );
		const nestedLink = document.createElement( 'a' );

		nestedLink.dataset.actionLink = ANY_CONTEXT_URL;
		element.appendChild( nestedLink );
		registration.callback( { element } );

		const linkEvent = new MouseEvent( 'click', { bubbles: true, cancelable: true } );
		const elementEvent = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

		// Act
		nestedLink.dispatchEvent( linkEvent );
		element.dispatchEvent( elementEvent );

		// Assert
		expect( runAction ).toHaveBeenCalledTimes( 1 );
		expect( runAction ).toHaveBeenCalledWith( ANY_CONTEXT_URL, linkEvent );
		expect( linkEvent.defaultPrevented ).toBe( true );
		expect( elementEvent.defaultPrevented ).toBe( false );
	} );

	it( 'adds non-whitelisted editor link actions', async () => {
		// Arrange
		global.elementor = {};
		global.elementorFrontend = { ...global.elementorFrontend, hooks: { applyFilters: () => [ BLOCKED_ACTION ] } };
		const { registration } = await importHandlers();

		const element = document.createElement( 'button' );

		element.dataset.actionLink = BLOCKED_ACTION_URL;
		registration.callback( { element } );

		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );

		// Act
		element.dispatchEvent( event );

		// Assert
		expect( event.defaultPrevented ).toBe( true );
		expect( runAction ).toHaveBeenCalledTimes( 1 );
		expect( runAction ).toHaveBeenCalledWith( BLOCKED_ACTION_URL, event );
	} );
} );

