import { getElementSetting } from '@elementor/editor-elements';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { type OverridableProp } from '../../types';
import { isOriginElementMatchingOverridableProp } from '../is-origin-element-setting-overridable';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementSetting: jest.fn(),
} ) );

const mockGetElementSetting = jest.mocked( getElementSetting );

const MOCK_OVERRIDE_KEY = 'prop-0';
const MOCK_EXPOSED_OVERRIDE_KEY = 'prop-4';
const MOCK_ELEMENT_ID = 'element-123';
const MOCK_PROP_KEY = 'text';

const createDirectProp = ( overrides?: Partial< OverridableProp > ): OverridableProp => ( {
	overrideKey: MOCK_OVERRIDE_KEY,
	label: 'Button Text',
	elementId: MOCK_ELEMENT_ID,
	propKey: MOCK_PROP_KEY,
	elType: 'widget',
	widgetType: 'e-button',
	originValue: { $$type: 'string', value: 'Click here' },
	groupId: 'group-0',
	...overrides,
} );

const createExposedProp = ( overrides?: Partial< OverridableProp > ): OverridableProp => ( {
	overrideKey: MOCK_EXPOSED_OVERRIDE_KEY,
	label: 'Card Button Text',
	elementId: 'component-instance-456',
	propKey: 'text',
	elType: 'widget',
	widgetType: 'e-component',
	originValue: {
		$$type: 'override',
		value: {
			override_key: MOCK_OVERRIDE_KEY,
			override_value: { $$type: 'string', value: 'Learn more' },
			schema_source: { type: 'component', id: 1111 },
		},
	},
	originPropFields: {
		elType: 'widget',
		widgetType: 'e-button',
		propKey: MOCK_PROP_KEY,
		elementId: MOCK_ELEMENT_ID,
	},
	groupId: 'group-1',
	...overrides,
} );

const createOverridableSetting = ( overrideKey: string ) =>
	componentOverridablePropTypeUtil.create( {
		override_key: overrideKey,
		origin_value: { $$type: 'string', value: 'Original' },
	} );

describe( 'isOriginElementMatchingOverridableProp', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'direct props (no originPropFields)', () => {
		it( 'should return true for direct props without originPropFields', () => {
			// Arrange
			const prop = createDirectProp();

			// Act
			const result = isOriginElementMatchingOverridableProp( prop );

			// Assert
			expect( result ).toBe( true );
			expect( mockGetElementSetting ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'exposed props (with originPropFields)', () => {
		it( 'should return false when origin element setting does not exist', () => {
			// Arrange
			const prop = createExposedProp();
			mockGetElementSetting.mockReturnValue( null );

			// Act
			const result = isOriginElementMatchingOverridableProp( prop );

			// Assert
			expect( result ).toBe( false );
			expect( mockGetElementSetting ).toHaveBeenCalledWith( MOCK_ELEMENT_ID, MOCK_PROP_KEY );
		} );

		it( 'should return false when origin setting is not overridable', () => {
			// Arrange
			const prop = createExposedProp();
			mockGetElementSetting.mockReturnValue( { $$type: 'string', value: 'Plain value' } );

			// Act
			const result = isOriginElementMatchingOverridableProp( prop );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return false when override keys do not match', () => {
			// Arrange
			const prop = createExposedProp();
			const settingWithDifferentKey = createOverridableSetting( 'prop-new-key' );
			mockGetElementSetting.mockReturnValue( settingWithDifferentKey );

			// Act
			const result = isOriginElementMatchingOverridableProp( prop );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return true when origin setting is valid and override key matches', () => {
			// Arrange
			const prop = createExposedProp();
			const validSetting = createOverridableSetting( MOCK_OVERRIDE_KEY );
			mockGetElementSetting.mockReturnValue( validSetting );

			// Act
			const result = isOriginElementMatchingOverridableProp( prop );

			// Assert
			expect( result ).toBe( true );
		} );

		it( 'should return false when setting has no override_key', () => {
			// Arrange
			const prop = createExposedProp();
			const settingWithoutKey = componentOverridablePropTypeUtil.create( {
				override_key: '',
				origin_value: null,
			} );
			mockGetElementSetting.mockReturnValue( settingWithoutKey );

			// Act
			const result = isOriginElementMatchingOverridableProp( prop );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return false when exposed prop has no expected override_key in originValue', () => {
			// Arrange
			const propWithoutExpectedKey = createExposedProp( {
				originValue: { $$type: 'string', value: 'No override structure' },
			} );
			const validSetting = createOverridableSetting( MOCK_OVERRIDE_KEY );
			mockGetElementSetting.mockReturnValue( validSetting );

			// Act
			const result = isOriginElementMatchingOverridableProp( propWithoutExpectedKey );

			// Assert
			expect( result ).toBe( false );
		} );
	} );
} );
