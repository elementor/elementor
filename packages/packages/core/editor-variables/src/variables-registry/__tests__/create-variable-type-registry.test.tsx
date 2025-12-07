import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { colorPropTypeUtil, type PropTypeUtil } from '@elementor/editor-props';
import { BrushIcon, TextIcon } from '@elementor/icons';

import { ColorField } from '../../components/fields/color-field';
import { FontField } from '../../components/fields/font-field';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { createVariableTypeRegistry } from '../create-variable-type-registry';

const MockStartIcon = () => ( { type: 'div' } ) as JSX.Element;

const createMockPropTypeUtil = ( key: string ): PropTypeUtil< string, string > =>
	( { key } ) as PropTypeUtil< string, string >;

describe( 'createVariableTypeRegistry', () => {
	let registry: ReturnType< typeof createVariableTypeRegistry >;

	beforeEach( () => {
		registry = createVariableTypeRegistry();
	} );

	describe( 'registerVariableType', () => {
		it( 'should register a variable type successfully', () => {
			// Arrange.
			const propTypeUtil = createMockPropTypeUtil( 'test-key' );
			const fallbackPropTypeUtil = createMockPropTypeUtil( 'test-fallback-key' );

			// Act.
			registry.registerVariableType( {
				icon: BrushIcon,
				valueField: ColorField,
				variableType: 'test-type',
				propTypeUtil,
				fallbackPropTypeUtil,
			} );

			// Assert.
			const registeredType = registry.getVariableType( 'test-key' );

			expect( registeredType ).toBeDefined();
			expect( registeredType?.variableType ).toBe( 'test-type' );
			expect( registeredType?.icon ).toBe( BrushIcon );
			expect( registeredType?.valueField ).toBe( ColorField );
			expect( registeredType?.propTypeUtil ).toBe( propTypeUtil );
			expect( registeredType?.fallbackPropTypeUtil ).toBe( fallbackPropTypeUtil );
		} );

		it( 'should throw an error when trying to register a variable type with duplicate key', () => {
			// Arrange.
			const propTypeUtil1 = createMockPropTypeUtil( 'duplicate-key' );
			const propTypeUtil2 = createMockPropTypeUtil( 'duplicate-key' );
			const fallbackPropTypeUtil = createMockPropTypeUtil( 'fallback-key' );

			// Act .
			registry.registerVariableType( {
				icon: TextIcon,
				valueField: FontField,
				variableType: 'test-type-1',
				propTypeUtil: propTypeUtil1,
				fallbackPropTypeUtil,
			} );

			// Assert.
			expect( () => {
				registry.registerVariableType( {
					icon: BrushIcon,
					valueField: ColorField,
					variableType: 'test-type-2',
					propTypeUtil: propTypeUtil2,
					fallbackPropTypeUtil,
				} );
			} ).toThrow( 'Variable with key "duplicate-key" is already registered.' );
		} );

		it( 'should register multiple variable types with different keys', () => {
			// Arrange.
			const StartIcon = () => <MockStartIcon />;

			// Act.
			registry.registerVariableType( {
				icon: TextIcon,
				valueField: FontField,
				variableType: 'type-1',
				propTypeUtil: createMockPropTypeUtil( 'key-1' ),
				fallbackPropTypeUtil: createMockPropTypeUtil( 'fallback-2' ),
			} );

			registry.registerVariableType( {
				icon: BrushIcon,
				startIcon: StartIcon,
				valueField: ColorField,
				variableType: 'type-3',
				propTypeUtil: createMockPropTypeUtil( 'key-3' ),
				fallbackPropTypeUtil: createMockPropTypeUtil( 'fallback-1' ),
			} );

			// Assert.
			const registeredType1 = registry.getVariableType( 'key-1' );
			const registeredType2 = registry.getVariableType( 'key-3' );

			expect( registeredType1 ).toBeDefined();
			expect( registeredType1?.variableType ).toBe( 'type-1' );
			expect( registeredType1?.startIcon ).toBeUndefined();

			expect( registeredType2 ).toBeDefined();
			expect( registeredType2?.variableType ).toBe( 'type-3' );
			expect( registeredType2?.startIcon ).toBe( StartIcon );
		} );

		it( 'should return undefined for non-existent variable type', () => {
			// Act.
			const result = registry.getVariableType( 'non-existent-key' );

			// Assert.
			expect( result ).toBeUndefined();
		} );

		it( 'should return true if a variable type exists and false otherwise', () => {
			// Arrange.
			registry.registerVariableType( {
				icon: BrushIcon,
				valueField: ColorField,
				variableType: 'color',
				propTypeUtil: createMockPropTypeUtil( 'existing-key' ),
				fallbackPropTypeUtil: createMockPropTypeUtil( 'fallback-key' ),
			} );

			// Assert.
			expect( registry.hasVariableType( 'existing-key' ) ).toBe( true );
			expect( registry.hasVariableType( 'non-existent-key' ) ).toBe( false );
		} );
	} );

	describe( 'isCompatible by default', () => {
		it( 'should return "true" if the variable type is supported by the prop type', () => {
			// Arrange.
			const propType = createMockPropType( {
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
			} );

			registry.registerVariableType( {
				icon: BrushIcon,
				valueField: ColorField,
				variableType: 'color',
				propTypeUtil: createMockPropTypeUtil( 'global-color-variable' ),
				fallbackPropTypeUtil: createMockPropTypeUtil( 'color' ),
			} );

			const variable = {
				type: 'global-color-variable',
				label: 'page-body-color',
				value: 'white',
			};

			// Act.

			const { isCompatible } = registry.getVariableType( 'global-color-variable' );

			expect( isCompatible?.( propType, variable ) ).toBe( true );
		} );

		it( 'should return "false" if the variable type is not supported by the prop type', () => {
			// Arrange.
			const propType = createMockPropType( {
				kind: 'union',
				prop_types: {
					[ colorPropTypeUtil.key ]: createMockPropType( {
						kind: 'plain',
						key: 'color',
					} ),
				},
			} );

			registry.registerVariableType( {
				icon: BrushIcon,
				valueField: ColorField,
				variableType: 'color',
				propTypeUtil: createMockPropTypeUtil( 'global-color-variable' ),
				fallbackPropTypeUtil: createMockPropTypeUtil( 'color' ),
			} );

			const variable = {
				type: 'global-color-variable',
				label: 'page-body-color',
				value: 'white',
			};

			// Act.
			const { isCompatible } = registry.getVariableType( 'global-color-variable' );

			expect( isCompatible?.( propType, variable ) ).toBe( false );
		} );
	} );
} );
