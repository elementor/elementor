import { createMockContainer } from 'test-utils';
import { type V1Element } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';

import { type OverridesMapping } from '../../components/instance-editing-panel/utils/resolve-element-settings';
import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { type OverridableProp } from '../../types';
import { getContainerByOriginId } from '../get-container-by-origin-id';
import { getOverridableProp } from '../get-overridable-prop';
import { buildOverridesMap, walkDownOverridesChain } from '../walk-down-overrides-chain';

jest.mock( '@elementor/editor-elements' );

jest.mock( '../get-container-by-origin-id', () => ( {
	getContainerByOriginId: jest.fn(),
} ) );

jest.mock( '../get-overridable-prop', () => ( {
	getOverridableProp: jest.fn(),
} ) );

const mockGetContainerByOriginId = jest.mocked( getContainerByOriginId );
const mockGetOverridableProp = jest.mocked( getOverridableProp );

const COMPONENT_ID = 100;

function stringValue( text: string ): AnyTransformable {
	return { $$type: 'string', value: text };
}

function simpleOverride( overrideKey: string, overrideValue: unknown ): ComponentInstanceOverride {
	return componentInstanceOverridePropTypeUtil.create( {
		override_key: overrideKey,
		override_value: overrideValue,
		schema_source: { type: 'component', id: COMPONENT_ID },
	} );
}

function exposedFurtherOverride(
	outerKey: string,
	innerKey: string,
	innerValue: AnyTransformable
): ComponentInstanceOverride {
	return componentOverridablePropTypeUtil.create( {
		override_key: outerKey,
		origin_value: componentInstanceOverridePropTypeUtil.create( {
			override_key: innerKey,
			override_value: innerValue,
			schema_source: { type: 'component', id: COMPONENT_ID },
		} ),
	} );
}

function createComponentInstance( id: string, componentId: number, overrides: ComponentInstanceOverride[] ): V1Element {
	return createMockContainer( id, [], 'widget', {
		component_instance: {
			$$type: 'component-instance',
			value: {
				component_id: { $$type: 'number', value: componentId },
				overrides: { $$type: 'overrides', value: overrides },
			},
		},
	} );
}

function createOverridableProp( overrides: Partial< OverridableProp > ): OverridableProp {
	return {
		overrideKey: 'key',
		label: 'Label',
		elementId: 'element-1',
		propKey: 'title',
		widgetType: 'e-heading',
		elType: 'widget',
		groupId: 'content',
		originValue: null,
		...overrides,
	};
}

describe( 'buildOverridesMap', () => {
	it( 'should return empty mapping for empty inputs', () => {
		// Arrange & Act
		const result = buildOverridesMap( {}, [] );

		// Assert
		expect( result ).toEqual( {} );
	} );

	it( 'should store simple override with key and value', () => {
		// Arrange
		const overrides = [ simpleOverride( 'title-key', stringValue( 'Title Value' ) ) ];

		// Act
		const result = buildOverridesMap( {}, overrides );

		// Assert
		expect( result ).toEqual( {
			'title-key': { value: stringValue( 'Title Value' ) },
		} );
	} );

	it( 'should translate exposed-further override from outer key to inner key with outermostKey', () => {
		// Arrange
		const innerValue = stringValue( 'Inner Value' );
		const overrides = [ exposedFurtherOverride( 'outer-key', 'inner-key', stringValue( 'Inner Value' ) ) ];

		// Act
		const result = buildOverridesMap( {}, overrides );

		// Assert
		expect( result ).toEqual( {
			'inner-key': { value: innerValue, outermostKey: 'outer-key' },
		} );
	} );

	it( 'should carry forward higher-level value to inner key when existing override matches outer key', () => {
		// Arrange
		const higherLevelValue = stringValue( 'Higher Level Value' );
		const innerValue = stringValue( 'Inner Value' );

		const existing: OverridesMapping = { 'outer-key': { value: higherLevelValue } };
		const overrides = [ exposedFurtherOverride( 'outer-key', 'inner-key', innerValue ) ];

		// Act
		const result = buildOverridesMap( existing, overrides );

		// Assert
		expect( result[ 'inner-key' ] ).toEqual( {
			value: higherLevelValue,
			outermostKey: 'outer-key',
		} );
	} );

	it( 'should preserve existing outermostKey through key translation chain', () => {
		// Arrange
		const topLevelValue = stringValue( 'Top Level Value' );
		const innerValue = stringValue( 'Inner Value' );
		const existing: OverridesMapping = {
			'top-key': { value: topLevelValue },
			'middle-key': { value: topLevelValue, outermostKey: 'top-key' },
		};
		const overrides = [ exposedFurtherOverride( 'middle-key', 'inner-key', innerValue ) ];

		// Act
		const result = buildOverridesMap( existing, overrides );

		// Assert
		expect( result[ 'inner-key' ] ).toEqual( {
			value: topLevelValue,
			outermostKey: 'top-key',
		} );
	} );

	it( 'should fall back to inner value when higher-level override value is null', () => {
		// Arrange
		const existing = { 'outer-key': { value: null } };
		const innerValue = stringValue( 'Inner Value' );
		const overrides = [ exposedFurtherOverride( 'outer-key', 'inner-key', innerValue ) ];

		// Act
		const result = buildOverridesMap( existing, overrides );

		// Assert
		expect( result[ 'inner-key' ] ).toEqual( {
			value: innerValue,
			outermostKey: 'outer-key',
		} );
	} );

	it( 'should handle mix of simple and exposed-further overrides', () => {
		// Arrange
		const innerValue = stringValue( 'Inner Value' );
		const overrides = [
			simpleOverride( 'simple-key', 'Simple Value' ),
			exposedFurtherOverride( 'outer-key', 'inner-key', innerValue ),
		];

		// Act
		const result = buildOverridesMap( {}, overrides );

		// Assert
		expect( result ).toEqual( {
			'simple-key': { value: 'Simple Value' },
			'inner-key': { value: innerValue, outermostKey: 'outer-key' },
		} );
	} );
} );

describe( 'walkDownOverridesChain', () => {
	describe( 'base case — no originPropFields', () => {
		it( 'should return inner element with empty overridesMapping', () => {
			// Arrange
			const innerElement = createMockContainer( 'inner-1', [] );
			const prop = createOverridableProp( { elementId: 'element-1' } );
			mockGetContainerByOriginId.mockImplementation( ( elementId, instanceId ) => {
				if ( elementId === 'element-1' && instanceId === 'instance-1' ) {
					return innerElement;
				}
				return null;
			} );

			// Act
			const result = walkDownOverridesChain( {
				upperLevelOverridableProp: prop,
				upperInstanceId: 'instance-1',
			} );

			// Assert
			expect( result ).toEqual( {
				isChainBroken: false,
				innerElement,
				overridesMapping: {},
			} );
		} );

		it( 'should throw when inner element is not found', () => {
			// Arrange
			const prop = createOverridableProp( { elementId: 'missing-element' } );
			mockGetContainerByOriginId.mockReturnValue( null );

			// Act & Assert
			expect( () =>
				walkDownOverridesChain( {
					upperLevelOverridableProp: prop,
					upperInstanceId: 'instance-1',
				} )
			).toThrow( 'Inner element not found inside instance' );
		} );
	} );

	describe( 'one level of nesting', () => {
		const INNER_COMPONENT_ID = 200;
		const INNER_ELEMENT_ID = 'inner-element';
		const INNER_COMPONENT_INSTANCE_ID = 'middle-instance';

		it( 'should walk one level down and collect overrides', () => {
			// Arrange
			const innerValue = stringValue( 'Inner Value' );
			const middleInstance = createComponentInstance( INNER_COMPONENT_INSTANCE_ID, INNER_COMPONENT_ID, [
				exposedFurtherOverride( 'outer-key', 'inner-key', innerValue ),
			] );

			const innerElement = createMockContainer( INNER_ELEMENT_ID, [] );

			const outerProp = createOverridableProp( {
				elementId: 'middle-origin',
				overrideKey: 'outer-key',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			} );

			const innerOverridableProp = createOverridableProp( {
				overrideKey: 'inner-key',
				elementId: INNER_ELEMENT_ID,
			} );

			mockGetContainerByOriginId.mockReturnValueOnce( middleInstance ).mockReturnValueOnce( innerElement );
			mockGetOverridableProp.mockReturnValue( innerOverridableProp );

			// Act
			const result = walkDownOverridesChain( {
				upperLevelOverridableProp: outerProp,
				upperInstanceId: 'top-instance',
			} );

			// Assert
			expect( result.isChainBroken ).toBe( false );
			if ( ! result.isChainBroken ) {
				expect( result.innerElement ).toBe( innerElement );
				expect( result.overridesMapping ).toEqual( {
					'inner-key': { value: innerValue, outermostKey: 'outer-key' },
				} );
			}
		} );

		it( 'should return isChainBroken when intermediate instance is not found', () => {
			// Arrange
			const outerProp = createOverridableProp( {
				elementId: 'deleted-instance',
				overrideKey: 'key',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			} );

			mockGetContainerByOriginId.mockReturnValue( null );

			// Act
			const result = walkDownOverridesChain( {
				upperLevelOverridableProp: outerProp,
				upperInstanceId: 'top-instance',
			} );

			// Assert
			expect( result.isChainBroken ).toBe( true );
		} );

		it( 'should return isChainBroken: true when no matching override found at current level', () => {
			// Arrange
			const middleInstance = createComponentInstance( INNER_COMPONENT_INSTANCE_ID, INNER_COMPONENT_ID, [
				simpleOverride( 'unrelated-key', 'value' ),
			] );

			const outerProp = createOverridableProp( {
				elementId: 'middle-origin',
				overrideKey: 'non-existing-outer-key',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			} );

			mockGetContainerByOriginId.mockReturnValueOnce( middleInstance );

			// Act
			const result = walkDownOverridesChain( {
				upperLevelOverridableProp: outerProp,
				upperInstanceId: 'top-instance',
			} );

			// Assert
			expect( result.isChainBroken ).toBe( true );
		} );
	} );

	describe( 'deep nesting — 3 levels (A → B → innermost element)', () => {
		const COMPONENT_A = 300;
		const COMPONENT_B = 301;

		it( 'should walk through 3 levels and carry forward override values', () => {
			// Arrange
			// Key chain: top-outer → a-inner (= b-outer at level B) → b-inner (innermost)
			const levelAInnerValue = stringValue( 'A Inner Value' );
			const levelAInstance = createComponentInstance( 'instance-a', COMPONENT_A, [
				exposedFurtherOverride( 'top-outer', 'a-inner', levelAInnerValue ),
			] );

			const levelBInstance = createComponentInstance( 'instance-b', COMPONENT_B, [
				exposedFurtherOverride( 'a-inner', 'b-inner', stringValue( 'B Inner Value' ) ),
			] );

			const innermostElement = createMockContainer( 'innermost', [] );

			const topProp = createOverridableProp( {
				elementId: 'origin-a',
				overrideKey: 'top-outer',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: 'origin-b',
				},
			} );

			const middleProp = createOverridableProp( {
				elementId: 'origin-b',
				overrideKey: 'a-inner',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: 'innermost',
				},
			} );

			const innermostProp = createOverridableProp( {
				overrideKey: 'b-inner',
				elementId: 'innermost',
			} );

			mockGetContainerByOriginId
				.mockReturnValueOnce( levelAInstance )
				.mockReturnValueOnce( levelBInstance )
				.mockReturnValueOnce( innermostElement );

			mockGetOverridableProp.mockReturnValueOnce( middleProp ).mockReturnValueOnce( innermostProp );

			// Act
			const result = walkDownOverridesChain( {
				upperLevelOverridableProp: topProp,
				upperInstanceId: 'top-instance',
			} );

			// Assert
			expect( result.isChainBroken ).toBe( false );
			if ( ! result.isChainBroken ) {
				expect( result.innerElement ).toBe( innermostElement );
				expect( result.overridesMapping[ 'b-inner' ] ).toEqual( {
					value: levelAInnerValue,
					outermostKey: 'top-outer',
				} );
			}
		} );

		it( 'should return isChainBroken when any level in the chain fails', () => {
			// Arrange
			const levelAInstance = createComponentInstance( 'instance-a', COMPONENT_A, [
				exposedFurtherOverride( 'top-outer', 'a-inner', stringValue( 'A Inner Value' ) ),
			] );

			const topProp = createOverridableProp( {
				elementId: 'origin-a',
				overrideKey: 'top-outer',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: 'origin-b',
				},
			} );

			const middleProp = createOverridableProp( {
				elementId: 'origin-b',
				overrideKey: 'a-inner',
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: 'innermost',
				},
			} );

			mockGetContainerByOriginId.mockReturnValueOnce( levelAInstance ).mockReturnValueOnce( null );
			mockGetOverridableProp.mockReturnValueOnce( middleProp );

			// Act
			const result = walkDownOverridesChain( {
				upperLevelOverridableProp: topProp,
				upperInstanceId: 'top-instance',
			} );

			// Assert
			expect( result.isChainBroken ).toBe( true );
		} );
	} );
} );
