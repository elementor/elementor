import { createMockElement } from 'test-utils';
import { getContainer, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import type { OverridableProp, OverridableProps, PublishedComponent } from '../../types';
import { deleteOverridableProp } from '../actions/delete-overridable-prop';
import { SLICE_NAME } from '../store';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	getElementSetting: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockGetElementSetting = jest.mocked( getElementSetting );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );

describe( 'deleteOverridableProp', () => {
	const COMPONENT_ID = 1;
	const GROUP_ID = 'group-1';

	let mockState: { data: PublishedComponent[] };

	beforeEach( () => {
		jest.clearAllMocks();

		mockState = {
			data: [
				{
					id: COMPONENT_ID,
					uid: 'comp-uid',
					name: 'Test Component',
					overridableProps: {
						props: {},
						groups: { items: {}, order: [] },
					},
				},
			],
		};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: mockState,
		} ) );
	} );

	describe( 'regular widget (e-heading)', () => {
		const ELEMENT_ID = 'heading-1';
		const PROP_KEY = 'title';
		const OVERRIDE_KEY_1 = 'override-1';
		const OVERRIDE_KEY_2 = 'override-2';
		const OVERRIDE_KEY_3 = 'override-3';
		const ORIGIN_VALUE = { $$type: 'html', value: 'Original Title' };

		const createProp = ( overrideKey: string, propKey: string, originValue?: OverridableProp[ 'originValue' ] ) =>
			createOverridableProp( { overrideKey, propKey, originValue, elementId: ELEMENT_ID } );

		mockGetContainer.mockReturnValue(
			createMockElement( {
				model: { id: ELEMENT_ID, widgetType: 'e-heading', elType: 'widget' },
			} )
		);

		it.each( [
			{
				scenario: 'reverts to original value (single prop)',
				propKeyToDelete: OVERRIDE_KEY_1,
				overridableProps: {
					props: {
						[ OVERRIDE_KEY_1 ]: createProp( OVERRIDE_KEY_1, PROP_KEY, ORIGIN_VALUE ),
					},
					groups: {
						items: { [ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: [ OVERRIDE_KEY_1 ] } },
						order: [ GROUP_ID ],
					},
				},
				expectedUpdateCall: {
					id: ELEMENT_ID,
					props: { [ PROP_KEY ]: ORIGIN_VALUE },
				},
				expectedDispatch: {
					props: {},
					groups: {
						items: { [ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: [] } },
						order: [ GROUP_ID ],
					},
				},
			},
			{
				scenario: 'reverts to null when origin value is undefined',
				propKeyToDelete: OVERRIDE_KEY_1,
				overridableProps: {
					props: {
						[ OVERRIDE_KEY_1 ]: createProp( OVERRIDE_KEY_1, PROP_KEY, undefined ),
					},
					groups: {
						items: { [ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: [ OVERRIDE_KEY_1 ] } },
						order: [ GROUP_ID ],
					},
				},
				expectedUpdateCall: {
					id: ELEMENT_ID,
					props: { [ PROP_KEY ]: null },
				},
				expectedDispatch: {
					props: {},
					groups: {
						items: { [ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: [] } },
						order: [ GROUP_ID ],
					},
				},
			},
			{
				scenario: 'deletes middle prop from multiple props',
				propKeyToDelete: OVERRIDE_KEY_2,
				overridableProps: {
					props: {
						[ OVERRIDE_KEY_1 ]: createProp( OVERRIDE_KEY_1, 'text', { $$type: 'html', value: 'First' } ),
						[ OVERRIDE_KEY_2 ]: createProp( OVERRIDE_KEY_2, 'subtitle', ORIGIN_VALUE ),
						[ OVERRIDE_KEY_3 ]: createProp( OVERRIDE_KEY_3, 'hint', { $$type: 'string', value: 'Last' } ),
					},
					groups: {
						items: {
							[ GROUP_ID ]: {
								id: GROUP_ID,
								label: 'Content',
								props: [ OVERRIDE_KEY_1, OVERRIDE_KEY_2, OVERRIDE_KEY_3 ],
							},
						},
						order: [ GROUP_ID ],
					},
				},
				expectedUpdateCall: {
					id: ELEMENT_ID,
					props: { subtitle: ORIGIN_VALUE },
				},
				expectedDispatch: {
					props: {
						[ OVERRIDE_KEY_1 ]: createProp( OVERRIDE_KEY_1, 'text', { $$type: 'html', value: 'First' } ),
						[ OVERRIDE_KEY_3 ]: createProp( OVERRIDE_KEY_3, 'hint', { $$type: 'string', value: 'Last' } ),
					},
					groups: {
						items: {
							[ GROUP_ID ]: {
								id: GROUP_ID,
								label: 'Content',
								props: [ OVERRIDE_KEY_1, OVERRIDE_KEY_3 ],
							},
						},
						order: [ GROUP_ID ],
					},
				},
			},
		] )(
			'should call updateElementSettings when $scenario',
			( { propKeyToDelete, overridableProps, expectedUpdateCall, expectedDispatch } ) => {
				// Arrange
				mockState.data[ 0 ].overridableProps = overridableProps as OverridableProps;

				// Act
				deleteOverridableProp( { componentId: COMPONENT_ID, propKey: propKeyToDelete } );

				// Assert
				expect( mockUpdateElementSettings ).toHaveBeenCalledWith(
					expect.objectContaining( expectedUpdateCall )
				);
				expect( dispatch ).toHaveBeenCalledWith( {
					type: `${ SLICE_NAME }/setOverridableProps`,
					payload: {
						componentId: COMPONENT_ID,
						overridableProps: expectedDispatch,
					},
				} );
			}
		);

		it( 'should not call updateElementSettings when prop key does not exist in store', () => {
			// Arrange
			mockState.data[ 0 ].overridableProps = {
				props: {
					[ OVERRIDE_KEY_1 ]: createProp( OVERRIDE_KEY_1, PROP_KEY, ORIGIN_VALUE ),
				},
				groups: {
					items: { [ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: [ OVERRIDE_KEY_1 ] } },
					order: [ GROUP_ID ],
				},
			};

			// Act
			deleteOverridableProp( { componentId: COMPONENT_ID, propKey: 'non-existent-key' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
			expect( dispatch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'component widget (e-component)', () => {
		const ELEMENT_ID = 'component-instance-1';
		const KEY_1 = 'key-1';
		const KEY_2 = 'key-2';
		const KEY_3 = 'key-3';

		const createOverride = ( key: string, valueKey: string = key ) =>
			componentInstanceOverridePropTypeUtil.create( {
				override_key: key,
				override_value: { $$type: 'string', value: `value-${ valueKey }` },
				schema_source: { type: 'component', id: COMPONENT_ID },
			} );

		const createOverridable = ( key: string, innerKey: string = `inner-${ key }` ) =>
			componentOverridablePropTypeUtil.create( {
				override_key: key,
				origin_value: createOverride( innerKey ),
			} );

		const createStoreProp = ( key: string ) =>
			createOverridableProp( { overrideKey: key, elementId: ELEMENT_ID, isComponent: true } );

		it.each( [
			{
				scenario: 'overridable is converted to simple override',
				propKeyToDelete: KEY_1,
				initialOverrides: [ createOverridable( KEY_1 ), createOverride( KEY_2 ), createOverridable( KEY_3 ) ],
				storeProps: [ KEY_1, KEY_2, KEY_3 ],
				expectedOverrides: [
					createOverride( KEY_1, `inner-${ KEY_1 }` ),
					createOverride( KEY_2 ),
					createOverridable( KEY_3 ),
				],
				expectedStoreProps: [ KEY_2, KEY_3 ],
			},
			{
				scenario: 'simple override is left unchanged',
				propKeyToDelete: KEY_2,
				initialOverrides: [ createOverridable( KEY_1 ), createOverride( KEY_2 ), createOverridable( KEY_3 ) ],
				storeProps: [ KEY_1, KEY_2, KEY_3 ],
				expectedOverrides: [ createOverridable( KEY_1 ), createOverride( KEY_2 ), createOverridable( KEY_3 ) ],
				expectedStoreProps: [ KEY_1, KEY_3 ],
			},
			{
				scenario: 'prop key does not exist in store - no changes',
				propKeyToDelete: 'non-existent-key',
				initialOverrides: [ createOverridable( KEY_1 ), createOverride( KEY_2 ) ],
				storeProps: [ KEY_1, KEY_2 ],
				expectedOverrides: null,
				expectedStoreProps: null,
			},
		] )(
			'should handle $scenario',
			( { propKeyToDelete, initialOverrides, storeProps, expectedOverrides, expectedStoreProps } ) => {
				// Arrange
				const storePropsByKey = Object.fromEntries( storeProps.map( ( k ) => [ k, createStoreProp( k ) ] ) );

				const componentInstanceSetting = componentInstancePropTypeUtil.create( {
					component_id: numberPropTypeUtil.create( COMPONENT_ID ),
					overrides: componentInstanceOverridesPropTypeUtil.create( initialOverrides ),
				} );

				mockState.data[ 0 ].overridableProps = {
					props: storePropsByKey,
					groups: {
						items: {
							[ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: storeProps },
						},
						order: [ GROUP_ID ],
					},
				};

				const mockComponentElement = createMockElement( {
					model: { id: ELEMENT_ID, widgetType: 'e-component', elType: 'widget' },
					settings: { component_instance: componentInstanceSetting },
				} );

				mockGetContainer.mockReturnValue( mockComponentElement );
				mockGetElementSetting.mockReturnValue( componentInstanceSetting );

				// Act
				deleteOverridableProp( { componentId: COMPONENT_ID, propKey: propKeyToDelete } );

				// Assert
				if ( ! expectedStoreProps ) {
					expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
					expect( dispatch ).not.toHaveBeenCalled();
					return;
				}

				expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
					id: ELEMENT_ID,
					props: {
						component_instance: componentInstancePropTypeUtil.create( {
							component_id: numberPropTypeUtil.create( COMPONENT_ID ),
							overrides: componentInstanceOverridesPropTypeUtil.create( expectedOverrides ?? [] ),
						} ),
					},
					withHistory: false,
				} );

				const expectedDispatchProps = Object.fromEntries(
					expectedStoreProps.map( ( k ) => [ k, createStoreProp( k ) ] )
				);
				expect( dispatch ).toHaveBeenCalledWith( {
					type: `${ SLICE_NAME }/setOverridableProps`,
					payload: {
						componentId: COMPONENT_ID,
						overridableProps: {
							props: expectedDispatchProps,
							groups: {
								items: {
									[ GROUP_ID ]: { id: GROUP_ID, label: 'Content', props: expectedStoreProps },
								},
								order: [ GROUP_ID ],
							},
						},
					},
				} );
			}
		);
	} );
} );

type CreateOverridablePropArgs = {
	overrideKey: string;
	propKey?: string;
	originValue?: OverridableProp[ 'originValue' ];
	elementId: string;
	isComponent?: boolean;
};

function createOverridableProp( {
	overrideKey,
	propKey,
	originValue,
	elementId,
	isComponent = false,
}: CreateOverridablePropArgs ): OverridableProp {
	const GROUP_ID = 'group-1';

	return {
		overrideKey,
		label: `Label for ${ overrideKey }`,
		propKey: propKey ?? overrideKey,
		elementId,
		widgetType: isComponent ? 'e-component' : 'e-heading',
		elType: 'widget',
		originValue: isComponent ? undefined : originValue,
		groupId: GROUP_ID,
	};
}
