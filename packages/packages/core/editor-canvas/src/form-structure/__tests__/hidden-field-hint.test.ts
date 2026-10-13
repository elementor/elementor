import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { notify } from '@elementor/editor-notifications';

import { initHiddenFieldHint } from '../hidden-field-hint';

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

const CREATE_COMMAND = 'document/elements/create';
const MOVE_COMMAND = 'document/elements/move';
const HIDDEN_FIELD_TYPE = 'e-form-hidden';

describe( 'hidden field hint', () => {
	const hooksRegistry = createHooksRegistry();

	beforeEach( () => {
		jest.mocked( notify ).mockClear();
		setupHooksRegistry( hooksRegistry );
		initHiddenFieldHint();
	} );

	it( 'should notify when a hidden field is created', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: HIDDEN_FIELD_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( {
				message: 'Hidden field added - invisible on your form. Manage it in the Structure panel.',
			} )
		);
	} );

	it( 'should notify again when the hidden field is created again', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: HIDDEN_FIELD_TYPE } } );
		hook?.apply( { model: { widgetType: HIDDEN_FIELD_TYPE } } );

		// Assert
		expect( notify ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not notify when another element is created', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );

		// Act
		hook?.apply( { model: { widgetType: 'e-form-input' } } );

		// Assert
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should not notify when the hidden field is created as part of a move', () => {
		// Arrange
		const hook = hooksRegistry.getByCommand( CREATE_COMMAND );
		const eWindow = window as unknown as { $e: { commands?: { currentTrace?: string[] } } };
		eWindow.$e.commands = { currentTrace: [ MOVE_COMMAND, CREATE_COMMAND ] };

		// Act
		hook?.apply( { model: { widgetType: HIDDEN_FIELD_TYPE } } );

		// Assert
		expect( notify ).not.toHaveBeenCalled();
	} );
} );
