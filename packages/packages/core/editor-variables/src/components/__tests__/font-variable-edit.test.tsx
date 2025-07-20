import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../../prop-types/font-variable-prop-type';
import { FontVariableEdit } from '../font-variable-edit';

const propType = createMockPropType( { kind: 'object' } );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	deleteVariable: jest.fn(),
} ) );

jest.mock( '../../hooks/use-permissions', () => {
	return {
		usePermissions: () => {
			return {
				canAdd: jest.fn().mockReturnValue( true ),
				canDelete: jest.fn().mockReturnValue( true ),
				canEdit: jest.fn().mockReturnValue( true ),
				canRestore: jest.fn().mockReturnValue( true ),
				canManageSettings: jest.fn().mockReturnValue( true ),
			};
		},
	};
} );

describe( 'FontVariableEdit', () => {
	const mockVariable = {
		key: 'e-gv-789',
		label: 'Main: Roboto',
		value: 'Roboto',
		type: fontVariablePropTypeUtil.key,
	};

	beforeEach( () => {
		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );
		( usePropVariablesModule.deleteVariable as jest.Mock ).mockResolvedValue( mockVariable.key );
	} );

	it( 'should delete a font variable after confirmation', async () => {
		// Arrange.
		const setValue = jest.fn();
		const onDeleted = jest.fn();

		const props = {
			setValue,
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-123',
			},
			bind: 'font-family',
			propType,
		};

		// Act.
		renderControl(
			<FontVariableEdit editId="test-variable-id" onClose={ jest.fn() } onSubmit={ onDeleted } />,
			props
		);

		const deleteButton = screen.getByRole( 'button', { name: /delete/i } );
		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this variable?' } ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		// Assert.
		expect( usePropVariablesModule.deleteVariable ).toHaveBeenCalledWith( 'test-variable-id' );
		await waitFor( () => {
			expect( onDeleted ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it( 'should trigger notifyBoundPropChange when deleting assigned variable', async () => {
		// Act.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-1122',
			},
			bind: 'font-family',
			propType,
		};

		renderControl( <FontVariableEdit editId="e-gv-1122" onClose={ jest.fn() } />, props );

		const deleteButton = screen.getByRole( 'button', { name: /delete/i } );
		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this variable?' } ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		await waitFor( () => {
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-1122',
			} );
		} );
	} );
} );
