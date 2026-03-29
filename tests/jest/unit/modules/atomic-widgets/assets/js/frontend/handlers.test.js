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

	describe( 'atomic form field label resolution', () => {
		const createForm = () => {
			const form = document.createElement( 'form' );
			form.setAttribute( 'data-element_type', 'e-form' );
			form.setAttribute( 'data-id', 'test-form' );
			document.body.appendChild( form );
			return form;
		};

		const createInput = ( attrs = {} ) => {
			const input = document.createElement( 'input' );
			input.setAttribute( 'type', 'text' );
			Object.entries( attrs ).forEach( ( [ key, value ] ) => {
				input.setAttribute( key, value );
			} );
			return input;
		};

		it( 'prefers aria-label over everything else', async () => {
			await importHandlers();
			const form = createForm();
			const input = createInput( {
				'aria-label': 'Aria Label',
				placeholder: 'Placeholder',
				id: 'field-1',
				'data-interaction-id': 'f1',
			} );
			const label = document.createElement( 'label' );
			label.setAttribute( 'for', 'field-1' );
			label.textContent = 'Label Element';
			form.appendChild( label );
			form.appendChild( input );

			const fields = [];
			form.querySelectorAll( 'input[data-interaction-id]' ).forEach( ( el ) => {
				const ariaLabel = el.getAttribute( 'aria-label' );
				fields.push( ariaLabel );
			} );

			expect( fields[ 0 ] ).toBe( 'Aria Label' );
		} );

		it( 'prefers label[for] over placeholder', async () => {
			await importHandlers();
			const form = createForm();
			const input = createInput( {
				placeholder: 'your@mail.com',
				id: 'field-email',
				'data-interaction-id': 'f2',
			} );
			const label = document.createElement( 'label' );
			label.setAttribute( 'for', 'field-email' );
			label.textContent = 'Email';
			form.appendChild( label );
			form.appendChild( input );

			const fieldId = input.getAttribute( 'id' );
			const labelElement = form.querySelector( `label[for="${ fieldId }"]` );

			expect( labelElement.textContent.trim() ).toBe( 'Email' );
		} );

		it( 'uses placeholder as last resort', async () => {
			await importHandlers();
			const form = createForm();
			const input = createInput( {
				placeholder: 'Enter your name',
				'data-interaction-id': 'f3',
			} );
			form.appendChild( input );

			const ariaLabel = input.getAttribute( 'aria-label' );
			const fieldId = input.getAttribute( 'id' );
			const labelElement = fieldId ? form.querySelector( `label[for="${ fieldId }"]` ) : null;
			const placeholder = input.getAttribute( 'placeholder' );

			expect( ariaLabel ).toBeNull();
			expect( labelElement ).toBeNull();
			expect( placeholder ).toBe( 'Enter your name' );
		} );

		it( 'uses parent label when no aria-label, for-label, or placeholder', async () => {
			await importHandlers();
			const form = createForm();
			const parentLabel = document.createElement( 'label' );
			parentLabel.textContent = 'Parent Label';
			const input = createInput( { 'data-interaction-id': 'f4' } );
			parentLabel.appendChild( input );
			form.appendChild( parentLabel );

			const ariaLabel = input.getAttribute( 'aria-label' );
			const fieldId = input.getAttribute( 'id' );
			const closestLabel = input.closest( 'label' );

			expect( ariaLabel ).toBeNull();
			expect( fieldId ).toBeNull();
			expect( closestLabel.textContent.trim() ).toBe( 'Parent Label' );
		} );
	} );

	describe( 'atomic form submission behavior', () => {
		const createFormWithInput = () => {
			const form = document.createElement( 'form' );
			form.setAttribute( 'data-element_type', 'e-form' );
			form.setAttribute( 'data-id', 'test-form' );
			form.setAttribute( 'x-data', 'eFormtest-form' );

			const input = document.createElement( 'input' );
			input.setAttribute( 'type', 'text' );
			input.setAttribute( 'data-interaction-id', 'field-1' );
			input.setAttribute( 'aria-label', 'Name' );
			form.appendChild( input );

			const button = document.createElement( 'button' );
			button.setAttribute( 'type', 'submit' );
			form.appendChild( button );

			document.body.appendChild( form );
			return { form, input };
		};

		const setupFormHandler = async ( form ) => {
			const { getRegistration } = await importHandlers();
			const formRegistration = getRegistration( ATOMIC_FORM_HANDLER_ID );
			formRegistration.callback( { element: form } );

			const { Alpine } = jest.requireMock( '@elementor/alpinejs' );
			const lastCall = Alpine.data.mock.calls[ Alpine.data.mock.calls.length - 1 ];
			return lastCall[ 1 ]();
		};

		beforeEach( () => {
			global.elementorFrontend = {
				config: { post: { id: 123 } },
				utils: { urlActions: { runAction: jest.fn() } },
			};
			global.elementorFrontendConfig = {
				urls: { ajaxurl: 'http://test.local/wp-admin/admin-ajax.php' },
				nonces: { atomicFormsSendForm: 'test-nonce' },
			};
		} );

		afterEach( () => {
			delete global.fetch;
			delete global.elementorFrontendConfig;
		} );

		it( 'clears form fields on successful submission', async () => {
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true } ),
			} );

			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			expect( input.value ).toBe( '' );
		} );

		it( 'does not clear form fields on failed submission', async () => {
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( { ok: false } );

			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			expect( input.value ).toBe( 'Test value' );
		} );

		it( 'dismisses success message when user starts typing', async () => {
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true } ),
			} );

			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			expect( form.classList.contains( 'form-state-success' ) ).toBe( true );

			input.dispatchEvent( new Event( 'input', { bubbles: true } ) );

			expect( form.classList.contains( 'form-state-default' ) ).toBe( true );
			expect( form.classList.contains( 'form-state-success' ) ).toBe( false );
		} );
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

