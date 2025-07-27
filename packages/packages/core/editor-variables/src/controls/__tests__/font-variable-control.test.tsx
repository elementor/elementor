import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../../prop-types/font-variable-prop-type';
import { FontVariableControl } from '../font-variable-control';

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	useFilteredVariables: jest.fn(),
} ) );

const propType = createMockPropType( { kind: 'object' } );

describe( 'FontVariableControl', () => {
	const originalGetBoundingClientRect = globalThis.Element.prototype.getBoundingClientRect;

	const mockVariable = {
		key: 'e-gv-789',
		label: 'main-roboto',
		value: 'Roboto',
		type: fontVariablePropTypeUtil.key,
	};

	const mockVariables = {
		list: [
			mockVariable,
			{
				key: 'e-gv-112',
				label: 'secondary-monospace',
				value: 'Monospace',
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
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-789',
			},
			bind: 'font-family',
			propType,
		};

		// Act
		renderControl( <FontVariableControl />, props );

		// Assert
		expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-789' );
		expect( screen.getByText( 'main-roboto' ) ).toBeInTheDocument();
	} );

	it.skip( 'should unlink the font variable make style to remain', () => {
		// Arrange
		const setValue = jest.fn();
		const props = {
			setValue,
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-789',
			},
			bind: 'font-family',
			propType,
		};

		// Act
		renderControl( <FontVariableControl />, props );

		const variableButton = screen.getByRole( 'button' );
		fireEvent.click( variableButton );

		const unlinkButton = screen.getByLabelText( 'Unlink' );
		fireEvent.click( unlinkButton );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Roboto',
		} );

		expect( screen.getByText( 'Roboto' ) ).toBeInTheDocument();
	} );

	it( 'should unlink the font variable make style to remain', () => {
		// Arrange
		const setValue = jest.fn();
		const props = {
			setValue,
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-789',
			},
			bind: 'font-family',
			propType,
		};

		// Act
		renderControl( <FontVariableControl />, props );

		const variableButton = screen.getByRole( 'button' );
		fireEvent.click( variableButton );

		const unlinkButton = screen.getByLabelText( 'Unlink' );
		fireEvent.click( unlinkButton );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Roboto',
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
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-123',
			},
			bind: 'font-family',
			propType,
		};

		// Act
		renderControl( <FontVariableControl />, props );

		// Assert
		expect( screen.getByText( 'main-roboto' ) ).toBeInTheDocument();
		expect( screen.getByText( '(deleted)' ) ).toBeInTheDocument();
	} );

	it( 'should render with a missing variable', () => {
		// Arrange
		const props = {
			setValue: jest.fn(),
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-missing',
			},
			bind: 'font-family',
			propType,
		};

		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( null );

		// Act
		renderControl( <FontVariableControl />, props );

		// Assert
		expect( screen.getByText( 'Missing variable' ) ).toBeInTheDocument();
	} );
} );
