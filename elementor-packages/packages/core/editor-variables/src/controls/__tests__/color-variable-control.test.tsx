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
		label: 'Primary Background Color',
		value: '#911f1f',
	};

	const mockVariables = {
		list: [
			mockVariable,
			{
				key: 'e-gv-456',
				label: 'Secondary',
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

	it( 'should render with the selected variable', () => {
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
		expect( screen.getByText( 'Primary Background Color' ) ).toBeInTheDocument();
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

		expect( screen.getByText( '#911f1f' ) ).toBeInTheDocument();
	} );
} );
