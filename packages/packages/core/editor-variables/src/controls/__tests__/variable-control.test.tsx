import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { colorPropTypeUtil, type PropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';
import { fireEvent, screen } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../../prop-types/font-variable-prop-type';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { VariableControl } from '../variable-control';

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
	useFilteredVariables: jest.fn(),
} ) );

jest.mock( '../../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
} ) );

const propType = createMockPropType( { kind: 'object' } );
const mockGetVariableType = jest.mocked( getVariableType );

const createMockPropTypeUtil = ( key: string ): PropTypeUtil< string, string > =>
	( {
		key,
		create: jest.fn( ( value: string ) => ( {
			$$type: key,
			value,
		} ) ),
	} ) as unknown as PropTypeUtil< string, string >;

describe( 'VariableControl', () => {
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

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: jest.fn(),
			variableType: 'type-1',
			propTypeUtil: createMockPropTypeUtil( 'color-variable' ),
			fallbackPropTypeUtil: createMockPropTypeUtil( 'fallback-prop-type' ),
		} );
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
		renderControl( <VariableControl />, props );

		// Assert
		expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-123' );
		expect( screen.getByText( 'primary-background-color' ) ).toBeInTheDocument();
	} );

	it( 'should unlink the variable and make style to remain', () => {
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
		renderControl( <VariableControl />, props );

		const unlinkButton = screen.getByLabelText( 'Unlink' );
		fireEvent.click( unlinkButton );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'fallback-prop-type',
			value: '#911f1f',
		} );
	} );

	it( 'should handle undefined value gracefully', () => {
		// Arrange
		const setValue = jest.fn();
		const props = {
			setValue,
			value: undefined,
			bind: 'color',
			propType,
		};

		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( undefined );

		// Act
		renderControl( <VariableControl />, props );

		// Assert - Should show missing variable UI when value is undefined
		expect( screen.getByText( 'Missing variable' ) ).toBeInTheDocument();
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
		renderControl( <VariableControl />, props );

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
		renderControl( <VariableControl />, props );

		// Assert
		expect( screen.getByText( 'Missing variable' ) ).toBeInTheDocument();
	} );

	it( 'should render a variable mismatch, when detected', () => {
		// Arrange
		const props = {
			setValue: jest.fn(),
			value: {
				$$type: fontVariablePropTypeUtil.key,
				value: 'e-gv-font-variable',
			},
			bind: 'color',
			propType: createMockPropType( {
				kind: 'union',
				prop_types: {
					[ colorPropTypeUtil.key ]: createMockPropType( {
						kind: 'plain',
						key: 'color',
					} ),
					[ colorVariablePropTypeUtil.key ]: createMockPropType( {
						kind: 'plain',
						key: 'global-color-variable',
					} ),
				},
			} ),
		};

		mockGetVariableType.mockReturnValue( {
			icon: TextIcon,
			valueField: jest.fn(),
			variableType: 'type-1',
			propTypeUtil: createMockPropTypeUtil( 'global-color-variable' ),
			fallbackPropTypeUtil: createMockPropTypeUtil( 'color' ),
			isCompatible: () => false,
		} );

		// Act
		renderControl( <VariableControl />, props );

		// Assert
		expect( screen.getByText( '(changed)' ) ).toBeInTheDocument();
	} );
} );
