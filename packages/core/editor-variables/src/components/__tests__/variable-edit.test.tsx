import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { colorPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { VariableTypeProvider } from '../../context/variable-type-context';
import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../../prop-types/font-variable-prop-type';
import { type ValueFieldProps } from '../../variables-registry/create-variable-type-registry';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { VariableEdit } from '../variable-edit';

const propType = createMockPropType( { kind: 'object' } );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	deleteVariable: jest.fn(),
	updateVariable: jest.fn(),
} ) );

jest.mock( '../../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
} ) );

const mockGetVariableType = jest.mocked( getVariableType );

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

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: jest.fn(),
			variableType: 'color',
			propTypeUtil: colorVariablePropTypeUtil,
			fallbackPropTypeUtil: colorPropTypeUtil,
		} );

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
			<VariableTypeProvider propTypeKey={ colorVariablePropTypeUtil.key }>
				<VariableEdit editId="test-variable-id" onClose={ jest.fn() } onSubmit={ onDeleted } />
			</VariableTypeProvider>,
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
				value: 'e-gv-75930',
			},
			bind: 'font',
			propType,
		};

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: jest.fn(),
			variableType: 'font',
			propTypeUtil: fontVariablePropTypeUtil,
			fallbackPropTypeUtil: stringPropTypeUtil,
		} );

		renderControl(
			<VariableTypeProvider propTypeKey={ fontVariablePropTypeUtil.key }>
				<VariableEdit editId="e-gv-75930" onClose={ jest.fn() } />
			</VariableTypeProvider>,
			props
		);

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
				value: 'e-gv-75930',
			} );
		} );
	} );

	it( 'should pass type in payload when type is changed', async () => {
		// Arrange.
		const setValue = jest.fn();
		const mockVariableWithType = {
			key: 'e-gv-123',
			label: 'Primary Font',
			value: 'Arial',
			type: fontVariablePropTypeUtil.key,
		};

		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariableWithType );
		( usePropVariablesModule.updateVariable as jest.Mock ).mockResolvedValue( mockVariableWithType.key );

		// Create a mock ValueField that allows changing the prop type
		const MockValueField = ( { onPropTypeKeyChange }: ValueFieldProps ) => {
			return (
				<button
					data-testid="change-type-button"
					onClick={ () => onPropTypeKeyChange?.( colorVariablePropTypeUtil.key ) }
				>
					Change Type
				</button>
			);
		};

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: MockValueField,
			variableType: 'font',
			propTypeUtil: fontVariablePropTypeUtil,
			fallbackPropTypeUtil: stringPropTypeUtil,
		} );

		const props = {
			setValue,
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-123',
			},
			bind: 'font',
			propType,
		};

		// Act.
		renderControl(
			<VariableTypeProvider propTypeKey={ fontVariablePropTypeUtil.key }>
				<VariableEdit editId="e-gv-123" onClose={ jest.fn() } onSubmit={ jest.fn() } />
			</VariableTypeProvider>,
			props
		);

		// eslint-disable-next-line testing-library/no-test-id-queries
		const changeTypeButton = screen.getByTestId( 'change-type-button' );
		fireEvent.click( changeTypeButton );

		// Change the label to enable the save button
		const labelField = screen.getByRole( 'textbox', { name: /name/i } );
		fireEvent.change( labelField, { target: { value: 'new-label' } } );

		await waitFor( () => {
			expect( labelField ).toHaveValue( 'new-label' );
		} );

		// Click save button
		const saveButton = screen.getByRole( 'button', { name: /save/i } );
		fireEvent.click( saveButton );

		// Handle the confirmation dialog if it appears
		const confirmButton = await screen.findByRole( 'button', { name: /confirm|save/i } );
		if ( confirmButton ) {
			fireEvent.click( confirmButton );
		}

		// Assert - type should be the new type because it has changed
		await waitFor( () => {
			expect( usePropVariablesModule.updateVariable ).toHaveBeenCalledWith( 'e-gv-123', {
				value: 'Arial',
				label: 'new-label',
				type: colorVariablePropTypeUtil.key,
			} );
		} );
	} );
} );
