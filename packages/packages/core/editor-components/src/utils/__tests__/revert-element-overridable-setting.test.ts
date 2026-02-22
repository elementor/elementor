import { createMockElement } from 'test-utils';
import { getContainer, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';

import { revertElementOverridableSetting } from '../../extended/utils/revert-overridable-settings';
import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	getElementSetting: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockGetElementSetting = jest.mocked( getElementSetting );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );

const MOCK_COMPONENT_ID = 123;
const ORIGIN_STRING_VALUE = { $$type: 'string', value: 'Original Text' };
const ORIGIN_HTML_VALUE = { $$type: 'html', value: '<p>Hello</p>' };

describe( 'revertElementOverridableSetting', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'regular element', () => {
		it( 'should revert setting to origin value', () => {
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

			// Act
			revertElementOverridableSetting( 'element-1', 'title', ORIGIN_STRING_VALUE, 'prop-1' );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1',
				props: { title: ORIGIN_STRING_VALUE },
				withHistory: false,
			} );
		} );

		it( 'should revert setting to null when origin value is undefined', () => {
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
						origin_value: null,
					} ),
				},
			} );

			mockGetContainer.mockReturnValue( element );

			// Act
			revertElementOverridableSetting( 'element-1', 'title', undefined, 'prop-1' );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1',
				props: { title: null },
				withHistory: false,
			} );
		} );
	} );

	describe( 'component instance', () => {
		it( 'should revert overridable-override to simple override', () => {
			// Arrange
			const innerOverride = componentInstanceOverridePropTypeUtil.create( {
				override_key: 'inner-key',
				override_value: ORIGIN_STRING_VALUE,
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} );

			const componentInstance = componentInstancePropTypeUtil.create( {
				component_id: numberPropTypeUtil.create( MOCK_COMPONENT_ID ),
				overrides: componentInstanceOverridesPropTypeUtil.create( [
					componentOverridablePropTypeUtil.create( {
						override_key: 'outer-key',
						origin_value: innerOverride,
					} ),
				] ),
			} );

			const element = createMockElement( {
				model: {
					id: 'component-instance-1',
					widgetType: 'e-component',
					elType: 'widget',
				},
				settings: {
					component_instance: componentInstance,
				},
			} );

			mockGetContainer.mockReturnValue( element );
			mockGetElementSetting.mockReturnValue( componentInstance );

			// Act
			revertElementOverridableSetting( 'component-instance-1', 'component_instance', innerOverride, 'outer-key' );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 1 );

			const calledProps = mockUpdateElementSettings.mock.calls[ 0 ][ 0 ];
			expect( calledProps.id ).toBe( 'component-instance-1' );
			expect( calledProps.withHistory ).toBe( false );

			const updatedInstance = componentInstancePropTypeUtil.extract( calledProps.props.component_instance );
			const updatedOverrides = componentInstanceOverridesPropTypeUtil.extract( updatedInstance?.overrides );

			expect( updatedOverrides ).toHaveLength( 1 );
			expect( updatedOverrides?.[ 0 ] ).toEqual( innerOverride );
		} );

		it( 'should keep other overrides when reverting overridable-override', () => {
			// Arrange
			const innerOverride1 = componentInstanceOverridePropTypeUtil.create( {
				override_key: 'inner-key-1',
				override_value: ORIGIN_STRING_VALUE,
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} );

			const innerOverride2 = componentInstanceOverridePropTypeUtil.create( {
				override_key: 'inner-key-2',
				override_value: ORIGIN_STRING_VALUE,
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} );

			const regularOverride = componentInstanceOverridePropTypeUtil.create( {
				override_key: 'inner-key-3',
				override_value: ORIGIN_HTML_VALUE,
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} );

			const componentInstance = componentInstancePropTypeUtil.create( {
				component_id: numberPropTypeUtil.create( MOCK_COMPONENT_ID ),
				overrides: componentInstanceOverridesPropTypeUtil.create( [
					componentOverridablePropTypeUtil.create( {
						override_key: 'outer-key-1',
						origin_value: innerOverride1,
					} ),
					componentOverridablePropTypeUtil.create( {
						override_key: 'outer-key-2',
						origin_value: innerOverride2,
					} ),
					regularOverride,
				] ),
			} );

			const element = createMockElement( {
				model: {
					id: 'component-1',
					widgetType: 'e-component',
					elType: 'widget',
				},
				settings: {
					component_instance: componentInstance,
				},
			} );

			mockGetContainer.mockReturnValue( element );
			mockGetElementSetting.mockReturnValue( componentInstance );

			// Act
			revertElementOverridableSetting( 'component-1', 'component_instance', innerOverride1, 'outer-key-1' );

			// Assert
			const calledProps = mockUpdateElementSettings.mock.calls[ 0 ][ 0 ];
			const updatedInstance = componentInstancePropTypeUtil.extract( calledProps.props.component_instance );
			const updatedOverrides = componentInstanceOverridesPropTypeUtil.extract( updatedInstance?.overrides );

			expect( updatedOverrides ).toHaveLength( 3 );
			expect( updatedOverrides?.[ 0 ] ).toEqual( innerOverride1 );
			expect( updatedOverrides?.[ 1 ] ).toEqual(
				componentOverridablePropTypeUtil.create( {
					override_key: 'outer-key-2',
					origin_value: innerOverride2,
				} )
			);
			expect( updatedOverrides?.[ 2 ] ).toEqual( regularOverride );
		} );

		it( 'should not update when overrides are empty', () => {
			// Arrange
			const componentInstance = componentInstancePropTypeUtil.create( {
				component_id: numberPropTypeUtil.create( MOCK_COMPONENT_ID ),
				overrides: componentInstanceOverridesPropTypeUtil.create( [] ),
			} );

			const element = createMockElement( {
				model: {
					id: 'component-1',
					widgetType: 'e-component',
					elType: 'widget',
				},
				settings: {
					component_instance: componentInstance,
				},
			} );

			mockGetContainer.mockReturnValue( element );
			mockGetElementSetting.mockReturnValue( componentInstance );

			// Act
			revertElementOverridableSetting( 'component-1', 'component_instance', null, 'non-existent-key' );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );
} );
