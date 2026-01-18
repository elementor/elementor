import { createMockElement, createMockElementData } from 'test-utils';
import { getAllDescendants, getContainer, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { revertAllOverridablesInContainer, revertAllOverridablesInElementData } from '../revert-overridable-settings';

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
const ORIGIN_LINK_VALUE = {
	$$type: 'link',
	value: {
		destination: {
			$$type: 'url',
			value: 'https://example.com',
		},
		isTargetBlank: {
			$$type: 'boolean',
			value: false,
		},
	},
};

describe( 'revertAllOverridablesInElementData', () => {
	it( 'should revert overridable props from regular element settings', () => {
		// Arrange
		const elementData = createMockElementData( {
			id: 'element-1',
			widgetType: 'e-heading',
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-1',
					origin_value: ORIGIN_STRING_VALUE,
				} ),
				link: ORIGIN_LINK_VALUE,
			},
		} );

		// Act
		const result = revertAllOverridablesInElementData( elementData );

		// Assert
		expect( result.settings?.title ).toEqual( ORIGIN_STRING_VALUE );
		expect( result.settings?.link ).toEqual( ORIGIN_LINK_VALUE );
	} );

	it( 'should revert multiple overridable props from settings', () => {
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
					origin_value: ORIGIN_LINK_VALUE,
				} ),
			},
		} );

		// Act
		const result = revertAllOverridablesInElementData( elementData );

		// Assert
		expect( result.settings?.title ).toEqual( ORIGIN_STRING_VALUE );
		expect( result.settings?.subtitle ).toEqual( ORIGIN_LINK_VALUE );
	} );

	it( 'should revert overridables from component instance overrides', () => {
		// Arrange
		const innerOverride = componentInstanceOverridePropTypeUtil.create( {
			override_key: 'inner-key',
			override_value: ORIGIN_STRING_VALUE,
			schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
		} );

		const elementData = createMockElementData( {
			id: 'component-1',
			widgetType: 'e-component',
			settings: {
				component_instance: componentInstancePropTypeUtil.create( {
					component_id: numberPropTypeUtil.create( MOCK_COMPONENT_ID ),
					overrides: componentInstanceOverridesPropTypeUtil.create( [
						componentOverridablePropTypeUtil.create( {
							override_key: 'outer-key',
							origin_value: innerOverride,
						} ),
					] ),
				} ),
			},
		} );

		// Act
		const result = revertAllOverridablesInElementData( elementData );

		// Assert
		const componentInstance = componentInstancePropTypeUtil.extract( result.settings?.component_instance );
		const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

		expect( overrides ).toHaveLength( 1 );
		expect( componentInstanceOverridePropTypeUtil.isValid( overrides?.[ 0 ] ) ).toBe( true );
		expect( overrides?.[ 0 ] ).toEqual( innerOverride );
	} );

	it( 'should recursively revert nested elements', () => {
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
				link: ORIGIN_LINK_VALUE,
			},
			elements: [ childElement ],
		} );

		// Act
		const result = revertAllOverridablesInElementData( parentElement );

		// Assert
		expect( result.settings?.link ).toEqual( ORIGIN_LINK_VALUE );
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
		const result = revertAllOverridablesInElementData( elementData );

		// Assert
		expect( result.settings ).toEqual( elementData.settings );
	} );
} );

describe( 'revertAllOverridablesInContainer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should revert overridable props from regular element', () => {
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

		mockGetAllDescendants.mockReturnValue( [ element ] );

		// Act
		revertAllOverridablesInContainer( element );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
			id: 'element-1',
			props: {
				title: ORIGIN_STRING_VALUE,
			},
			withHistory: false,
		} );
	} );

	it( 'should revert overridables from component instance', () => {
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
		revertAllOverridablesInContainer( componentInstance );

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
				link: componentOverridablePropTypeUtil.create( {
					override_key: 'parent-prop',
					origin_value: ORIGIN_LINK_VALUE,
				} ),
			},
			children: [ childElement ],
		} );

		mockGetContainer.mockReturnValue( parentElement );
		mockGetAllDescendants.mockReturnValue( [ parentElement, childElement ] );

		// Act
		revertAllOverridablesInContainer( parentElement );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 'parent-1',
				withHistory: false,
				props: {
					link: ORIGIN_LINK_VALUE,
				},
			} )
		);
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 'child-1',
				withHistory: false,
				props: {
					title: ORIGIN_STRING_VALUE,
				},
			} )
		);
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

		mockGetAllDescendants.mockReturnValue( [ element ] );

		// Act
		revertAllOverridablesInContainer( element );

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
