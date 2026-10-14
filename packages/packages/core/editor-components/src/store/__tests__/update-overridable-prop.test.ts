import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import type { OriginPropFields, PublishedComponent } from '../../types';
import { updateOverridableProp } from '../actions/update-overridable-prop';
import { SLICE_NAME } from '../store';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

describe( 'updateOverridableProp', () => {
	const MOCK_COMPONENT_ID = 1;
	const MOCK_OVERRIDE_KEY = 'override-1';
	const MOCK_GROUP_ID = 'group-1';
	const MOCK_WIDGET = {
		elementId: 'widget-1',
		widgetType: 'e-heading',
		elType: 'widget',
		propKey: 'title',
	};

	let mockState: { data: PublishedComponent[] };

	beforeEach( () => {
		jest.clearAllMocks();

		mockState = {
			data: [
				{
					id: MOCK_COMPONENT_ID,
					uid: 'comp-uid',
					name: 'Test Component',
					overridableProps: {
						props: {
							[ MOCK_OVERRIDE_KEY ]: {
								overrideKey: MOCK_OVERRIDE_KEY,
								label: 'Title',
								groupId: MOCK_GROUP_ID,
								...MOCK_WIDGET,
								originValue: { $$type: 'string', value: 'Original' },
							},
						},
						groups: {
							items: {
								[ MOCK_GROUP_ID ]: {
									id: MOCK_GROUP_ID,
									label: 'Content',
									props: [ MOCK_OVERRIDE_KEY ],
								},
							},
							order: [ MOCK_GROUP_ID ],
						},
					},
				},
			],
		};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: mockState,
		} ) );
	} );

	it.each( [
		{
			should: 'update originValue with plain prop value',
			propValue: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: { $$type: 'string', value: 'Updated Text' },
			},
			originPropFields: undefined,
			expectedOriginValue: { $$type: 'string', value: 'Updated Text' },
			expectedOriginPropFields: undefined,
		},
		{
			should: 'extract origin_value from overridable prop',
			propValue: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: componentOverridablePropTypeUtil.create( {
					override_key: 'nested-key',
					origin_value: { $$type: 'string', value: 'Nested Overridable Value' },
				} ),
			},
			originPropFields: undefined,
			expectedOriginValue: { $$type: 'string', value: 'Nested Overridable Value' },
			expectedOriginPropFields: undefined,
		},
		{
			should: 'extract override_value from override prop',
			propValue: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: componentInstanceOverridePropTypeUtil.create( {
					override_key: 'inner-key',
					override_value: { $$type: 'string', value: 'Override Value' },
					schema_source: { type: 'component', id: 123 },
				} ),
			},
			originPropFields: undefined,
			expectedOriginValue: { $$type: 'string', value: 'Override Value' },
			expectedOriginPropFields: undefined,
		},
		{
			should: 'extract innermost value from overridable containing override',
			propValue: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: componentOverridablePropTypeUtil.create( {
					override_key: 'outer-key',
					origin_value: componentInstanceOverridePropTypeUtil.create( {
						override_key: 'inner-key',
						override_value: { $$type: 'string', value: 'Deeply Nested Value' },
						schema_source: { type: 'component', id: 456 },
					} ),
				} ),
			},
			originPropFields: undefined,
			expectedOriginValue: { $$type: 'string', value: 'Deeply Nested Value' },
			expectedOriginPropFields: undefined,
		},
		{
			should: 'preserve originPropFields when provided',
			propValue: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: { $$type: 'string', value: 'With Fields' },
			},
			originPropFields: {
				elementId: 'nested-element',
				widgetType: 'e-text',
				elType: 'widget',
				propKey: 'content',
			} as OriginPropFields,
			expectedOriginValue: { $$type: 'string', value: 'With Fields' },
			expectedOriginPropFields: {
				elementId: 'nested-element',
				widgetType: 'e-text',
				elType: 'widget',
				propKey: 'content',
			},
		},
	] )( 'should $should', ( { propValue, originPropFields, expectedOriginValue, expectedOriginPropFields } ) => {
		// Act
		updateOverridableProp( MOCK_COMPONENT_ID, propValue, originPropFields );

		// Assert
		const expectedProp = {
			overrideKey: MOCK_OVERRIDE_KEY,
			label: 'Title',
			groupId: MOCK_GROUP_ID,
			...MOCK_WIDGET,
			originValue: expectedOriginValue,
			...( expectedOriginPropFields ? { originPropFields: expectedOriginPropFields } : {} ),
		};

		expect( dispatch ).toHaveBeenCalledWith( {
			type: `${ SLICE_NAME }/setOverridableProps`,
			payload: {
				componentId: MOCK_COMPONENT_ID,
				overridableProps: {
					props: {
						[ MOCK_OVERRIDE_KEY ]: expectedProp,
					},
					groups: mockState.data[ 0 ].overridableProps?.groups,
				},
			},
		} );
	} );

	it( 'should not dispatch when component does not exist', () => {
		// Arrange
		mockState.data = [];

		// Act
		updateOverridableProp( MOCK_COMPONENT_ID, {
			override_key: MOCK_OVERRIDE_KEY,
			origin_value: { $$type: 'string', value: 'Test' },
		} );

		// Assert
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'should not dispatch when overridable prop does not exist', () => {
		// Arrange
		mockState.data[ 0 ].overridableProps = {
			props: {},
			groups: { items: {}, order: [] },
		};

		// Act
		updateOverridableProp( MOCK_COMPONENT_ID, {
			override_key: 'non-existent-key',
			origin_value: { $$type: 'string', value: 'Test' },
		} );

		// Assert
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
