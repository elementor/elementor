import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';
import { __createStore, __dispatch, __getState as getState, __registerSlice } from '@elementor/store';

import { selectUnpublishedComponents, slice } from '../../store/store';
import { handleCreatedComponents } from '../handle-created-components';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-notifications' );

const mockNotify = jest.mocked( notify );

const mockUpdateElementSettings = jest.mocked( updateElementSettings );

const COMPONENT_1_UID = 'component-1763032631845-jlu78sd';
const COMPONENT_2_UID = 'component-1763032631846-jlu78sdz';
const COMPONENT_1_ID = 1111;
const COMPONENT_2_ID = 3333;

describe( 'handleCreatedComponents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();
	} );

	describe( 'store updates', () => {
		it( 'should add newly created components to the main component store', () => {
			// Arrange
			const mockElements: V1ElementData[] = [ { id: '1', elType: 'widget', widgetType: 'button' } ];

			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component 1',
					elements: mockElements,
				} )
			);
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_2_UID,
					name: 'Test Component 2',
					elements: mockElements,
				} )
			);

			const result = {
				success: {
					[ COMPONENT_1_UID ]: COMPONENT_1_ID,
					[ COMPONENT_2_UID ]: COMPONENT_2_ID,
				},
				failed: [],
			};

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			const components = getState().components.data;
			expect( components ).toContainEqual(
				expect.objectContaining( { id: COMPONENT_1_ID, name: 'Test Component 1', uid: COMPONENT_1_UID } )
			);
			expect( components ).toContainEqual(
				expect.objectContaining( { id: COMPONENT_2_ID, name: 'Test Component 2', uid: COMPONENT_2_UID } )
			);
		} );

		it( 'should preserve overridableProps when adding components', () => {
			// Arrange
			const overridableProps = {
				props: {
					prop1: {
						overrideKey: 'key1',
						label: 'Prop 1',
						elementId: 'element-1',
						propKey: 'text',
						elType: 'widget',
						widgetType: 'e-heading',
						originValue: { $$type: 'string', value: 'test' },
						groupId: 'group-1',
					},
				},
				groups: { items: {}, order: [] },
			};

			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
					overridableProps,
				} )
			);

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			const components = getState().components.data;
			expect( components ).toContainEqual(
				expect.objectContaining( {
					id: COMPONENT_1_ID,
					overridableProps,
				} )
			);
		} );

		it( 'should clear all unpublished components from store after handling', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component 1',
					elements: [],
				} )
			);
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_2_UID,
					name: 'Test Component 2',
					elements: [],
				} )
			);

			expect( selectUnpublishedComponents( getState() ) ).toHaveLength( 2 );

			const result = {
				success: {
					[ COMPONENT_1_UID ]: COMPONENT_1_ID,
					[ COMPONENT_2_UID ]: COMPONENT_2_ID,
				},
				failed: [],
			};

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [] );
		} );

		it( 'should not add components that were not in the created response', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component 1',
					elements: [],
				} )
			);
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_2_UID,
					name: 'Test Component 2',
					elements: [],
				} )
			);

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			const components = getState().components.data;
			expect( components ).toHaveLength( 1 );
			expect( components[ 0 ].uid ).toBe( COMPONENT_1_UID );
		} );
	} );

	describe( 'component instance updates', () => {
		it( 'should replace temporary component IDs with actual IDs from server response', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const elements: V1ElementData[] = [
				{
					id: 'element-1',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: {
							$$type: 'component-instance',
							value: { component_id: { $$type: 'number', value: COMPONENT_1_UID } },
						},
					},
				},
			];

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, elements );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1',
				props: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: COMPONENT_1_ID },
						},
					},
				},
				withHistory: false,
			} );
		} );

		it( 'should update nested component instances', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const elements: V1ElementData[] = [
				{
					id: 'container-1',
					elType: 'container',
					elements: [
						{
							id: 'element-nested',
							elType: 'widget',
							widgetType: 'e-component',
							settings: {
								component_instance: {
									$$type: 'component-instance',
									value: { component_id: { $$type: 'number', value: COMPONENT_1_UID } },
								},
							},
						},
					],
				},
			];

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, elements );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-nested' } )
			);
		} );

		it( 'should not update component instances that already have actual IDs', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const EXISTING_ID = 9999;
			const elements: V1ElementData[] = [
				{
					id: 'element-existing',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: {
							$$type: 'component-instance',
							value: { component_id: { $$type: 'number', value: EXISTING_ID } },
						},
					},
				},
			];

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, elements );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-existing' } )
			);
		} );

		it( 'should skip non-component elements', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const elements: V1ElementData[] = [
				{
					id: 'element-button',
					elType: 'widget',
					widgetType: 'button',
					settings: {},
				},
			];

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, elements );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'should handle empty elements array', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'failure notifications', () => {
		it( 'should notify when some components fail to create', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const result = {
				success: {},
				failed: [
					{ uid: COMPONENT_1_UID, error: 'Creation failed' },
					{ uid: COMPONENT_2_UID, error: 'Another error' },
				],
			};

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			expect( mockNotify ).toHaveBeenCalledWith( {
				type: 'error',
				message: `Failed to create components: ${ COMPONENT_1_UID }, ${ COMPONENT_2_UID }`,
				id: 'failed-created-components-notification',
			} );
		} );

		it( 'should not notify when all components succeed', () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_1_UID,
					name: 'Test Component',
					elements: [],
				} )
			);

			const result = { success: { [ COMPONENT_1_UID ]: COMPONENT_1_ID }, failed: [] };

			// Act
			handleCreatedComponents( result, [] );

			// Assert
			expect( mockNotify ).not.toHaveBeenCalled();
		} );
	} );
} );
