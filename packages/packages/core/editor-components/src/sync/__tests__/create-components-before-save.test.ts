import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { __createStore, __dispatch, __getState as getState, __registerSlice } from '@elementor/store';

import { apiClient } from '../../api';
import { selectUnpublishedComponents, slice } from '../../store/store';
import { createComponentsBeforeSave } from '../create-components-before-save';
import { createMockContainer } from './utils';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );

const mockUpdateElementSettings = jest.mocked( updateElementSettings );
const mockCreateComponents = jest.mocked( apiClient.create );

const COMPONENT_1_UID = 'component-1763032631845-jlu78sd';
const COMPONENT_2_UID = 'component-1763032631846-jlu78sdz';

describe( 'createComponentsBeforeSave', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();
	} );

	const setupUnpublishedComponents = () => {
		__dispatch(
			slice.actions.addUnpublished( {
				uid: COMPONENT_1_UID,
				name: 'Test Component 1',
				elements: mockComponent1Content,
			} )
		);
		__dispatch(
			slice.actions.addUnpublished( {
				uid: COMPONENT_2_UID,
				name: 'Test Component 2',
				elements: mockComponent2Content,
			} )
		);

		mockCreateComponents.mockImplementation( ( payload ) => {
			const map = new Map< string, number >( [
				[ COMPONENT_1_UID, 1111 ],
				[ COMPONENT_2_UID, 3333 ],
			] );

			return Promise.resolve(
				payload.items.reduce< Record< string, number > >( ( acc, item ) => {
					if ( map.has( item.uid ) ) {
						acc[ item.uid ] = map.get( item.uid ) as number;
					}

					return acc;
				}, {} )
			);
		} );
	};

	describe( 'No Unpublished Components', () => {
		it( 'should not update any element settings or make API calls', async () => {
			// Arrange
			const container = createMockContainer();

			// Act
			await createComponentsBeforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockCreateComponents ).not.toHaveBeenCalled();
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Component Publishing', () => {
		beforeEach( () => {
			setupUnpublishedComponents();
		} );

		it( 'should send create requests for unpublished components', async () => {
			// Act
			await createComponentsBeforeSave( { container: createMockContainer(), status: 'publish' } );

			// Assert
			expect( mockCreateComponents ).toHaveBeenCalledTimes( 1 );
			expect( mockCreateComponents ).toHaveBeenCalledWith( {
				status: 'publish',
				items: [
					{
						uid: COMPONENT_2_UID,
						title: 'Test Component 2',
						elements: mockComponent2Content,
					},
					{
						uid: COMPONENT_1_UID,
						title: 'Test Component 1',
						elements: mockComponent1Content,
					},
				],
			} );
		} );

		it( 'should throw error when component update fails', async () => {
			// Arrange
			const container = createMockContainer();
			mockCreateComponents.mockRejectedValue( new Error( 'API Error' ) );

			// Act & Assert
			await expect( createComponentsBeforeSave( { container, status: 'draft' } ) ).rejects.toThrow(
				'Failed to publish components and update component instances'
			);
		} );
	} );

	describe( 'Component Instance Updates - Replacing temporary IDs with actual IDs', () => {
		beforeEach( () => {
			setupUnpublishedComponents();
		} );

		it( 'should replace temporary component IDs with actual IDs from server response', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await createComponentsBeforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1_component-with-temp-id',
				props: {
					component_instance: {
						$$type: 'component-instance',
						value: { component_id: 1111 },
					},
				},
				withHistory: false,
			} );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-3_component-with-temp-id',
				props: {
					component_instance: {
						$$type: 'component-instance',
						value: { component_id: 3333 },
					},
				},
				withHistory: false,
			} );
		} );

		it( 'should not change component instances that already have actual IDs', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await createComponentsBeforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-5_component-with-actual-id' } )
			);
		} );

		it( 'should skip non-component elements', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await createComponentsBeforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-2_not-a-component' } )
			);
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-4_not-a-component' } )
			);
		} );

		it( 'should handle empty elements array', async () => {
			// Arrange
			const container = createMockContainer( [] );

			// Act
			await createComponentsBeforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Handle store state', () => {
		beforeEach( () => {
			setupUnpublishedComponents();
		} );

		it( 'should add newly published components to the main component store', async () => {
			// Arrange
			const publishedComponentUid = 'component-1763032631849-jlu78sd';
			__dispatch(
				slice.actions.add( {
					id: 4444,
					name: 'Published Component',
					uid: publishedComponentUid,
				} )
			);
			const container = createMockContainer( [] );

			// Act
			await createComponentsBeforeSave( { container, status: 'draft' } );

			// Assert
			expect( getState().components.data ).toEqual( [
				{ id: 4444, name: 'Published Component', uid: publishedComponentUid },
				{ id: 3333, name: 'Test Component 2', uid: COMPONENT_2_UID },
				{ id: 1111, name: 'Test Component 1', uid: COMPONENT_1_UID },
			] );
		} );

		it( 'should clear all unpublished components from store after successful save', async () => {
			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [
				{ uid: COMPONENT_2_UID, name: 'Test Component 2', elements: mockComponent2Content },
				{ uid: COMPONENT_1_UID, name: 'Test Component 1', elements: mockComponent1Content },
			] );

			// Act
			await createComponentsBeforeSave( { container: createMockContainer(), status: 'draft' } );

			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [] );
		} );
	} );
} );

const mockComponent1Content: V1ElementData[] = [
	{
		id: 'element-1_component-1',
		elType: 'widget',
		widgetType: 'button',
		settings: {
			text: {
				$$type: 'string',
				value: 'Click Me!',
			},
		},
	},
];

const mockComponent2Content: V1ElementData[] = [
	{
		id: 'element-2_component-2',
		elType: 'widget',
		widgetType: 'heading',
		settings: {
			title: {
				$$type: 'string',
				value: 'This is a heading',
			},
		},
	},
];

const mockPageElements: V1ElementData[] = [
	{
		id: 'element-1_component-with-temp-id',
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_instance: {
				$$type: 'component-instance',
				value: { component_id: COMPONENT_1_UID },
			},
		},
	},
	{
		id: 'element-2_not-a-component',
		elType: 'container',
		elements: [
			{
				id: 'element-3_component-with-temp-id',
				elType: 'widget',
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: { component_id: COMPONENT_2_UID },
					},
				},
			},
			{
				id: 'element-4_not-a-component',
				elType: 'widget',
				widgetType: 'e-button',
				settings: {
					text: {
						$$type: 'string',
						value: 'Click Me!',
					},
				},
			},
		],
	},
	{
		id: 'element-5_component-with-actual-id',
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_instance: {
				$$type: 'component-instance',
				value: { component_id: 4444 },
			},
		},
	},
];
