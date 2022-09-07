import { createEvent, fireEvent } from '@testing-library/dom';
import LockPro from 'elementor-admin/new-template/behaviors/lock-pro';

describe( 'New Template - Lock Pro Behavior', () => {
	let elements = {};

	beforeEach( () => {
		const lockOptions = {
			is_locked: true,
			button: {
				url: 'http://test.local/activate?utm_source=%%utm_source%%&utm_medium=%%utm_medium%%',
				text: 'Locked',
			},
			badge: {
				text: 'pro',
				icon: 'eicon-lock',
			},
		};

		window.document.body.innerHTML = `
			<form>
				<select class="template-type">
					<option value="unlocked" selected data-lock='${ JSON.stringify( { is_locked: false } ) }'></option>
					<option value="locked" data-lock='${ JSON.stringify( lockOptions ) }'></option>
				</select>

				<span class="badge e-hidden">
					<span class="badge-text"></span>
					<span class="badge-icon"></span>
				</span>

				<input type="submit" class="submit" value="Submit" />
				<a class="lock-button e-hidden" />
			</form>
		`;

		elements = {
			form: document.querySelector( 'form' ),
			submitButton: document.querySelector( `.submit` ),
			lockButton: document.querySelector( `.lock-button` ),
			templateType: document.querySelector( `.template-type` ),
			lockBadge: document.querySelector( `.badge` ),
			lockBadgeText: document.querySelector( `.badge-text` ),
			lockBadgeIcon: document.querySelector( `.badge-icon` ),
		};
	} );

	it( 'Should lock the UI for locked template type', () => {
		// Arrange.
		const lockProBehavior = new LockPro( elements );
		lockProBehavior.bindEvents();

		// Act.
		fireEvent.change( elements.templateType, { target: { value: 'locked' } } );

		// Assert.
		expect( elements.submitButton.classList.contains( 'e-hidden' ) ).toBe( true );
		expect( elements.lockButton.classList.contains( 'e-hidden' ) ).toBe( false );
		expect( elements.lockButton.innerText ).toBe( 'Locked' );
		expect( elements.lockBadge.classList.contains( 'e-hidden' ) ).toBe( false );
		expect( elements.lockBadgeText.innerText ).toBe( 'pro' );
		expect( elements.lockBadgeIcon.classList.contains( 'eicon-lock' ) ).toBe( true );
	} );

	it( 'Should lock the UI for locked template type when set to default', () => {
		// Arrange.
		elements.templateType.options[ 1 ].selected = true; // Set locked as default

		// Act.
		const lockProBehavior = new LockPro( elements );
		lockProBehavior.bindEvents();

		// Assert.
		expect( elements.submitButton.classList.contains( 'e-hidden' ) ).toBe( true );
		expect( elements.lockButton.classList.contains( 'e-hidden' ) ).toBe( false );
	} );

	it( 'Should unlock the UI for unlocked template type', () => {
		// Arrange.
		const lockProBehavior = new LockPro( elements );
		lockProBehavior.bindEvents();

		// Act - Change twice since the unlocked state is the default.
		fireEvent.change( elements.templateType, { target: { value: 'locked' } } );
		fireEvent.change( elements.templateType, { target: { value: 'unlocked' } } );

		// Assert.
		expect( elements.submitButton.classList.contains( 'e-hidden' ) ).toBe( false );
		expect( elements.submitButton.value ).toBe( 'Submit' );
		expect( elements.lockButton.classList.contains( 'e-hidden' ) ).toBe( true );
		expect( elements.lockBadge.classList.contains( 'e-hidden' ) ).toBe( true );
	} );

	it( 'Should prevent form submission for locked template type', () => {
		// Arrange.
		const lockProBehavior = new LockPro( elements );
		lockProBehavior.bindEvents();

		fireEvent.change( elements.templateType, { target: { value: 'locked' } } );

		// Act.
		const submitEvent = createEvent.submit( elements.form );

		fireEvent( elements.form, submitEvent );

		// Assert.
		expect( submitEvent.defaultPrevented ).toBe( true );
	} );

	it( 'Should allow form submission for unlocked template type', () => {
		// Arrange.
		const lockProBehavior = new LockPro( elements );
		lockProBehavior.bindEvents();

		// Change twice since the unlocked state is the default.
		fireEvent.change( elements.templateType, { target: { value: 'locked' } } );
		fireEvent.change( elements.templateType, { target: { value: 'unlocked' } } );

		// Act.
		const submitEvent = createEvent.submit( elements.form );

		fireEvent( elements.form, submitEvent );

		// Assert.
		expect( submitEvent.defaultPrevented ).toBe( false );
	} );

	it( 'Should replace lock link placeholders', () => {
		// Arrange.
		const lockProBehavior = new LockPro( elements );
		lockProBehavior.bindEvents();

		// Act.
		fireEvent.change( elements.templateType, { target: { value: 'locked' } } );

		// Assert.
		expect( elements.lockButton.href ).toBe( 'http://test.local/activate?utm_source=wp-add-new&utm_medium=wp-dash' );
	} );
} );
