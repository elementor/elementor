import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { ColorVariableControl } from '../color-variable-control';

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	useFilteredVariables: jest.fn(),
} ) );

const propType = createMockPropType( { kind: 'object' } );

describe( 'ColorVariableControl', () => {
	const originalGetBoundingClientRect = globalThis.Element.prototype.getBoundingClientRect;

	const mockVariable = {
		key: 'e-gv-123',
		label: 'primary-background-color',
		value: '#911f1f',
	};

	const mockVariables = {
		list: [
			mockVariable,
			{
				key: 'e-gv-456',
				label: 'secondary-color',
				value: '#00ff00',
			},
		],
		hasMatches: true,
		isSourceNotEmpty: true,
	};

	beforeEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue( { height: 1000, width: 1000 } );

		jest.clearAllMocks();

		// Setup default mock implementations
		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );
		( usePropVariablesModule.useFilteredVariables as jest.Mock ).mockReturnValue( mockVariables );
	} );

	afterEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
	} );

	it( 'should render with the assigned variable', () => {
		// Arrange
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

		// Act
		renderControl( <ColorVariableControl />, props );

		// Assert
		expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-123' );
		expect( screen.getByText( 'primary-background-color' ) ).toBeInTheDocument();
	} );

	it.skip( 'should unlink the color variable make style to remain', () => {
		// Arrange
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

		// Act
		renderControl( <ColorVariableControl />, props );

		const variableButton = screen.getByRole( 'button' );
		fireEvent.click( variableButton );

		const unlinkButton = screen.getByLabelText( 'Unlink' );
		fireEvent.click( unlinkButton );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'color',
			value: '#911f1f',
		} );

		expect( screen.getByText( '#911f1f' ) ).toBeInTheDocument();
	} );

	it( 'should unlink the color variable make style to remain', () => {
		// Arrange
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

		// Act
		renderControl( <ColorVariableControl />, props );

		const variableButton = screen.getByRole( 'button' );
		fireEvent.click( variableButton );

		const unlinkButton = screen.getByLabelText( 'Unlink' );
		fireEvent.click( unlinkButton );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'color',
			value: '#911f1f',
		} );
	} );

	it( 'should render with a deleted variable', () => {
		// Arrange
		const setValue = jest.fn();
		const deletedVariable = {
			...mockVariable,
			deleted: true,
		};

		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( deletedVariable );

		const props = {
			setValue,
			value: {
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-123',
			},
			bind: 'color',
			propType,
		};

		// Act
		renderControl( <ColorVariableControl />, props );

		// Assert
		expect( screen.getByText( 'primary-background-color' ) ).toBeInTheDocument();
		expect( screen.getByText( '(deleted)' ) ).toBeInTheDocument();
	} );

	it( 'should render with a missing variable', () => {
		// Arrange
		const props = {
			setValue: jest.fn(),
			value: {
				$$type: colorVariablePropTypeUtil.key,
				value: 'e-gv-missing',
			},
			bind: 'color',
			propType,
		};

		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( null );

		// Act
		renderControl( <ColorVariableControl />, props );

		// Assert
		expect( screen.getByText( 'Missing variable' ) ).toBeInTheDocument();
	} );
} );
