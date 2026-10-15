import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { notify } from '@elementor/editor-notifications';

import { initHoneypotHint } from '../honeypot-hint';

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

const CREATE_COMMAND = 'document/elements/create';
const MOVE_COMMAND = 'document/elements/move';
const HONEYPOT_TYPE = 'e-form-honeypot';

describe( 'honeypot hint', () => {
	const hooksRegistry = createHooksRegistry();

	beforeEach( () => {
		jest.mocked( notify ).mockClear();
		setupHooksRegistry( hooksRegistry );
		initHoneypotHint();
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

	it( 'should notify again with a new id after remove and re-add', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );
		hook?.apply( { model: { widgetType: HONEYPOT_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 2 );
		expect( jest.mocked( notify ).mock.calls[ 0 ][ 0 ].id ).not.toBe(
			jest.mocked( notify ).mock.calls[ 1 ][ 0 ].id
		);
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
} );
