import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { colorPropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { VariableTypeProvider } from '../../context/variable-type-context';
import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { type ValueFieldProps } from '../../variables-registry/create-variable-type-registry';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { VariableRestore } from '../variable-restore';

const propType = createMockPropType( { kind: 'object' } );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	restoreVariable: jest.fn(),
} ) );

jest.mock( '../../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
} ) );

const mockGetVariableType = jest.mocked( getVariableType );

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

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: jest.fn(),
			variableType: 'color',
			propTypeUtil: colorVariablePropTypeUtil,
			fallbackPropTypeUtil: colorPropTypeUtil,
		} );

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
			<VariableTypeProvider propTypeKey={ colorVariablePropTypeUtil.key }>
				<VariableRestore variableId="e-gv-4test" onClose={ jest.fn() } />
			</VariableTypeProvider>,
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

	it( 'should not pass type when type has not changed', async () => {
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

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: jest.fn(),
			variableType: 'color',
			propTypeUtil: colorVariablePropTypeUtil,
			fallbackPropTypeUtil: colorPropTypeUtil,
		} );

		( usePropVariablesModule.restoreVariable as jest.Mock ).mockResolvedValue( null );

		// Act.
		renderControl(
			<VariableTypeProvider propTypeKey={ colorVariablePropTypeUtil.key }>
				<VariableRestore variableId="e-gv-4test" onClose={ jest.fn() } />
			</VariableTypeProvider>,
			props
		);

		const labelField = screen.getByRole( 'textbox', { name: /name/i } );
		fireEvent.change( labelField, { target: { value: 'new-label' } } );

		await waitFor( () => {
			expect( labelField ).toHaveValue( 'new-label' );
		} );

		const restoreButton = screen.getByRole( 'button', { name: /restore/i } );
		fireEvent.click( restoreButton );

		// Assert.
		await waitFor( () => {
			expect( usePropVariablesModule.restoreVariable ).toHaveBeenCalledWith(
				'e-gv-4test',
				'new-label',
				'#911f1f'
			);
		} );
	} );

	it( 'should pass type in payload when type is changed', async () => {
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

		const MockValueField = ( { onPropTypeKeyChange }: ValueFieldProps ) => {
			return (
				<button
					data-testid="change-type-button"
					onClick={ () => onPropTypeKeyChange?.( 'global-font-variable' ) }
				>
					Change Type
				</button>
			);
		};

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: MockValueField,
			variableType: 'color',
			propTypeUtil: colorVariablePropTypeUtil,
			fallbackPropTypeUtil: colorPropTypeUtil,
		} );

		( usePropVariablesModule.restoreVariable as jest.Mock ).mockResolvedValue( null );

		// Act.
		renderControl(
			<VariableTypeProvider propTypeKey={ colorVariablePropTypeUtil.key }>
				<VariableRestore variableId="e-gv-4test" onClose={ jest.fn() } />
			</VariableTypeProvider>,
			props
		);

		// eslint-disable-next-line testing-library/no-test-id-queries
		const changeTypeButton = screen.getByTestId( 'change-type-button' );
		fireEvent.click( changeTypeButton );

		// Change the label to enable the restore button
		const labelField = screen.getByRole( 'textbox', { name: /name/i } );
		fireEvent.change( labelField, { target: { value: 'new-label' } } );

		await waitFor( () => {
			expect( labelField ).toHaveValue( 'new-label' );
		} );

		// Click restore button
		const restoreButton = screen.getByRole( 'button', { name: /restore/i } );
		fireEvent.click( restoreButton );

		// Assert - type should be the new type because it has changed
		await waitFor( () => {
			expect( usePropVariablesModule.restoreVariable ).toHaveBeenCalledWith(
				'e-gv-4test',
				'new-label',
				'#911f1f',
				'global-font-variable'
			);
		} );
	} );
} );
