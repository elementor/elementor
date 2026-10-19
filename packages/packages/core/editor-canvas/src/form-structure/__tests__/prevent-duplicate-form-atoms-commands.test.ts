import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { type V1Element } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';

import { initDuplicateFormAtomsPrevention } from '../prevent-duplicate-form-atoms-commands';

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

const CREATE_COMMAND = 'document/elements/create';
const MOVE_COMMAND = 'document/elements/move';
const HONEYPOT_TYPE = 'e-form-honeypot';
const RECAPTCHA_SCORE_TYPE = 'e-form-recaptcha-score';

function createElement( type: string, children: V1Element[] = [] ): V1Element {
	const element = {
		id: type,
		model: { get: () => type },
		children,
	} as unknown as V1Element;

	children.forEach( ( child ) => {
		child.parent = element;
	} );

	return element;
}

describe( 'prevent duplicate form atoms', () => {
	const hooksRegistry = createHooksRegistry();

	const isAllowed = ( command: string, args: unknown ) => hooksRegistry.getByCommand( command )?.apply( args );

	beforeEach( () => {
		jest.mocked( notify ).mockClear();
		setupHooksRegistry( hooksRegistry );
		initDuplicateFormAtomsPrevention();
	} );

	it( 'should allow adding the first honeypot to a form', () => {
		// Arrange
		const flexbox = createElement( 'e-flexbox' );
		createElement( 'e-form', [ flexbox ] );

		// Act
		const result = isAllowed( CREATE_COMMAND, { container: flexbox, model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( result ).toBe( true );
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should block a second honeypot in the same form and show a toast', () => {
		// Arrange
		const flexbox = createElement( 'e-flexbox' );
		createElement( 'e-form', [ createElement( HONEYPOT_TYPE ), flexbox ] );

		// Act
		const result = isAllowed( CREATE_COMMAND, { container: flexbox, model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( result ).toBe( false );
		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( { message: 'Only one Honeypot can be added per form.' } )
		);
	} );

	it( 'should block pasting a container that holds a honeypot into a form that already has one', () => {
		// Arrange
		const form = createElement( 'e-form', [ createElement( HONEYPOT_TYPE ) ] );

		// Act
		const result = isAllowed( CREATE_COMMAND, {
			container: form,
			model: { elType: 'e-flexbox', elements: [ { widgetType: HONEYPOT_TYPE } ] },
		} );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should allow a honeypot in a second form on the same page', () => {
		// Arrange
		const secondForm = createElement( 'e-form' );
		createElement( 'document', [ createElement( 'e-form', [ createElement( HONEYPOT_TYPE ) ] ), secondForm ] );

		// Act
		const result = isAllowed( CREATE_COMMAND, { container: secondForm, model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should ignore the create that runs as part of a move', () => {
		// Arrange
		const form = createElement( 'e-form', [ createElement( HONEYPOT_TYPE ) ] );
		const eWindow = window as unknown as { $e: { commands?: { currentTrace?: string[] } } };
		eWindow.$e.commands = { currentTrace: [ MOVE_COMMAND, CREATE_COMMAND ] };

		// Act
		const result = isAllowed( CREATE_COMMAND, { container: form, model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should allow reordering a honeypot inside its own form', () => {
		// Arrange
		const honeypot = createElement( HONEYPOT_TYPE );
		const flexbox = createElement( 'e-flexbox' );
		createElement( 'e-form', [ honeypot, flexbox ] );

		// Act
		const result = isAllowed( MOVE_COMMAND, { containers: [ honeypot ], target: flexbox } );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should block moving a honeypot into another form that already has one', () => {
		// Arrange
		const honeypot = createElement( HONEYPOT_TYPE );
		const targetForm = createElement( 'e-form', [ createElement( HONEYPOT_TYPE ) ] );
		createElement( 'document', [ createElement( 'e-form', [ honeypot ] ), targetForm ] );

		// Act
		const result = isAllowed( MOVE_COMMAND, { containers: [ honeypot ], target: targetForm } );

		// Assert
		expect( result ).toBe( false );
		expect( notify ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should block a second reCAPTCHA Score in the same form and show its toast', () => {
		// Arrange
		const flexbox = createElement( 'e-flexbox' );
		createElement( 'e-form', [ createElement( RECAPTCHA_SCORE_TYPE ), flexbox ] );

		// Act
		const result = isAllowed( CREATE_COMMAND, {
			container: flexbox,
			model: { widgetType: RECAPTCHA_SCORE_TYPE },
		} );

		// Assert
		expect( result ).toBe( false );
		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( { message: 'Only one Score-based reCAPTCHA can be added per form.' } )
		);
	} );

	it( 'should allow a reCAPTCHA Score in a form that already has a honeypot', () => {
		// Arrange
		const form = createElement( 'e-form', [ createElement( HONEYPOT_TYPE ) ] );

		// Act
		const result = isAllowed( CREATE_COMMAND, { container: form, model: { widgetType: RECAPTCHA_SCORE_TYPE } } );

		// Assert
		expect( result ).toBe( true );
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should allow a reCAPTCHA Score in a second form on the same page', () => {
		// Arrange
		const secondForm = createElement( 'e-form' );
		createElement( 'document', [
			createElement( 'e-form', [ createElement( RECAPTCHA_SCORE_TYPE ) ] ),
			secondForm,
		] );

		// Act
		const result = isAllowed( CREATE_COMMAND, {
			container: secondForm,
			model: { widgetType: RECAPTCHA_SCORE_TYPE },
		} );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should block moving a reCAPTCHA Score into another form that already has one', () => {
		// Arrange
		const recaptcha = createElement( RECAPTCHA_SCORE_TYPE );
		const targetForm = createElement( 'e-form', [ createElement( RECAPTCHA_SCORE_TYPE ) ] );
		createElement( 'document', [ createElement( 'e-form', [ recaptcha ] ), targetForm ] );

		// Act
		const result = isAllowed( MOVE_COMMAND, { containers: [ recaptcha ], target: targetForm } );

		// Assert
		expect( result ).toBe( false );
		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( { message: 'Only one Score-based reCAPTCHA can be added per form.' } )
		);
	} );
} );
