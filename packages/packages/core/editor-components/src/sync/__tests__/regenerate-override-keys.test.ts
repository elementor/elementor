import { createMockElement } from 'test-utils';
import { getContainer, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { regenerateOverrideKeysForContainers } from '../regenerate-override-keys';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	generateUniqueId: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );

describe( 'regenerateOverrideKeysForContainers', () => {
	const MOCK_COMPONENT_ID = 123;

	it( 'should regenerate override keys for component instances', () => {
		// Arrange
		const NEW_OVERRIDE_KEY_1 = 'prop-new-1';
		const NEW_OVERRIDE_KEY_2 = 'prop-new-2';

		jest.mocked( generateUniqueId )
			.mockReturnValueOnce( NEW_OVERRIDE_KEY_1 )
			.mockReturnValueOnce( NEW_OVERRIDE_KEY_2 );

		const componentInstance = createMockComponentInstance( MOCK_COMPONENT_ID, [
			{ override_key: 'prop-original-1', override_value: { $$type: 'html', value: 'Title 1' } },
			{ override_key: 'prop-original-2', override_value: { $$type: 'string', value: 'Value 2' } },
		] );

		mockGetContainer.mockReturnValue( componentInstance );

		// Act
		regenerateOverrideKeysForContainers( componentInstance );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
			id: 'component-1',
			withHistory: false,
			props: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: {
							$$type: 'number',
							value: MOCK_COMPONENT_ID,
						},
						overrides: componentInstanceOverridesPropTypeUtil.create( [
							componentInstanceOverridePropTypeUtil.create( {
								override_key: NEW_OVERRIDE_KEY_1,
								override_value: { $$type: 'html', value: 'Title 1' },
								schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
							} ),
							componentInstanceOverridePropTypeUtil.create( {
								override_key: NEW_OVERRIDE_KEY_2,
								override_value: { $$type: 'string', value: 'Value 2' },
								schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
							} ),
						] ),
					},
				},
			},
		} );
	} );

	it( 'should not update settings for non-component widgets', () => {
		// Arrange
		const regularWidget = createMockElement( {
			model: {
				id: 'heading-1',
				widgetType: 'e-heading',
				elType: 'widget',
			},
			settings: {
				title: { $$type: 'html', value: 'Hello World' },
			},
		} );

		mockGetContainer.mockReturnValue( regularWidget );

		// Act
		regenerateOverrideKeysForContainers( regularWidget );

		// Assert
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should not update settings for component instances without overrides', () => {
		// Arrange
		const componentWithoutOverrides = createMockElement( {
			model: {
				id: 'component-1',
				widgetType: 'e-component',
				elType: 'widget',
			},
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: MOCK_COMPONENT_ID },
					},
				},
			},
		} );

		mockGetContainer.mockReturnValue( componentWithoutOverrides );

		// Act
		regenerateOverrideKeysForContainers( componentWithoutOverrides );

		// Assert
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should handle array of containers', () => {
		// Arrange
		const componentInstance1 = createMockComponentInstance(
			MOCK_COMPONENT_ID,
			[ { override_key: 'prop-original-1', override_value: { $$type: 'html', value: 'Title 1' } } ],
			'component-1'
		);

		const componentInstance2 = createMockComponentInstance(
			MOCK_COMPONENT_ID,
			[ { override_key: 'prop-original-2', override_value: { $$type: 'html', value: 'Title 2' } } ],
			'component-2'
		);

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'component-1' ) {
				return componentInstance1;
			}
			if ( id === 'component-2' ) {
				return componentInstance2;
			}
			return null;
		} );

		// Act
		regenerateOverrideKeysForContainers( [ componentInstance1, componentInstance2 ] );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should process nested component instances recursively', () => {
		// Arrange
		const childComponent = createMockComponentInstance(
			MOCK_COMPONENT_ID,
			[ { override_key: 'child-override', override_value: { $$type: 'html', value: 'Child' } } ],
			'child-component'
		);

		const parentComponent = createMockComponentInstance(
			MOCK_COMPONENT_ID,
			[ { override_key: 'parent-override', override_value: { $$type: 'html', value: 'Parent' } } ],
			'parent-component'
		);

		parentComponent.children = [ childComponent ];

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'parent-component' ) {
				return parentComponent;
			}
			if ( id === 'child-component' ) {
				return childComponent;
			}
			return null;
		} );

		// Act
		regenerateOverrideKeysForContainers( parentComponent );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining( { id: 'parent-component' } )
		);
		expect( mockUpdateElementSettings ).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining( { id: 'child-component' } )
		);
	} );
} );

function createMockComponentInstance(
	componentId: number,
	overrides: Array< { override_key: string; override_value: unknown } >,
	elementId: string = 'component-1'
): V1Element {
	return createMockElement( {
		model: {
			id: elementId,
			widgetType: 'e-component',
			elType: 'widget',
		},
		settings: {
			component_instance: componentInstancePropTypeUtil.create( {
				component_id: numberPropTypeUtil.create( componentId ),
				overrides: componentInstanceOverridesPropTypeUtil.create(
					overrides.map( ( override ) =>
						componentInstanceOverridePropTypeUtil.create( {
							override_key: override.override_key,
							override_value: override.override_value,
							schema_source: { type: 'component', id: componentId },
						} )
					)
				),
			} ),
		},
	} );
}
