import { createMockElement } from 'test-utils';

import { getOverridableProp } from '../../components/overridable-props/utils/get-overridable-prop';
import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { type OverridableProp, type OverridableProps } from '../../types';
import { filterValidOverridableProps, isExposedPropValid } from '../filter-valid-overridable-props';
import { getContainerByOriginId } from '../get-container-by-origin-id';

jest.mock( '../get-container-by-origin-id', () => ( {
	getContainerByOriginId: jest.fn(),
} ) );
jest.mock( '../../components/overridable-props/utils/get-overridable-prop', () => ( {
	getOverridableProp: jest.fn(),
} ) );

const mockGetContainerByOriginId = jest.mocked( getContainerByOriginId );

const INNER_COMPONENT_ID = 1111;
const COMPONENT_INSTANCE_ELEMENT_ID = '61b83e7';

function createDirectProp( overrideKey: string ): OverridableProp {
	return {
		overrideKey,
		label: `Direct Prop ${ overrideKey }`,
		elementId: 'direct-element-id',
		propKey: 'text',
		elType: 'widget',
		widgetType: 'e-heading',
		originValue: { $$type: 'string', value: 'Direct Value' },
		groupId: 'group-1',
	};
}

function createExposedProp( overrideKey: string, innerOverrideKey: string ): OverridableProp {
	return {
		overrideKey,
		label: `Exposed Prop ${ overrideKey }`,
		elementId: COMPONENT_INSTANCE_ELEMENT_ID,
		propKey: 'text',
		elType: 'widget',
		widgetType: 'e-component',
		originValue: {
			$$type: 'override',
			value: {
				override_key: innerOverrideKey,
				override_value: { $$type: 'string', value: 'Override Value' },
				schema_source: { type: 'component', id: INNER_COMPONENT_ID },
			},
		},
		groupId: 'group-1',
		originPropFields: {
			propKey: 'text',
			widgetType: 'e-button',
			elType: 'widget',
			elementId: 'inner-element-id',
		},
	};
}

function createComponentInstanceSetting( overrides: Array< { outerKey: string; innerKey: string } > ) {
	const overridesValue = overrides.map( ( { outerKey, innerKey } ) =>
		componentOverridablePropTypeUtil.create( {
			override_key: outerKey,
			origin_value: componentInstanceOverridePropTypeUtil.create( {
				override_key: innerKey,
				override_value: null,
				schema_source: { type: 'component', id: INNER_COMPONENT_ID },
			} ),
		} )
	);

	return componentInstancePropTypeUtil.create( {
		component_id: { $$type: 'number', value: INNER_COMPONENT_ID },
		overrides: componentInstanceOverridesPropTypeUtil.create( overridesValue ),
	} );
}

function createContainerWithComponentInstance( componentInstanceSetting: unknown ) {
	return createMockElement( {
		model: { id: COMPONENT_INSTANCE_ELEMENT_ID, widgetType: 'e-component' },
		settings: { component_instance: componentInstanceSetting },
	} );
}

function createInnerOverridableProps( propKeys: string[] ): OverridableProps {
	const props: Record< string, OverridableProp > = {};

	for ( const key of propKeys ) {
		props[ key ] = createDirectProp( key );
	}

	return {
		props,
		groups: {
			items: {
				'group-1': { id: 'group-1', label: 'Group 1', props: propKeys },
			},
			order: [ 'group-1' ],
		},
	};
}

describe( 'filter-valid-overridable-props', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'isExposedPropValid', () => {
		it( 'should return true for direct props (no originPropFields)', () => {
			// Arrange
			const prop = createDirectProp( 'prop-1' );
			jest.mocked( getOverridableProp ).mockReturnValue( undefined );

			// Act
			const result = isExposedPropValid( prop );

			// Assert
			expect( result ).toBe( true );
			expect( getOverridableProp ).not.toHaveBeenCalled();
		} );

		it( 'should return true when inner prop exists', () => {
			// Arrange
			const prop = createExposedProp( 'prop-4', 'prop-0' );
			const innerOverridableProps = createInnerOverridableProps( [ 'prop-0', 'prop-1' ] );
			const setting = createComponentInstanceSetting( [ { outerKey: 'prop-4', innerKey: 'prop-0' } ] );

			mockGetContainerByOriginId.mockReturnValue( createContainerWithComponentInstance( setting ) );

			jest.mocked( getOverridableProp ).mockImplementation( ( { overrideKey } ) => {
				return innerOverridableProps.props[ overrideKey ];
			} );

			// Act
			const result = isExposedPropValid( prop );

			// Assert
			expect( result ).toBe( true );
			expect( getOverridableProp ).toHaveBeenCalledWith( {
				componentId: INNER_COMPONENT_ID,
				overrideKey: 'prop-0',
			} );
		} );

		it( 'should return false when inner prop was deleted', () => {
			// Arrange
			const prop = createExposedProp( 'prop-4', 'prop-0' );
			const innerOverridableProps = createInnerOverridableProps( [ 'prop-1' ] );
			const setting = createComponentInstanceSetting( [ { outerKey: 'prop-4', innerKey: 'prop-0' } ] );

			mockGetContainerByOriginId.mockReturnValue( createContainerWithComponentInstance( setting ) );

			jest.mocked( getOverridableProp ).mockImplementation(
				( { overrideKey } ) => innerOverridableProps.props[ overrideKey ]
			);

			// Act
			const result = isExposedPropValid( prop );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return false when container is not found', () => {
			// Arrange
			const prop = createExposedProp( 'prop-4', 'prop-0' );

			mockGetContainerByOriginId.mockReturnValue( null );

			jest.mocked( getOverridableProp ).mockReturnValue( undefined );

			// Act
			const result = isExposedPropValid( prop );

			// Assert
			expect( result ).toBe( false );
			expect( getOverridableProp ).not.toHaveBeenCalled();
		} );

		it( 'should return false when inner component not found in store', () => {
			// Arrange
			const prop = createExposedProp( 'prop-4', 'prop-0' );
			const setting = createComponentInstanceSetting( [ { outerKey: 'prop-4', innerKey: 'prop-0' } ] );

			mockGetContainerByOriginId.mockReturnValue( createContainerWithComponentInstance( setting ) );

			jest.mocked( getOverridableProp ).mockReturnValue( undefined );

			// Act
			const result = isExposedPropValid( prop );

			// Assert
			expect( result ).toBe( false );
		} );
	} );

	describe( 'filterValidOverridableProps', () => {
		it( 'should keep direct props unchanged', () => {
			// Arrange
			const overridableProps: OverridableProps = {
				props: {
					'prop-1': createDirectProp( 'prop-1' ),
					'prop-2': createDirectProp( 'prop-2' ),
				},
				groups: {
					items: {
						'group-1': { id: 'group-1', label: 'Group 1', props: [ 'prop-1', 'prop-2' ] },
					},
					order: [ 'group-1' ],
				},
			};

			jest.mocked( getOverridableProp ).mockImplementation( ( { overrideKey } ) => {
				return overridableProps.props[ overrideKey ];
			} );

			// Act
			const result = filterValidOverridableProps( overridableProps );

			// Assert
			expect( Object.keys( result.props ) ).toEqual( [ 'prop-1', 'prop-2' ] );
			expect( result.groups.items[ 'group-1' ].props ).toEqual( [ 'prop-1', 'prop-2' ] );
		} );

		it( 'should filter out exposed props with deleted inner props', () => {
			// Arrange
			const overridableProps: OverridableProps = {
				props: {
					'prop-2': createDirectProp( 'prop-2' ),
					'prop-4': createExposedProp( 'prop-4', 'prop-0' ),
					'prop-5': createExposedProp( 'prop-5', 'prop-1' ),
				},
				groups: {
					items: {
						'group-1': { id: 'group-1', label: 'Group 1', props: [ 'prop-2', 'prop-4', 'prop-5' ] },
					},
					order: [ 'group-1' ],
				},
			};

			const innerOverridableProps = createInnerOverridableProps( [ 'prop-1' ] );
			const setting = createComponentInstanceSetting( [
				{ outerKey: 'prop-4', innerKey: 'prop-0' },
				{ outerKey: 'prop-5', innerKey: 'prop-1' },
			] );

			mockGetContainerByOriginId.mockReturnValue( createContainerWithComponentInstance( setting ) );

			jest.mocked( getOverridableProp ).mockImplementation( ( { overrideKey } ) => {
				return innerOverridableProps.props[ overrideKey ];
			} );

			// Act
			const result = filterValidOverridableProps( overridableProps );

			// Assert
			expect( Object.keys( result.props ) ).toEqual( [ 'prop-2', 'prop-5' ] );
			expect( result.groups.items[ 'group-1' ].props ).toEqual( [ 'prop-2', 'prop-5' ] );
		} );

		it( 'should handle multi-level nesting validation', () => {
			// Arrange
			const middleComponentId = 2222;
			const innerComponentId = 1111;

			const outerProp: OverridableProp = {
				overrideKey: 'prop-10',
				label: 'Outer Exposed Prop',
				elementId: 'outer-component-instance',
				propKey: 'text',
				elType: 'widget',
				widgetType: 'e-component',
				originValue: { $$type: 'override', value: {} },
				groupId: 'group-1',
				originPropFields: {
					propKey: 'text',
					widgetType: 'e-component',
					elType: 'widget',
					elementId: 'middle-element',
				},
			};

			const middleProp: OverridableProp = {
				overrideKey: 'prop-4',
				label: 'Middle Exposed Prop',
				elementId: 'middle-component-instance',
				propKey: 'text',
				elType: 'widget',
				widgetType: 'e-component',
				originValue: { $$type: 'override', value: {} },
				groupId: 'group-1',
				originPropFields: {
					propKey: 'text',
					widgetType: 'e-button',
					elType: 'widget',
					elementId: 'inner-element',
				},
			};

			const innerProp = createDirectProp( 'prop-0' );

			const overridableProps: OverridableProps = {
				props: { 'prop-10': outerProp },
				groups: {
					items: { 'group-1': { id: 'group-1', label: 'Group 1', props: [ 'prop-10' ] } },
					order: [ 'group-1' ],
				},
			};

			mockGetContainerByOriginId.mockImplementation( ( originId ) => {
				if ( originId === 'outer-component-instance' ) {
					return createMockElement( {
						model: { id: 'outer-component-instance', widgetType: 'e-component' },
						settings: {
							component_instance: componentInstancePropTypeUtil.create( {
								component_id: { $$type: 'number', value: middleComponentId },
								overrides: componentInstanceOverridesPropTypeUtil.create( [
									componentOverridablePropTypeUtil.create( {
										override_key: 'prop-10',
										origin_value: componentInstanceOverridePropTypeUtil.create( {
											override_key: 'prop-4',
											override_value: null,
											schema_source: { type: 'component', id: middleComponentId },
										} ),
									} ),
								] ),
							} ),
						},
					} );
				}
				if ( originId === 'middle-component-instance' ) {
					return createMockElement( {
						model: { id: 'middle-component-instance', widgetType: 'e-component' },
						settings: {
							component_instance: componentInstancePropTypeUtil.create( {
								component_id: { $$type: 'number', value: innerComponentId },
								overrides: componentInstanceOverridesPropTypeUtil.create( [
									componentOverridablePropTypeUtil.create( {
										override_key: 'prop-4',
										origin_value: componentInstanceOverridePropTypeUtil.create( {
											override_key: 'prop-0',
											override_value: null,
											schema_source: { type: 'component', id: innerComponentId },
										} ),
									} ),
								] ),
							} ),
						},
					} );
				}
				return null;
			} );

			jest.mocked( getOverridableProp ).mockImplementation( ( { componentId, overrideKey } ) => {
				if ( componentId === middleComponentId && overrideKey === 'prop-4' ) {
					return middleProp;
				}
				if ( componentId === innerComponentId && overrideKey === 'prop-0' ) {
					return innerProp;
				}

				return undefined;
			} );

			// Act
			const result = filterValidOverridableProps( overridableProps );

			// Assert
			expect( Object.keys( result.props ) ).toEqual( [ 'prop-10' ] );
		} );
	} );
} );
