import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { ColorVariableRestore } from '../color-variable-restore';

const propType = createMockPropType( { kind: 'object' } );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	restoreVariable: jest.fn(),
} ) );

describe( 'ColorVariableRestore', () => {
	const mockVariable = {
		key: 'e-gv-4test',
		label: 'bg-color',
		value: '#911f1f',
		type: colorVariablePropTypeUtil.key,
	};

	beforeEach( () => {
		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );
		( usePropVariablesModule.restoreVariable as jest.Mock ).mockResolvedValue( null );
	} );

	// TODO: Pay attention to this test. There is a potential to be flaky.
	it( '~ should show field-level error when server returns duplicated_label error', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: {
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-4test',
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

		( usePropVariablesModule.restoreVariable as jest.Mock ).mockRejectedValue( apiErrorResponse );

		// Act.
		renderControl(
			<ColorVariableRestore variableId="e-gv-4test" onClose={ jest.fn() } />,
			props
		);

		// Change the label to enable the save button
		const labelField = screen.getByRole( 'textbox', { name: /name/i } );
		fireEvent.change( labelField, { target: { value: 'new-label' } } );

		await waitFor( () => {
			expect( labelField ).toHaveValue( 'new-label' );
		} );

		// Verify save button is enabled initially
		const saveButton = screen.getByRole( 'button', { name: /restore/i } );
		expect( saveButton ).toBeEnabled();

		// Trigger the API call by clicking save
		fireEvent.click( saveButton );

		// Verify that the error response is handled correctly:
		// 1. Error message is displayed
		await waitFor( () => {
			expect(
				screen.getByText( 'This variable name already exists. Please choose a unique name.' )
			).toBeInTheDocument();
		} );

		// 2. Input field has error highlight
		expect( labelField ).toHaveAttribute( 'aria-invalid', 'true' );

		// 3. Save button is disabled due to error
		expect( saveButton ).toBeDisabled();
	} );

} );
