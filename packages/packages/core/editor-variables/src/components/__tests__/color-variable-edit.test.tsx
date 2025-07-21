import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { ColorVariableEdit } from '../color-variable-edit';

const propType = createMockPropType( { kind: 'object' } );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	deleteVariable: jest.fn(),
	updateVariable: jest.fn(),
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

describe( 'ColorVariableEdit', () => {
	const mockVariable = {
		key: 'e-gv-123',
		label: 'Primary Background Color',
		value: '#911f1f',
	};

	beforeEach( () => {
		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );
		( usePropVariablesModule.deleteVariable as jest.Mock ).mockResolvedValue( mockVariable.key );
		( usePropVariablesModule.updateVariable as jest.Mock ).mockResolvedValue( mockVariable.key );
	} );

	it( 'should delete a variable after confirmation', async () => {
		// Arrange.
		const setValue = jest.fn();
		const onDeleted = jest.fn();

		const props = {
			setValue,
			value: {
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-123',
			},
			bind: 'color',
			propType,
		};

		// Act.
		renderControl(
			<ColorVariableEdit editId="test-variable-id" onClose={ jest.fn() } onSubmit={ onDeleted } />,
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
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-75930',
			},
			bind: 'color',
			propType,
		};

		renderControl( <ColorVariableEdit editId="e-gv-75930" onClose={ jest.fn() } />, props );

		const deleteButton = screen.getByRole( 'button', { name: /delete/i } );
		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this variable?' } ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		await waitFor( () => {
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-75930',
			} );
		} );
	} );

	it( 'should show field-level error when server returns duplicated_label error', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: {
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-123',
			},
			bind: 'color',
			propType,
		};

		// Mock API response with duplicated label error
		const apiErrorResponse = {
			response: {
				data: {
					code: 'duplicated_label',
				},
			},
		};

		( usePropVariablesModule.updateVariable as jest.Mock ).mockRejectedValue( apiErrorResponse );

		// Act.
		renderControl(
			<ColorVariableEdit editId="test-variable-id" onClose={ jest.fn() } onSubmit={ jest.fn() } />,
			props
		);

		// Change the label to enable the save button
		const labelField = screen.getByRole( 'textbox', { name: /name/i } );
		fireEvent.change( labelField, { target: { value: 'new-label' } } );

		// Wait for the state to update
		await waitFor( () => {
			expect( labelField ).toHaveValue( 'new-label' );
		} );

		// Verify save button is enabled initially
		const saveButton = screen.getByRole( 'button', { name: /save/i } );
		expect( saveButton ).not.toBeDisabled();

		// Trigger the API call by clicking save
		fireEvent.click( saveButton );

		// Assert that the API was called with correct parameters
		await waitFor( () => {
			expect( usePropVariablesModule.updateVariable ).toHaveBeenCalledWith( 'test-variable-id', {
				value: '#911f1f',
				label: 'new-label',
			} );
		} );

		// Verify that the error response is handled correctly:
		// 1. Error message is displayed
		await waitFor( () => {
			expect( screen.getByText( 'This variable name already exists. Please choose a unique name.' ) ).toBeInTheDocument();
		} );

		// 2. Input field has error highlight
		expect( labelField ).toHaveAttribute( 'aria-invalid', 'true' );

		// 3. Save button is disabled due to error
		expect( saveButton ).toBeDisabled();
	} );
} );
