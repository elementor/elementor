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
		expect( screen.getByText( 'primary-background-color (deleted)' ) ).toBeInTheDocument();
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
		expect( screen.getByText( 'primary-background-color (changed)' ) ).toBeInTheDocument();
	} );

	describe( 'responsive placeholder inheritance', () => {
		it( 'should inherit placeholder from desktop value when switching to tablet', () => {
			// Arrange
			const setValue = jest.fn();

			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );

			// Desktop value
			const desktopProps = {
				setValue,
				value: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-123',
				},
				bind: 'color',
				propType,
			};

			// Tablet placeholder from desktop value
			const tabletProps = {
				setValue,
				value: null, // No value set on tablet
				bind: 'color',
				propType,
				placeholder: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-123', // Inherited from desktop
				},
			};

			// Act - First render desktop control
			const { rerender } = renderControl( <VariableControl />, desktopProps );

			// Assert - Desktop has the variable
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-123' );
			expect( screen.getByText( 'primary-background-color' ) ).toBeInTheDocument();

			// Act - Switch to tablet (simulate breakpoint change with placeholder)
			rerender( <VariableControl />, tabletProps );

			// Assert - Tablet should show the inherited variable via placeholder
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-123' );
			expect( screen.getByText( 'primary-background-color' ) ).toBeInTheDocument();
		} );

		it( 'should inherit placeholder from tablet value when switching to mobile', () => {
			// Arrange
			const setValue = jest.fn();

			// Tablet value (different from desktop)
			const tabletVariable = {
				key: 'e-gv-456',
				label: 'secondary-color',
				value: '#00ff00',
			};

			// Clear previous mocks and set up new ones
			jest.clearAllMocks();
			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( tabletVariable );

			const tabletProps = {
				setValue,
				value: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-456',
				},
				bind: 'color',
				propType,
			};

			// Mobile placeholder from tablet value
			const mobileProps = {
				setValue,
				value: null, // No value set on mobile
				bind: 'color',
				propType,
				placeholder: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-456', // Inherited from tablet
				},
			};

			// Act - First render tablet control
			const { rerender } = renderControl( <VariableControl />, tabletProps );

			// Assert - Tablet has the secondary variable
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-456' );
			expect( screen.getByText( 'secondary-color' ) ).toBeInTheDocument();

			// Act - Switch to mobile (simulate breakpoint change with placeholder)
			rerender( <VariableControl />, mobileProps );

			// Assert - Mobile should show the inherited variable via placeholder
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-456' );
			expect( screen.getByText( 'secondary-color' ) ).toBeInTheDocument();
		} );

		it( 'should prioritize value over placeholder when both are provided', () => {
			// Arrange
			const setValue = jest.fn();

			const mobileVariable = {
				key: 'e-gv-789',
				label: 'mobile-specific-color',
				value: '#ff0000',
			};

			// Clear previous mocks and set up new ones
			jest.clearAllMocks();
			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mobileVariable );

			const props = {
				setValue,
				value: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-789', // Mobile has its own value
				},
				bind: 'color',
				propType,
				placeholder: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-123', // Inherited from desktop
				},
			};

			// Act
			renderControl( <VariableControl />, props );

			// Assert - Should use the actual value, not the placeholder
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-789' );
			expect( screen.getByText( 'mobile-specific-color' ) ).toBeInTheDocument();
		} );

		it( 'should handle missing variable in placeholder inheritance', () => {
			// Arrange
			const setValue = jest.fn();

			// Clear previous mocks and set up new ones
			jest.clearAllMocks();
			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( null );

			const props = {
				setValue,
				value: null,
				bind: 'color',
				propType,
				placeholder: {
					$$type: colorVariablePropTypeUtil.key,
					value: 'e-gv-missing', // Variable that doesn't exist
				},
			};

			// Act
			renderControl( <VariableControl />, props );

			// Assert - Should show missing variable UI
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'e-gv-missing' );
			expect( screen.getByText( 'Missing variable' ) ).toBeInTheDocument();
		} );
	} );
} );
