import { createMockElement, createMockElementData } from 'test-utils';
import { getAllDescendants, getContainer, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { cleanAllOverridablesInContainer, cleanAllOverridablesInElementData } from '../revert-overridable-settings';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	getAllDescendants: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockGetAllDescendants = jest.mocked( getAllDescendants );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );

const MOCK_COMPONENT_ID = 123;
const ORIGIN_STRING_VALUE = { $$type: 'string', value: 'Original Text' };
const ORIGIN_HTML_VALUE = { $$type: 'html', value: '<p>Hello</p>' };

describe( 'cleanAllOverridablesInElementData', () => {
	it( 'should clean overridable props from regular element settings', () => {
		// Arrange
		const elementData = createMockElementData( {
			id: 'element-1',
			widgetType: 'e-heading',
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-1',
					origin_value: ORIGIN_STRING_VALUE,
				} ),
				description: ORIGIN_HTML_VALUE,
			},
		} );

		// Act
		const result = cleanAllOverridablesInElementData( elementData );

		// Assert
		expect( result.settings?.title ).toEqual( ORIGIN_STRING_VALUE );
		expect( result.settings?.description ).toEqual( ORIGIN_HTML_VALUE );
	} );

	it( 'should clean multiple overridable props from settings', () => {
		// Arrange
		const elementData = createMockElementData( {
			id: 'element-1',
			widgetType: 'e-heading',
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-1',
					origin_value: ORIGIN_STRING_VALUE,
				} ),
				subtitle: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-2',
					origin_value: ORIGIN_HTML_VALUE,
				} ),
			},
		} );

		// Act
		const result = cleanAllOverridablesInElementData( elementData );

		// Assert
		expect( result.settings?.title ).toEqual( ORIGIN_STRING_VALUE );
		expect( result.settings?.subtitle ).toEqual( ORIGIN_HTML_VALUE );
	} );

	it( 'should clean overridables from component instance overrides', () => {
		// Arrange
		const elementData = createMockElementData( {
			id: 'component-1',
			widgetType: 'e-component',
			settings: {
				component_instance: componentInstancePropTypeUtil.create( {
					component_id: numberPropTypeUtil.create( MOCK_COMPONENT_ID ),
					overrides: componentInstanceOverridesPropTypeUtil.create( [
						componentOverridablePropTypeUtil.create( {
							override_key: 'outer-key',
							origin_value: componentInstanceOverridePropTypeUtil.create( {
								override_key: 'inner-key',
								override_value: ORIGIN_STRING_VALUE,
								schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
							} ),
						} ),
					] ),
				} ),
			},
		} );

		// Act
		const result = cleanAllOverridablesInElementData( elementData );

		// Assert
		const componentInstance = componentInstancePropTypeUtil.extract( result.settings?.component_instance );
		const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

		expect( overrides ).toHaveLength( 1 );
		expect( componentInstanceOverridePropTypeUtil.isValid( overrides?.[ 0 ] ) ).toBe( true );
	} );

	it( 'should recursively clean nested elements', () => {
		// Arrange
		const childElement = createMockElementData( {
			id: 'child-1',
			widgetType: 'e-heading',
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'child-prop',
					origin_value: ORIGIN_STRING_VALUE,
				} ),
			},
		} );

		const parentElement = createMockElementData( {
			id: 'parent-1',
			widgetType: 'container',
			settings: {
				layout: componentOverridablePropTypeUtil.create( {
					override_key: 'parent-prop',
					origin_value: ORIGIN_HTML_VALUE,
				} ),
			},
			elements: [ childElement ],
		} );

		// Act
		const result = cleanAllOverridablesInElementData( parentElement );

		// Assert
		expect( result.settings?.layout ).toEqual( ORIGIN_HTML_VALUE );
		expect( result.elements?.[ 0 ].settings?.title ).toEqual( ORIGIN_STRING_VALUE );
	} );

	it( 'should not modify element without overridable props', () => {
		// Arrange
		const elementData = createMockElementData( {
			id: 'element-1',
			widgetType: 'e-heading',
			settings: {
				title: ORIGIN_STRING_VALUE,
				description: ORIGIN_HTML_VALUE,
			},
		} );

		// Act
		const result = cleanAllOverridablesInElementData( elementData );

		// Assert
		expect( result.settings ).toEqual( elementData.settings );
	} );
} );

describe( 'cleanAllOverridablesInContainer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should clean overridable props from regular element', () => {
		// Arrange
		const element = createMockElement( {
			model: {
				id: 'element-1',
				widgetType: 'e-heading',
				elType: 'widget',
			},
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-1',
					origin_value: ORIGIN_STRING_VALUE,
				} ),
			},
		} );

		mockGetContainer.mockReturnValue( element );
		mockGetAllDescendants.mockReturnValue( [ element ] );

		// Act
		cleanAllOverridablesInContainer( 'element-1' );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
			id: 'element-1',
			props: {
				title: ORIGIN_STRING_VALUE,
			},
			withHistory: false,
		} );
	} );

	it( 'should clean overridables from component instance', () => {
		// Arrange
		const componentInstance = createMockComponentInstance( MOCK_COMPONENT_ID, [
			{
				override_key: 'outer-key',
				isOverridable: true,
				inner_override_key: 'inner-key',
				override_value: ORIGIN_STRING_VALUE,
			},
		] );

		mockGetContainer.mockReturnValue( componentInstance );
		mockGetAllDescendants.mockReturnValue( [ componentInstance ] );

		// Act
		cleanAllOverridablesInContainer( 'component-1' );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 'component-1',
				withHistory: false,
			} )
		);
	} );

	it( 'should process all descendants', () => {
		// Arrange
		const childElement = createMockElement( {
			model: {
				id: 'child-1',
				widgetType: 'e-heading',
				elType: 'widget',
			},
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'child-prop',
					origin_value: ORIGIN_STRING_VALUE,
				} ),
			},
		} );

		const parentElement = createMockElement( {
			model: {
				id: 'parent-1',
				widgetType: 'container',
				elType: 'container',
			},
			settings: {
				layout: componentOverridablePropTypeUtil.create( {
					override_key: 'parent-prop',
					origin_value: ORIGIN_HTML_VALUE,
				} ),
			},
			children: [ childElement ],
		} );

		mockGetContainer.mockReturnValue( parentElement );
		mockGetAllDescendants.mockReturnValue( [ parentElement, childElement ] );

		// Act
		cleanAllOverridablesInContainer( 'parent-1' );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not update element without overridable props', () => {
		// Arrange
		const element = createMockElement( {
			model: {
				id: 'element-1',
				widgetType: 'e-heading',
				elType: 'widget',
			},
			settings: {
				title: ORIGIN_STRING_VALUE,
			},
		} );

		mockGetContainer.mockReturnValue( element );
		mockGetAllDescendants.mockReturnValue( [ element ] );

		// Act
		cleanAllOverridablesInContainer( 'element-1' );

		// Assert
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should handle missing container gracefully', () => {
		// Arrange
		mockGetContainer.mockReturnValue( null );

		// Act
		cleanAllOverridablesInContainer( 'non-existent' );

		// Assert
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );
} );

function createMockComponentInstance(
	componentId: number,
	overrides: Array< {
		override_key: string;
		isOverridable: boolean;
		inner_override_key: string;
		override_value: unknown;
	} >,
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
						componentOverridablePropTypeUtil.create( {
							override_key: override.override_key,
							origin_value: componentInstanceOverridePropTypeUtil.create( {
								override_key: override.inner_override_key,
								override_value: override.override_value,
								schema_source: { type: 'component', id: componentId },
							} ),
						} )
					)
				),
			} ),
		},
	} );
}
