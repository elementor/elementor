import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { __createStore, __dispatch, __getState as getState, __registerSlice } from '@elementor/store';

import { apiClient } from '../../api';
import { selectUnpublishedComponents, slice } from '../../store/store';
import { beforeSave } from '../before-save';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );

const mockUpdateElementSettings = jest.mocked( updateElementSettings );
const mockCreateComponents = jest.mocked( apiClient.create );

const COMPONENT_1_UUID = 'f73880da-522c-442e-815a-b2c9849b7418';
const COMPONENT_2_UUID = 'f73880da-522c-442e-815a-b2c9849b7419';

describe( 'beforeSave', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();
	} );

	const createMockContainer = ( elements: V1ElementData[] = [] ) => ( {
		model: {
			get: () => ( {
				toJSON: () => elements,
			} ),
		},
	} );

	const setupUnpublishedComponents = () => {
		__dispatch(
			slice.actions.addUnpublished( {
				uuid: COMPONENT_1_UUID,
				name: 'Test Component 1',
				elements: mockComponent1Content,
			} )
		);
		__dispatch(
			slice.actions.addUnpublished( {
				uuid: COMPONENT_2_UUID,
				name: 'Test Component 2',
				elements: mockComponent2Content,
			} )
		);

		mockCreateComponents.mockImplementation( ( payload ) => {
			const map = new Map< string, number >( [
				[ COMPONENT_1_UUID, 1111 ],
				[ COMPONENT_2_UUID, 3333 ],
			] );

			return Promise.resolve(
				payload.items.reduce< Record< string, number > >( ( acc, item ) => {
					if ( map.has( item.uuid ) ) {
						acc[ item.uuid ] = map.get( item.uuid ) as number;
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
			await beforeSave( { container, status: 'draft' } );

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
			await beforeSave( { container: createMockContainer(), status: 'publish' } );

			// Assert
			expect( mockCreateComponents ).toHaveBeenCalledTimes( 1 );
			expect( mockCreateComponents ).toHaveBeenCalledWith( {
				status: 'publish',
				items: [
					{
						uuid: COMPONENT_2_UUID,
						title: 'Test Component 2',
						elements: mockComponent2Content,
					},
					{
						uuid: COMPONENT_1_UUID,
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
			await expect( beforeSave( { container, status: 'draft' } ) ).rejects.toThrow(
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
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1_component-with-temp-id',
				props: {
					component: {
						$$type: 'component-id',
						value: 1111,
					},
				},
				withHistory: false,
			} );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-3_component-with-temp-id',
				props: {
					component: {
						$$type: 'component-id',
						value: 3333,
					},
				},
				withHistory: false,
			} );
		} );

		it( 'should not change component instances that already have actual IDs', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-5_component-with-actual-id' } )
			);
		} );

		it( 'should skip non-component elements', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

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
			await beforeSave( { container, status: 'draft' } );

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
			const publishedComponentUUID = 'f73880da-522c-442e-815a-b2c9849b7421';
			__dispatch(
				slice.actions.add( {
					id: 4444,
					name: 'Published Component',
					uuid: publishedComponentUUID,
				} )
			);
			const container = createMockContainer( [] );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( getState().components.data ).toEqual( [
				{ id: 4444, name: 'Published Component', uuid: publishedComponentUUID },
				{ id: 3333, name: 'Test Component 2', uuid: COMPONENT_2_UUID },
				{ id: 1111, name: 'Test Component 1', uuid: COMPONENT_1_UUID },
			] );
		} );

		it( 'should clear all unpublished components from store after successful save', async () => {
			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [
				{ uuid: COMPONENT_2_UUID, name: 'Test Component 2', elements: mockComponent2Content },
				{ uuid: COMPONENT_1_UUID, name: 'Test Component 1', elements: mockComponent1Content },
			] );

			// Act
			await beforeSave( { container: createMockContainer(), status: 'draft' } );

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
			component: {
				$$type: 'component-id',
				value: COMPONENT_1_UUID,
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
					component: {
						$$type: 'component-id',
						value: COMPONENT_2_UUID,
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
			component: {
				$$type: 'component-id',
				value: 4444,
			},
		},
	},
];
