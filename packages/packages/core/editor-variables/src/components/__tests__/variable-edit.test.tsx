import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { colorPropTypeUtil, PropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { VariableEdit } from '../variable-edit';
import { fontVariablePropTypeUtil } from "../../prop-types/font-variable-prop-type";

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
			<VariableEdit
				propTypeKey={ colorVariablePropTypeUtil.key }
				editId="test-variable-id"
				onClose={ jest.fn() }
				onSubmit={ onDeleted }
			/>,
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
			<VariableEdit editId="e-gv-75930" onClose={ jest.fn() } propTypeKey={ colorVariablePropTypeUtil.key } />,
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
} );
