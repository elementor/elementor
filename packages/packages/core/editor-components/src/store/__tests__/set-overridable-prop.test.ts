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
	const SET_COMPONENT_ID = 1;
	const SET_ELEMENT_ID = 'element-1';
	const SET_PROP_KEY = 'text';
	const SET_WIDGET_TYPE = 'button';
	const LABEL = 'Button Text';
	const DEFAULT_VALUE = 'Click me';
	const GROUP_ID_1 = 'group-1';
	const GROUP_ID_2 = 'group-2';
	const EXISTING_OVERRIDE_KEY = 'override-1';
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
					id: SET_COMPONENT_ID,
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
						'override-key': GENERATED_ID_2,
						label: LABEL,
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: DEFAULT_VALUE,
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
			should: 'add a new prop to an existing group with existing overridable props',
			initialOverrides: {
				props: {
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Existing Label',
						elementId: 'element-0',
						propKey: 'color',
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'red',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'My Group',
							props: [ EXISTING_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: LABEL,
				groupId: GROUP_ID_1,
			},
			expectedDispatch: {
				props: {
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Existing Label',
						elementId: 'element-0',
						propKey: 'color',
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'red',
						groupId: GROUP_ID_1,
					},
					[ GENERATED_ID_1 ]: {
						'override-key': GENERATED_ID_1,
						label: LABEL,
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: DEFAULT_VALUE,
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'My Group',
							props: [ EXISTING_OVERRIDE_KEY, GENERATED_ID_1 ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
		},
		{
			should: 'maintain the same override-key when adding a prop that already exists',
			initialOverrides: {
				props: {
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Old Label',
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'Old value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ EXISTING_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: 'Updated Label',
				groupId: GROUP_ID_1,
				defaultValue: 'Updated value',
			},
			expectedDispatch: {
				props: {
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Updated Label',
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'Updated value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ EXISTING_OVERRIDE_KEY ],
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
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: LABEL,
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: DEFAULT_VALUE,
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ EXISTING_OVERRIDE_KEY ],
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
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: LABEL,
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: DEFAULT_VALUE,
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
							props: [ EXISTING_OVERRIDE_KEY ],
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
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Existing Label',
						elementId: 'element-0',
						propKey: 'color',
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'red',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ EXISTING_OVERRIDE_KEY ],
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
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Existing Label',
						elementId: 'element-0',
						propKey: 'color',
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'red',
						groupId: GROUP_ID_1,
					},
					[ GENERATED_ID_1 ]: {
						'override-key': GENERATED_ID_1,
						label: LABEL,
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: DEFAULT_VALUE,
						groupId: GROUP_ID_2,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Group 1',
							props: [ EXISTING_OVERRIDE_KEY ],
						},
						[ GROUP_ID_2 ]: {
							id: GROUP_ID_2,
							label: 'Default',
							props: [ GENERATED_ID_1 ],
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
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Existing Label',
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'Old value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Existing Group',
							props: [ EXISTING_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
			callParams: {
				label: 'Updated Label',
				groupId: null,
				defaultValue: 'Updated value',
			},
			expectedDispatch: {
				props: {
					[ EXISTING_OVERRIDE_KEY ]: {
						'override-key': EXISTING_OVERRIDE_KEY,
						label: 'Updated Label',
						elementId: SET_ELEMENT_ID,
						propKey: SET_PROP_KEY,
						widgetType: SET_WIDGET_TYPE,
						defaultValue: 'Updated value',
						groupId: GROUP_ID_1,
					},
				},
				groups: {
					items: {
						[ GROUP_ID_1 ]: {
							id: GROUP_ID_1,
							label: 'Existing Group',
							props: [ EXISTING_OVERRIDE_KEY ],
						},
					},
					order: [ GROUP_ID_1 ],
				},
			},
		},
	] )( 'should $should', ( { initialOverrides, callParams, expectedDispatch, expectNoIdGeneration } ) => {
		// Arrange
		if ( initialOverrides ) {
			mockState.data[ 0 ].overrides = initialOverrides;
		}

		// Act
		setOverridableProp(
			SET_COMPONENT_ID,
			SET_ELEMENT_ID,
			callParams.label,
			callParams.groupId,
			SET_PROP_KEY,
			SET_WIDGET_TYPE,
			callParams.defaultValue ?? DEFAULT_VALUE
		);

		// Assert
		expect( dispatch ).toHaveBeenCalledWith( {
			type: `${ SLICE_NAME }/setOverridableProps`,
			payload: {
				componentId: SET_COMPONENT_ID,
				overrides: expectedDispatch,
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
		setOverridableProp(
			SET_COMPONENT_ID,
			SET_ELEMENT_ID,
			LABEL,
			null,
			SET_PROP_KEY,
			SET_WIDGET_TYPE,
			DEFAULT_VALUE
		);

		// Assert
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
