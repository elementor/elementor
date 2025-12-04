import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';

import type { PublishedComponent } from '../../types';
import { setOverridableProp } from '../set-overridable-prop';
import { SLICE_NAME } from '../store';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	generateUniqueId: jest.fn(),
} ) );

describe( 'setOverridableProp', () => {
	const MOCK_COMPONENT_ID = 1;
	const MOCK_WIDGET_ID = 'widget-1';
	const MOCK_PROP_KEY = 'text';
	const MOCK_WIDGET_TYPE = 'button';
	const MOCK_EL_TYPE = 'widget';
	const MOCK_WIDGET = {
		elementId: MOCK_WIDGET_ID,
		widgetType: MOCK_WIDGET_TYPE,
		elType: MOCK_EL_TYPE,
	};
	const LABEL = 'Button Text';
	const ORIGIN_VALUE = 'Click me';
	const GROUP_ID_1 = 'group-1';
	const GROUP_ID_2 = 'group-2';
	const MOCK_OVERRIDE_KEY = 'override-1';
	const GENERATED_ID_1 = 'generated-1';
	const GENERATED_ID_2 = 'generated-2';

	let mockState: { data: PublishedComponent[] };
	let idCounter: number;

	beforeEach( () => {
		jest.clearAllMocks();
		idCounter = 0;

		mockState = {
			data: [
				{
					id: MOCK_COMPONENT_ID,
					uid: 'comp-uid',
					name: 'Test Component',
				},
			],
		};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: mockState,
		} ) );

		jest.mocked( generateUniqueId ).mockImplementation( () => {
			idCounter++;
			return `generated-${ idCounter }`;
		} );
	} );

	it.each( [
		{
			should: 'add a new prop to an empty overridable props map with default group',
			initialOverrides: undefined,
			callParams: {
				label: LABEL,
				groupId: null,
			},
			expectedDispatch: {
				props: {
					[ GENERATED_ID_2 ]: {
						overrideKey: GENERATED_ID_2,
						label: LABEL,
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: ORIGIN_VALUE,
						groupId: GENERATED_ID_1,
					},
				},
				groups: {
					items: {
						[ GENERATED_ID_1 ]: {
							id: GENERATED_ID_1,
							label: 'Default',
							props: [ GENERATED_ID_2 ],
						},
					},
					order: [ GENERATED_ID_1 ],
				},
			},
		},
		{
			should: 'maintain the same override-key when adding a prop that already exists',
			initialOverrides: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: 'Old Label',
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: 'Old value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: 'Updated Label',
				groupId: GROUP_ID_1,
				originalValue: 'Updated value',
			},
			expectedDispatch: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: 'Updated Label',
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: 'Updated value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			expectNoIdGeneration: true,
		},
		{
			should: 'move prop to new group when groupId changes',
			initialOverrides: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: LABEL,
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: ORIGIN_VALUE,
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: LABEL,
				groupId: GROUP_ID_2,
			},
			expectedDispatch: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: LABEL,
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: ORIGIN_VALUE,
						groupId: GROUP_ID_2,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [],
						},
						[ GROUP_ID_2 ]: {
							id: GROUP_ID_2,
							label: 'Default',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1, GROUP_ID_2 ],
				},
			},
		},
		{
			should: 'add a prop to a new group',
			initialOverrides: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: 'Existing Label',
						elementId: 'element-0',
						propKey: 'color',
						widgetType: MOCK_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						originalValue: 'some prior value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: LABEL,
				groupId: GROUP_ID_2,
			},
			expectedDispatch: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: LABEL,
						elementId: MOCK_WIDGET_ID,
						propKey: MOCK_PROP_KEY,
						widgetType: MOCK_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						originalValue: ORIGIN_VALUE,
						groupId: GROUP_ID_2,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [],
						},
						[ GROUP_ID_2 ]: {
							id: GROUP_ID_2,
							label: 'Default',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1, GROUP_ID_2 ],
				},
			},
		},
		{
			should: 'use existing group when prop exists and groupId is null',
			initialOverrides: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: 'Existing Label',
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: 'Old value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Existing Group',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: 'Updated Label',
				groupId: null,
				originalValue: 'Updated value',
			},
			expectedDispatch: {
				props: {
					[ MOCK_OVERRIDE_KEY ]: {
						overrideKey: MOCK_OVERRIDE_KEY,
						label: 'Updated Label',
						propKey: MOCK_PROP_KEY,
						...MOCK_WIDGET,
						originalValue: 'Updated value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Existing Group',
							props: [ MOCK_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
		},
	] )( 'should $should', ( { initialOverrides, callParams, expectedDispatch, expectNoIdGeneration } ) => {
		// Arrange
		if ( initialOverrides ) {
			mockState.data[ 0 ].overridableProps = initialOverrides;
		}

		// Act
		setOverridableProp( {
			componentId: MOCK_COMPONENT_ID,
			overrideKey: MOCK_OVERRIDE_KEY,
			label: callParams.label,
			groupId: callParams.groupId,
			propKey: MOCK_PROP_KEY,
			...MOCK_WIDGET,
			originalValue: callParams.originalValue ?? ORIGIN_VALUE,
		} );

		// Assert
		expect( dispatch ).toHaveBeenCalledWith( {
			type: `${ SLICE_NAME }/setOverridableProps`,
			payload: {
				componentId: MOCK_COMPONENT_ID,
				overridableProps: expectedDispatch,
			},
		} );

		if ( expectNoIdGeneration ) {
			expect( generateUniqueId ).not.toHaveBeenCalled();
		}
	} );

	it( 'should not dispatch when component does not exist', () => {
		// Arrange
		mockState.data = [];

		// Act
		setOverridableProp( {
			componentId: MOCK_COMPONENT_ID,
			overrideKey: null,
			label: LABEL,
			groupId: null,
			propKey: MOCK_PROP_KEY,
			...MOCK_WIDGET,
			originalValue: ORIGIN_VALUE,
		} );

		// Assert
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
