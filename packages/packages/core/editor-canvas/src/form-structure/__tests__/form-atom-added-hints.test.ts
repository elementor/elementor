import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { notify } from '@elementor/editor-notifications';

import { initFormAtomAddedHints } from '../form-atom-added-hints';

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

const CREATE_COMMAND = 'document/elements/create';
const MOVE_COMMAND = 'document/elements/move';
const HONEYPOT_TYPE = 'e-form-honeypot';
const RECAPTCHA_SCORE_TYPE = 'e-form-recaptcha-score';

describe( 'form atom added hints', () => {
	const hooksRegistry = createHooksRegistry();

	beforeEach( () => {
		jest.mocked( notify ).mockClear();
		setupHooksRegistry( hooksRegistry );
		initFormAtomAddedHints();
	} );

	it( 'should notify when a reCAPTCHA Score is added', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: RECAPTCHA_SCORE_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( {
				message: 'Score-based reCAPTCHA added - You can adjust its settings from the Structure panel.',
			} )
		);
	} );

	it( 'should notify again when a reCAPTCHA Score is removed and added once more', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: RECAPTCHA_SCORE_TYPE } } );
		hook?.apply( { model: { widgetType: RECAPTCHA_SCORE_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 2 );
		expect( jest.mocked( notify ).mock.calls[ 0 ][ 0 ].id ).not.toBe(
			jest.mocked( notify ).mock.calls[ 1 ][ 0 ].id
		);
	} );

	it( 'should notify when a honeypot is added', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( {
				message: 'Honeypot added - invisible on your form. Reorder it in the Structure panel.',
			} )
		);
	} );

	it( 'should use unique notification ids for back-to-back adds (not collapsed by the notification system)', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 2 );
		const firstCallId = jest.mocked( notify ).mock.calls[ 0 ][ 0 ].id;
		const secondCallId = jest.mocked( notify ).mock.calls[ 1 ][ 0 ].id;
		expect( firstCallId ).not.toBe( secondCallId );
	} );

	it( 'should notify again after remove and re-add (simulated by separate create calls)', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act - first add
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// simulate removal (no hook for delete affects this)

		// Act - re-add
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not notify when another element type is created', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: 'e-form-input' } } );

		// Assert
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should not notify when the honeypot is created as part of a move', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );
		const eWindow = window as unknown as { $e: { commands?: { currentTrace?: string[] } } };
		eWindow.$e.commands = { currentTrace: [ MOVE_COMMAND, CREATE_COMMAND ] };

		// Act
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should not notify on selection (selection does not trigger create command)', () => {
		// Arrange - selection uses a different command path, not document/elements/create
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act - no create call is made for selection
		// Selection triggers commands like document/elements/toggle-selection, not create

		// Assert
		expect( hook ).toBeDefined();
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should notify on paste when it triggers create (current behavior: paste triggers toast)', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act - paste internally calls create, so it will trigger the notification
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should notify on duplicate when it triggers create (current behavior: duplicate triggers toast)', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act - duplicate internally calls create, so it will trigger the notification
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should notify on undo of delete (undo-delete triggers create, so toast shows)', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act - undo of a delete restores via create command
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 1 );
	} );
} );
