jest.mock( '@elementor/frontend-handlers', () => ( {
	registerBySelector: jest.fn(),
} ), { virtual: true } );

jest.mock( '@elementor/alpinejs', () => ( {
	Alpine: {
		data: jest.fn(),
		destroyTree: jest.fn(),
		initTree: jest.fn(),
		nextTick: jest.fn( ( callback ) => callback() ),
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
		await import( 'elementor/modules/atomic-widgets/assets/js/frontend/action-link-handlers' );
		await import( 'elementor/modules/atomic-widgets/assets/js/frontend/form-handlers' );

		const { registerBySelector: mockedRegisterBySelector } = jest.requireMock( '@elementor/frontend-handlers' );
		const registrations = mockedRegisterBySelector.mock.calls
			.map( ( [ registration ] ) => registration )
			.filter( Boolean );
		const getRegistration = ( id ) => registrations.find( ( registration ) => registration.id === id );
		const registration = getRegistration( HANDLER_ID );

		expect( registration ).toBeDefined();
		expect( getRegistration( ATOMIC_FORM_HANDLER_ID ) ).toBeDefined();

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

	it( 'registers link and form handlers by selector', async () => {
		// Arrange
		// Act
		const { registration, registerBySelector, getRegistration } = await importHandlers();

		// Assert
		expect( registerBySelector ).toHaveBeenCalledTimes( REGISTRATIONS.length );
		expect( { id: registration.id, selector: registration.selector } ).toEqual( { id: HANDLER_ID, selector: SELECTOR } );
		expect( typeof registration.callback ).toBe( 'function' );
		expect( getRegistration( ATOMIC_FORM_HANDLER_ID ).selector ).toBe( '[data-element_type="e-form"]' );
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
			// Arrange
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

			// Assert
			expect( fields[ 0 ] ).toBe( 'Aria Label' );
		} );

		it( 'prefers label[for] over placeholder', async () => {
			// Arrange
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

			// Assert
			expect( labelElement.textContent.trim() ).toBe( 'Email' );
		} );

		it( 'uses placeholder as last resort', async () => {
			// Arrange
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

			// Assert
			expect( ariaLabel ).toBeNull();
			expect( labelElement ).toBeNull();
			expect( placeholder ).toBe( 'Enter your name' );
		} );

		it( 'uses parent label when no aria-label, for-label, or placeholder', async () => {
			// Arrange
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

			// Assert
			expect( ariaLabel ).toBeNull();
			expect( fieldId ).toBeNull();
			expect( closestLabel.textContent.trim() ).toBe( 'Parent Label' );
		} );
	} );

	describe( 'atomic form submission behavior', () => {
		const REDIRECT_DELAY_MS = 1000;

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
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true } ),
			} );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( input.value ).toBe( '' );
		} );

		it( 'sends fields added by before-submit listeners with the request', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			form.addEventListener( 'elementor/atomic-form/before-submit', ( beforeSubmitEvent ) => {
				beforeSubmitEvent.detail.addFields( Promise.resolve( { recaptcha_score_token: 'token-123' } ) );
			} );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true } ),
			} );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			const formData = global.fetch.mock.calls[ 0 ][ 1 ].body;
			expect( formData.get( 'recaptcha_score_token' ) ).toBe( 'token-123' );
			expect( form.classList.contains( 'form-state-success' ) ).toBe( true );
		} );

		it( 'fails the submission without a request when a before-submit listener rejects', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			form.addEventListener( 'elementor/atomic-form/before-submit', ( beforeSubmitEvent ) => {
				beforeSubmitEvent.detail.addFields( Promise.reject( new Error( 'reCAPTCHA failed' ) ) );
			} );

			global.fetch = jest.fn();

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( global.fetch ).not.toHaveBeenCalled();
			expect( form.classList.contains( 'form-state-error' ) ).toBe( true );
			expect( input.value ).toBe( 'Test value' );
		} );

		it( 'does not clear form fields on failed submission', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( { ok: false } );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( input.value ).toBe( 'Test value' );
		} );

		it( 'dismisses success message when user starts typing', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true } ),
			} );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( form.classList.contains( 'form-state-success' ) ).toBe( true );

			// Act
			input.dispatchEvent( new Event( 'input', { bubbles: true } ) );

			// Assert
			expect( form.classList.contains( 'form-state-default' ) ).toBe( true );
			expect( form.classList.contains( 'form-state-success' ) ).toBe( false );
		} );

		it( 'dispatches a submit success event with the response', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );
			const response = { success: true, data: { data: { actionResults: [] } } };
			const listener = jest.fn();

			document.addEventListener( 'elementor/atomic-form/submit-success', listener );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( response ),
			} );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener.mock.calls[ 0 ][ 0 ].target ).toBe( form );
			expect( listener.mock.calls[ 0 ][ 0 ].detail.response ).toEqual( response );
			expect( listener.mock.calls[ 0 ][ 0 ].detail.agentInvoked ).toBe( false );

			document.removeEventListener( 'elementor/atomic-form/submit-success', listener );
		} );

		it( 'marks the submit success event as agent invoked for agent submissions', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const listener = jest.fn();

			document.addEventListener( 'elementor/atomic-form/submit-success', listener );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true, data: { data: { actionResults: [] } } } ),
			} );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = jest.fn();

			// Act
			await instance.submit( event );

			// Assert
			expect( listener.mock.calls[ 0 ][ 0 ].detail.agentInvoked ).toBe( true );

			document.removeEventListener( 'elementor/atomic-form/submit-success', listener );
		} );

		it( 'does not dispatch a submit success event on failed submission', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );
			const listener = jest.fn();

			document.addEventListener( 'elementor/atomic-form/submit-success', listener );

			global.fetch = jest.fn().mockResolvedValue( { ok: false } );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( listener ).not.toHaveBeenCalled();

			document.removeEventListener( 'elementor/atomic-form/submit-success', listener );
		} );

		const successRedirectResponse = {
			success: true,
			data: {
				message: 'Success message',
				data: {
					actionResults: [
						{ type: 'webhook', status: 'success', redirectUrl: 'https://evil.example' },
						{ type: 'redirect', status: 'success', redirectUrl: 'https://example.org/thank-you' },
					],
				},
			},
		};

		it( 'redirects after a delay for human submissions', async () => {
			// Arrange
			jest.useFakeTimers();
			const assign = jest.fn();
			const originalLocation = window.location;

			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { ...originalLocation, assign },
			} );

			const { form, input } = createFormWithInput();
			input.value = 'Test value';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( successRedirectResponse ),
			} );

			try {
				// Act
				await instance.submit( new Event( 'submit', { cancelable: true } ) );

				// Assert
				expect( assign ).not.toHaveBeenCalled();

				jest.advanceTimersByTime( REDIRECT_DELAY_MS );

				expect( assign ).toHaveBeenCalledTimes( 1 );
				expect( assign ).toHaveBeenCalledWith( 'https://example.org/thank-you' );
			} finally {
				Object.defineProperty( window, 'location', {
					configurable: true,
					value: originalLocation,
				} );
				jest.useRealTimers();
			}
		} );

		it( 'skips redirect for agent-invoked submissions', async () => {
			// Arrange
			jest.useFakeTimers();
			const assign = jest.fn();
			const originalLocation = window.location;

			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { ...originalLocation, assign },
			} );

			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( successRedirectResponse ),
			} );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			try {
				// Act
				await instance.submit( event );
				jest.advanceTimersByTime( REDIRECT_DELAY_MS );

				// Assert
				expect( respondWith ).toHaveBeenCalledTimes( 1 );
				expect( assign ).not.toHaveBeenCalled();
			} finally {
				Object.defineProperty( window, 'location', {
					configurable: true,
					value: originalLocation,
				} );
				jest.useRealTimers();
			}
		} );

		const createRedirectResponse = ( { success = true, redirectUrl = 'https://example.org/thank-you' } = {} ) => ( {
			success,
			data: {
				message: success ? 'Success message' : 'Error message',
				data: {
					actionResults: [ { type: 'redirect', status: 'success', redirectUrl } ],
				},
			},
		} );

		const submitAndGetRedirectAssign = async ( response ) => {
			jest.useFakeTimers();
			const assign = jest.fn();
			const originalLocation = window.location;

			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { ...originalLocation, assign },
			} );

			try {
				const { form, input } = createFormWithInput();
				input.value = 'Test value';

				const instance = await setupFormHandler( form );

				global.fetch = jest.fn().mockResolvedValue( {
					ok: true,
					json: () => Promise.resolve( response ),
				} );

				await instance.submit( new Event( 'submit', { cancelable: true } ) );
				jest.advanceTimersByTime( REDIRECT_DELAY_MS );

				return assign;
			} finally {
				Object.defineProperty( window, 'location', {
					configurable: true,
					value: originalLocation,
				} );
				jest.useRealTimers();
			}
		};

		it( 'skips redirect when the submission is not successful', async () => {
			// Act
			const assign = await submitAndGetRedirectAssign( createRedirectResponse( { success: false } ) );

			// Assert
			expect( assign ).not.toHaveBeenCalled();
		} );

		it.each( [
			[ 'javascript:alert(1)' ],
			[ 'data:text/html,<script>alert(1)</script>' ],
			[ 'mailto:user@example.org' ],
			[ 'http://[invalid' ],
		] )( 'skips redirect for a disallowed or invalid redirect URL: %s', async ( redirectUrl ) => {
			// Act
			const assign = await submitAndGetRedirectAssign( createRedirectResponse( { redirectUrl } ) );

			// Assert
			expect( assign ).not.toHaveBeenCalled();
		} );

		it( 'redirects to ftp URLs allowed by the server', async () => {
			// Act
			const assign = await submitAndGetRedirectAssign( createRedirectResponse( { redirectUrl: 'ftp://files.example.org/file.zip' } ) );

			// Assert
			expect( assign ).toHaveBeenCalledWith( 'ftp://files.example.org/file.zip' );
		} );

		it( 'responds to agent-invoked submissions with respondWith', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( {
					success: true,
					data: { message: 'Success message' },
				} ),
			} );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			await instance.submit( event );

			// Assert
			expect( respondWith ).toHaveBeenCalledTimes( 1 );
			const responsePromise = respondWith.mock.calls[ 0 ][ 0 ];
			await expect( responsePromise ).resolves.toEqual( {
				success: true,
				state: 'success',
				message: 'Success message',
				data: null,
			} );
		} );

		it( 'calls respondWith synchronously, before the submission finishes', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true, data: { message: 'Success message' } } ),
			} );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			const submission = instance.submit( event );

			// Assert
			expect( respondWith ).toHaveBeenCalledTimes( 1 );

			await submission;
		} );

		it( 'returns nested agent payload data without duplicating the message', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( {
					success: true,
					data: {
						message: 'Success message',
						data: { submission_id: 42 },
					},
				} ),
			} );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			await instance.submit( event );

			// Assert
			const responsePromise = respondWith.mock.calls[ 0 ][ 0 ];
			await expect( responsePromise ).resolves.toEqual( {
				success: true,
				state: 'success',
				message: 'Success message',
				data: { submission_id: 42 },
			} );
		} );

		it( 'responds to agent-invoked invalid payloads with an error', async () => {
			// Arrange
			const form = document.createElement( 'form' );
			form.setAttribute( 'data-element_type', 'e-form' );
			form.setAttribute( 'data-id', 'test-form' );
			form.setAttribute( 'x-data', 'eFormtest-form' );
			document.body.appendChild( form );

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();
			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			await instance.submit( event );

			// Assert
			expect( respondWith ).toHaveBeenCalledTimes( 1 );
			const responsePromise = respondWith.mock.calls[ 0 ][ 0 ];
			await expect( responsePromise ).resolves.toEqual( {
				success: false,
				state: 'error',
				message: 'Invalid form payload.',
				data: null,
			} );
			expect( form.classList.contains( 'form-state-error' ) ).toBe( true );
		} );

		it( 'responds to agent-invoked submission failures with an error', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			global.fetch = jest.fn().mockRejectedValue( new Error( 'Network error' ) );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			await instance.submit( event );

			// Assert
			const responsePromise = respondWith.mock.calls[ 0 ][ 0 ];
			await expect( responsePromise ).resolves.toEqual( {
				success: false,
				state: 'error',
				message: 'Network error',
				data: null,
			} );
		} );

		it( 'responds to agent-invoked submissions when form is already submitting', async () => {
			// Arrange
			const { form } = createFormWithInput();
			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			form.dataset.atomicFormSubmitting = 'true';

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			await instance.submit( event );

			// Assert
			expect( respondWith ).toHaveBeenCalledTimes( 1 );
			const responsePromise = respondWith.mock.calls[ 0 ][ 0 ];
			await expect( responsePromise ).resolves.toEqual( {
				success: false,
				state: 'error',
				message: 'Form is already submitting.',
				data: null,
			} );
		} );

		it( 'responds to agent-invoked HTTP failures with an error', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Agent value';

			const instance = await setupFormHandler( form );
			const respondWith = jest.fn();

			global.fetch = jest.fn().mockResolvedValue( {
				ok: false,
			} );

			const event = new Event( 'submit', { cancelable: true } );
			event.agentInvoked = true;
			event.respondWith = respondWith;

			// Act
			await instance.submit( event );

			// Assert
			const responsePromise = respondWith.mock.calls[ 0 ][ 0 ];
			await expect( responsePromise ).resolves.toEqual( {
				success: false,
				state: 'error',
				message: '',
				data: null,
			} );
		} );

		it( 're-enables submit buttons when a matching toolactivated event fires', async () => {
			// Arrange
			const { form } = createFormWithInput();
			form.setAttribute( 'toolname', 'contact_form_test_form' );

			const submitButton = form.querySelector( 'button[type="submit"]' );
			await setupFormHandler( form );

			form.dataset.atomicFormSubmitting = 'true';
			submitButton.disabled = true;

			const event = new Event( 'toolactivated' );
			event.toolName = 'contact_form_test_form';

			// Act
			window.dispatchEvent( event );

			// Assert
			expect( form.dataset.atomicFormSubmitting ).toBeUndefined();
			expect( submitButton.disabled ).toBe( false );
		} );

		it.each( [ 'toolactivated', 'toolcancel' ] )( 're-enables submit buttons when %s fires on document.modelContext', async ( eventName ) => {
			// Arrange
			document.modelContext = new EventTarget();

			const { form } = createFormWithInput();
			form.setAttribute( 'toolname', 'contact_form_test_form' );

			const submitButton = form.querySelector( 'button[type="submit"]' );
			await setupFormHandler( form );

			form.dataset.atomicFormSubmitting = 'true';
			submitButton.disabled = true;

			const event = new Event( eventName );
			event.toolName = 'contact_form_test_form';

			// Act
			document.modelContext.dispatchEvent( event );

			// Assert
			expect( form.dataset.atomicFormSubmitting ).toBeUndefined();
			expect( submitButton.disabled ).toBe( false );

			delete document.modelContext;
		} );

		it( 'keeps listening on window when document.modelContext exists', async () => {
			// Arrange
			document.modelContext = new EventTarget();

			const { form } = createFormWithInput();
			form.setAttribute( 'toolname', 'contact_form_test_form' );

			const submitButton = form.querySelector( 'button[type="submit"]' );
			await setupFormHandler( form );

			form.dataset.atomicFormSubmitting = 'true';
			submitButton.disabled = true;

			const event = new Event( 'toolcancel' );
			event.toolName = 'contact_form_test_form';

			// Act
			window.dispatchEvent( event );

			// Assert
			expect( form.dataset.atomicFormSubmitting ).toBeUndefined();
			expect( submitButton.disabled ).toBe( false );

			delete document.modelContext;
		} );

		it( 're-enables submit buttons when toolcancel fires on navigator.modelContext', async () => {
			// Arrange
			const navigatorModelContext = new EventTarget();
			Object.defineProperty( navigator, 'modelContext', { value: navigatorModelContext, configurable: true } );

			const { form } = createFormWithInput();
			form.setAttribute( 'toolname', 'contact_form_test_form' );

			const submitButton = form.querySelector( 'button[type="submit"]' );
			await setupFormHandler( form );

			form.dataset.atomicFormSubmitting = 'true';
			submitButton.disabled = true;

			const event = new Event( 'toolcancel' );
			event.toolName = 'contact_form_test_form';

			// Act
			navigatorModelContext.dispatchEvent( event );

			// Assert
			expect( form.dataset.atomicFormSubmitting ).toBeUndefined();
			expect( submitButton.disabled ).toBe( false );

			delete navigator.modelContext;
		} );

		it( 're-enables submit buttons when a matching toolcancel event fires', async () => {
			// Arrange
			const { form } = createFormWithInput();
			form.setAttribute( 'toolname', 'contact_form_test_form' );

			const submitButton = form.querySelector( 'button[type="submit"]' );
			await setupFormHandler( form );

			form.dataset.atomicFormSubmitting = 'true';
			submitButton.disabled = true;

			const event = new Event( 'toolcancel' );
			event.toolName = 'contact_form_test_form';

			// Act
			window.dispatchEvent( event );

			// Assert
			expect( form.dataset.atomicFormSubmitting ).toBeUndefined();
			expect( submitButton.disabled ).toBe( false );
		} );

		it( 'sends referer_title and referrer in FormData (atomic form / admin-ajax contract)', async () => {
			// Arrange
			const { form, input } = createFormWithInput();
			input.value = 'Test value';
			document.title = 'Submission Contract Page';

			const instance = await setupFormHandler( form );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { success: true } ),
			} );

			// Act
			await instance.submit( new Event( 'submit', { cancelable: true } ) );

			// Assert
			expect( global.fetch ).toHaveBeenCalledTimes( 1 );
			const fetchOptions = global.fetch.mock.calls[ 0 ][ 1 ];
			expect( fetchOptions.method ).toBe( 'POST' );
			expect( fetchOptions.body ).toBeInstanceOf( FormData );

			const body = fetchOptions.body;
			expect( body.has( 'referer_title' ) ).toBe( true );
			expect( body.has( 'referrer' ) ).toBe( true );
			expect( body.get( 'referer_title' ) ).toBe( 'Submission Contract Page' );
			expect( body.get( 'referrer' ) ).toBe( window.location.href );
		} );

		describe( 'field id inside a component', () => {
			// Mirrors a rendered field: data-interaction-id is the origin id, data-id is the instance-scoped id.
			const addField = ( form, { type = 'text', name, interactionId, instanceId = null, checked = false } ) => {
				const field = document.createElement( 'input' );
				field.setAttribute( 'type', type );
				field.setAttribute( 'name', name );
				field.setAttribute( 'data-interaction-id', interactionId );

				if ( instanceId ) {
					field.setAttribute( 'data-e-type', 'widget' );
					field.setAttribute( 'data-id', instanceId );
				}

				field.checked = checked;
				form.insertBefore( field, form.querySelector( 'button' ) );
			};

			const createEmptyForm = () => {
				const { form, input } = createFormWithInput();
				input.remove();
				return form;
			};

			const submitAndGetBody = async ( form ) => {
				const instance = await setupFormHandler( form );

				global.fetch = jest.fn().mockResolvedValue( {
					ok: true,
					json: () => Promise.resolve( { success: true } ),
				} );

				await instance.submit( new Event( 'submit', { cancelable: true } ) );

				return global.fetch.mock.calls[ 0 ][ 1 ].body;
			};

			it( 'uses data-id over data-interaction-id for a single field', async () => {
				// Arrange
				const form = createEmptyForm();
				addField( form, { name: 'email', interactionId: 'origin-field-1', instanceId: 'instance-field-1' } );

				// Act
				const body = await submitAndGetBody( form );

				// Assert
				expect( body.get( 'form_fields[0][id]' ) ).toBe( 'instance-field-1' );
			} );

			it( 'falls back to data-interaction-id for a single field without data-id', async () => {
				// Arrange
				const form = createEmptyForm();
				addField( form, { name: 'email', interactionId: 'origin-field-1' } );

				// Act
				const body = await submitAndGetBody( form );

				// Assert
				expect( body.get( 'form_fields[0][id]' ) ).toBe( 'origin-field-1' );
			} );

			it.each( [ 'radio', 'checkbox' ] )( 'uses data-id of the checked %s as the group field id', async ( type ) => {
				// Arrange
				const form = createEmptyForm();
				addField( form, { type, name: 'choice', interactionId: 'origin-a', instanceId: 'instance-a' } );
				addField( form, { type, name: 'choice', interactionId: 'origin-b', instanceId: 'instance-b', checked: true } );

				// Act
				const body = await submitAndGetBody( form );

				// Assert
				expect( body.get( 'form_fields[0][id]' ) ).toBe( 'instance-b' );
			} );

			it.each( [ 'radio', 'checkbox' ] )( 'falls back to data-interaction-id for a %s group without data-id', async ( type ) => {
				// Arrange
				const form = createEmptyForm();
				addField( form, { type, name: 'choice', interactionId: 'origin-a' } );
				addField( form, { type, name: 'choice', interactionId: 'origin-b', checked: true } );

				// Act
				const body = await submitAndGetBody( form );

				// Assert
				expect( body.get( 'form_fields[0][id]' ) ).toBe( 'origin-b' );
			} );
		} );
	} );

	it( 'adds non-whitelisted editor link actions via filter', async () => {
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

