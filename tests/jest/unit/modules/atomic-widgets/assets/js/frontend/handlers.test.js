jest.mock( '@elementor/frontend-handlers', () => ( {
	registerBySelector: jest.fn(),
} ), { virtual: true } );

const HANDLER_ID = 'atomic-link-action-handler';
const SELECTOR = '[data-action-link]';
const ALLOWED_ACTION_URL = 'https://example.com/?action=popup';
const BLOCKED_ACTION_URL = 'https://example.com/?action=disallowed';
const ANY_CONTEXT_URL = 'https://example.com/?action=anything';

describe( 'Atomic Widgets frontend handlers', () => {
	let runAction;

	const importHandlers = async () => {
		await import( 'elementor/modules/atomic-widgets/assets/js/frontend/handlers' );

		const { registerBySelector: mockedRegisterBySelector } = jest.requireMock( '@elementor/frontend-handlers' );
		const [ registration ] = mockedRegisterBySelector.mock.calls[ 0 ] ?? [];

		expect( registration ).toBeDefined();

		return { registration, registerBySelector: mockedRegisterBySelector };
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
		const { registration, registerBySelector } = await importHandlers();

		// Act
		const { id, selector, callback } = registration;

		// Assert
		expect( registerBySelector ).toHaveBeenCalledTimes( 1 );
		expect( { id, selector } ).toEqual( { id: HANDLER_ID, selector: SELECTOR } );
		expect( typeof callback ).toBe( 'function' );
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
} );

